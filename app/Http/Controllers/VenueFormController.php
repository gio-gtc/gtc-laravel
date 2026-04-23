<?php

namespace App\Http\Controllers;

use App\Models\FormSubmission;
use App\Models\Venue;
use App\Rules\JsonSchemaRule;
use App\Support\ItemCatalogGuard;
use App\Support\SchemaResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VenueFormController extends Controller
{
    public function __construct(private SchemaResolver $resolver) {}

    /**
     * Schema endpoint for the modal. Returns the resolved blocks + JSON Schema
     * the modal needs to render, plus the pre-signed upload scope so uploads
     * and the subsequent submission reconcile against the same cache entry.
     */
    public function show(Request $request, Venue $venue): JsonResponse
    {
        $resolution = $this->resolver->resolve($venue, $request->boolean('omit_file_fields'));

        return response()->json([
            'venue' => [
                'id' => $venue->id,
                'name' => $venue->name,
                'slug' => $venue->slug,
                'mock_venue_id' => $venue->mock_venue_id,
                'attributes' => $venue->attributes ?? [],
            ],
            'blocks' => $resolution->blocks,
            'jsonSchema' => $resolution->jsonSchema,
            'submitAction' => route('venue.form.store', $venue),
            'uploadAction' => route('uploads.store'),
            'scope' => 'session:'.session()->getId(),
        ]);
    }

    public function store(Request $request, Venue $venue): JsonResponse
    {
        $request->validate([
            'omit_file_fields' => ['sometimes', 'boolean'],
            'order_id' => ['nullable', 'integer'],
            'tour_venue_id' => ['nullable', 'integer'],
            'scope' => ['nullable', 'string', 'max:128'],
        ]);

        $omitFileFields = $request->boolean('omit_file_fields');
        $resolution = $this->resolver->resolve($venue, $omitFileFields);
        $rawAnswers = (array) $request->input('answers', []);

        $runtimeSchema = $this->resolver->applyConditions(
            $resolution->jsonSchema,
            $resolution->blocks,
            $rawAnswers,
        );

        $request->validate([
            'answers' => ['required', 'array', new JsonSchemaRule($runtimeSchema)],
        ]);

        $this->assertItemsWhitelisted($resolution->blocks, $rawAnswers);
        // Prefer the scope echoed back from the client (set on GET) so uploads and
        // submissions reconcile even when the underlying session driver doesn't
        // persist ids (e.g. array driver in tests). Fall back to the live session.
        $submittedScope = (string) $request->input('scope', '');
        $scope = $submittedScope !== '' ? $submittedScope : 'session:'.session()->getId();
        $this->assertFilesIssued($rawAnswers, $scope);

        $submission = DB::transaction(function () use ($venue, $resolution, $rawAnswers, $request) {
            $venueScopeUpdates = $this->splitVenueScopeAnswers($resolution->fieldIndex, $rawAnswers);
            if ($venueScopeUpdates) {
                $venue->attributes = array_replace($venue->attributes ?? [], $venueScopeUpdates);
                $venue->save();
            }

            return FormSubmission::create([
                'form_template_id' => $venue->venueForm->form_template_id,
                'venue_id' => $venue->id,
                'order_id' => $request->input('order_id'),
                'tour_venue_id' => $request->input('tour_venue_id'),
                'user_id' => $request->user()?->id,
                'answers' => $rawAnswers,
                'meta' => [
                    'ip' => $request->ip(),
                    'ua' => (string) $request->userAgent(),
                ],
                'submitted_at' => now(),
            ]);
        });

        return response()->json([
            'status' => 'ok',
            'submission_id' => $submission->id,
        ]);
    }

    /**
     * @param  array<int, array<string, mixed>>  $blocks
     * @param  array<string, mixed>  $answers
     */
    private function assertItemsWhitelisted(array $blocks, array $answers): void
    {
        $violations = ItemCatalogGuard::findUnknownItemKeys($blocks, $answers);
        if ($violations === []) {
            return;
        }
        $errors = [];
        foreach ($violations as [$dot, $key]) {
            $errors['answers.'.$dot] = "Item key `{$key}` is not enabled for this venue.";
        }
        abort(response()->json(['message' => 'Validation failed.', 'errors' => $errors], 422));
    }

    /**
     * @param  array<string, mixed>  $answers
     */
    private function assertFilesIssued(array $answers, string $scopeKey): void
    {
        $paths = ItemCatalogGuard::collectFilePaths($answers);
        $errors = [];
        foreach ($paths as [$dot, $path]) {
            if (! ItemCatalogGuard::isPathIssued($scopeKey, $path)) {
                $errors['answers.'.$dot.'.path'] = 'Uploaded file path is not recognised.';
            }
        }
        if ($errors !== []) {
            abort(response()->json(['message' => 'Validation failed.', 'errors' => $errors], 422));
        }
    }

    /**
     * Promote fields marked `scope: "venue"` in the resolved field index into
     * a flat array of key/value pairs that the controller merges into
     * `venues.attributes`.
     *
     * @param  array<int, array<string, mixed>>  $fieldIndex
     * @param  array<string, mixed>  $answers
     * @return array<string, mixed>
     */
    private function splitVenueScopeAnswers(array $fieldIndex, array $answers): array
    {
        $out = [];
        foreach ($fieldIndex as $entry) {
            if (($entry['scope'] ?? 'submission') !== 'venue') {
                continue;
            }
            $dot = $entry['block_key'].'.'.$entry['field_key'];
            $value = data_get($answers, $dot);
            if ($value === null) {
                continue;
            }
            $out[$entry['field_key']] = $value;
        }

        return $out;
    }
}

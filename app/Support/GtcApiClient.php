<?php

namespace App\Support;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Server-side HTTP client for gtc-api (session token, JSON envelope).
 */
final class GtcApiClient
{
    public function __construct(
        private readonly ?string $token,
        private readonly string $baseUrl,
    ) {}

    public static function fromRequest(Request $request): ?self
    {
        $token = $request->session()->get('api_token');

        if (! is_string($token) || $token === '') {
            return null;
        }

        $baseUrl = rtrim((string) config('services.api.base_url'), '/');

        return new self($token, $baseUrl);
    }

    /**
     * @param  array<string, mixed>  $query
     * @return array{ok: true, data: array<string, mixed>}|array{ok: false, message: string, status: int}
     */
    public function get(string $path, array $query = []): array
    {
        $response = $this->request()->get($this->url($path), $query);

        return $this->interpret($response, $path);
    }

    /**
     * @param  array<string, mixed>  $body
     * @return array{ok: true, data: array<string, mixed>}|array{ok: false, message: string, status: int}
     */
    public function post(string $path, array $body): array
    {
        $response = $this->request()->post($this->url($path), $body);

        return $this->interpret($response, $path);
    }

    /**
     * @param  array<string, mixed>  $body
     * @return array{ok: true, data: array<string, mixed>}|array{ok: false, message: string, status: int}
     */
    public function patch(string $path, array $body): array
    {
        $response = $this->request()->patch($this->url($path), $body);

        return $this->interpret($response, $path);
    }

    /**
     * @return array{ok: true, data: array<string, mixed>}|array{ok: false, message: string, status: int}
     */
    public function delete(string $path): array
    {
        $response = $this->request()->delete($this->url($path));

        return $this->interpret($response, $path);
    }

    /**
     * Unwrap successful JSON: prefers root "data", then legacy top-level resource keys.
     *
     * @return array<int, mixed>|array<string, mixed>|null
     */
    public static function unwrapList(mixed $body, string $listKey): ?array
    {
        if (! is_array($body)) {
            return null;
        }

        $data = $body['data'] ?? null;

        if (is_array($data)) {
            if (isset($data[$listKey]) && is_array($data[$listKey])) {
                return $data[$listKey];
            }

            if (array_is_list($data)) {
                return $data;
            }
        }

        if (isset($body[$listKey]) && is_array($body[$listKey])) {
            return $body[$listKey];
        }

        return null;
    }

    /**
     * @return array{ok: true, data: array<string, mixed>}|array{ok: false, message: string, status: int}
     */
    private function interpret(Response $response, string $path): array
    {
        if ($response->successful()) {
            $json = $response->json();

            return [
                'ok' => true,
                'data' => is_array($json) ? $json : [],
            ];
        }

        $message = $response->json('message');
        $errorMessage = is_string($message) && $message !== ''
            ? $message
            : 'Could not complete the request. Please try again.';

        Log::error('gtc-api request failed', [
            'path' => $path,
            'status' => $response->status(),
            'body' => $response->body(),
        ]);

        $json = $response->json();

        return [
            'ok' => false,
            'message' => $errorMessage,
            'status' => $response->status(),
            'data' => is_array($json) ? $json : [],
        ];
    }

    private function request(): PendingRequest
    {
        return Http::withToken($this->token)->acceptJson();
    }

    private function url(string $path): string
    {
        return $this->baseUrl.'/'.ltrim($path, '/');
    }
}

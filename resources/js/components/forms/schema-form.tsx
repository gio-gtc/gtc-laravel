import { blockRegistry } from '@/components/forms/blocks/registry';
import { Button } from '@/components/ui/button';
import Divider from '@/components/utils/divider';
import { evalRule, type ConditionRule } from '@/lib/forms/conditions';
import { getCsrfHeaders } from '@/lib/forms/csrf';
import type {
    AnswersMap,
    BlockDescriptor,
    BlockValue,
    VenueFormSchemaResponse,
} from '@/types/forms';
import {
    Fragment,
    forwardRef,
    useCallback,
    useImperativeHandle,
    useMemo,
    useState,
    type Ref,
} from 'react';

export interface SchemaFormHandle {
    submit: () => void;
    isProcessing: () => boolean;
}

export interface SchemaFormProps extends VenueFormSchemaResponse {
    /** Hide the inline submit button (used when the modal owns the primary action). */
    hideSubmit?: boolean;
    /** Extra fields merged into the POST payload alongside `answers`, `scope`. */
    extraPayload?: Record<string, unknown>;
    /** Called after a successful submission. */
    onSuccess?: () => void;
    /** Called when the request returns validation errors. */
    onError?: (errors: Record<string, string>) => void;
    /** When true, render a {@link Divider} between each visible block (not before the first). */
    separateBlocksWithDivider?: boolean;
}

/**
 * Top-level form runtime. Owns a local answers map keyed by
 * `answers[block_key] = BlockValue`, iterates `blocks`, evaluates block-level
 * `visibleIf`, and funnels Laravel validation errors
 * (`answers.<block>.<field>...`) into each block renderer.
 *
 * Submission goes through {@link router.post} with `preserveState`/`preserveScroll`
 * so the host page (e.g. the orders slideout) is not replaced on success.
 */
function SchemaFormInner(
    {
        blocks,
        submitAction,
        uploadAction,
        scope,
        venue,
        hideSubmit,
        extraPayload,
        onSuccess,
        onError,
        separateBlocksWithDivider = false,
    }: SchemaFormProps,
    ref: Ref<SchemaFormHandle>,
) {
    const initialAnswers = useMemo<AnswersMap>(
        () => seedAnswers(blocks),
        [blocks],
    );
    const [answers, setAnswers] = useState<AnswersMap>(initialAnswers);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const setBlockValue = useCallback(
        (blockKey: string) => (next: BlockValue) => {
            setAnswers((prev) => ({ ...prev, [blockKey]: next }));
        },
        [],
    );

    const errorsByBlock = useMemo(() => groupErrorsByBlock(errors), [errors]);

    const visibleBlocks = useMemo(
        () =>
            blocks.filter((b) =>
                evalRule(
                    getBlockCondition(b),
                    answers as Record<string, unknown>,
                ),
            ),
        [answers, blocks],
    );

    const submit = useCallback(async () => {
        if (processing) return;
        setProcessing(true);
        setErrors({});
        try {
            const res = await fetch(submitAction, {
                method: 'POST',
                headers: getCsrfHeaders(),
                credentials: 'same-origin',
                body: JSON.stringify({
                    answers,
                    scope,
                    ...(extraPayload ?? {}),
                }),
            });

            if (res.ok) {
                onSuccess?.();
                return;
            }

            if (res.status === 422) {
                const body = (await res.json().catch(() => ({}))) as {
                    errors?: Record<string, string | string[]>;
                };
                const normalized: Record<string, string> = {};
                for (const [k, v] of Object.entries(body.errors ?? {})) {
                    normalized[k] = Array.isArray(v) ? v.join('; ') : String(v);
                }
                setErrors(normalized);
                onError?.(normalized);
                return;
            }

            const fallback = {
                __form: `Request failed with status ${res.status}.`,
            };
            setErrors(fallback);
            onError?.(fallback);
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'Network error.';
            const normalized = { __form: message };
            setErrors(normalized);
            onError?.(normalized);
        } finally {
            setProcessing(false);
        }
    }, [
        answers,
        extraPayload,
        onError,
        onSuccess,
        processing,
        scope,
        submitAction,
    ]);

    useImperativeHandle(
        ref,
        () => ({ submit, isProcessing: () => processing }),
        [submit, processing],
    );

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                submit();
            }}
            className="space-y-6"
        >
            {venue?.name ? (
                <header className="space-y-1">
                    <h2 className="text-xl font-semibold">{venue.name}</h2>
                    <p className="text-sm text-muted-foreground">
                        Fill out the marketing asset request.
                    </p>
                </header>
            ) : null}

            {errors.__form ? (
                <p className="text-sm text-destructive" role="alert">
                    {errors.__form}
                </p>
            ) : null}

            {visibleBlocks.map((block, index) => {
                const Renderer = blockRegistry[block.kind];
                return (
                    <Fragment key={block.key}>
                        {separateBlocksWithDivider && index > 0 ? (
                            <Divider />
                        ) : null}
                        {!Renderer ? (
                            <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                                Unknown block kind: <code>{block.kind}</code>
                            </div>
                        ) : (
                            <Renderer
                                block={block}
                                value={answers[block.key]}
                                allValues={answers}
                                onChange={setBlockValue(block.key)}
                                errors={errorsByBlock[block.key] ?? {}}
                                uploadAction={uploadAction}
                                scope={scope}
                            />
                        )}
                    </Fragment>
                );
            })}

            {hideSubmit ? null : (
                <div className="flex items-center justify-end gap-2 pt-4">
                    <Button type="submit" disabled={processing}>
                        {processing ? 'Submitting…' : 'Submit'}
                    </Button>
                </div>
            )}
        </form>
    );
}

export const SchemaForm = forwardRef<SchemaFormHandle, SchemaFormProps>(
    SchemaFormInner,
);
SchemaForm.displayName = 'SchemaForm';

function seedAnswers(blocks: BlockDescriptor[]): AnswersMap {
    const out: AnswersMap = {};
    for (const b of blocks) {
        switch (b.kind) {
            case 'item_list': {
                const val: Record<string, unknown> = { selected: [] };
                for (const embedKey of Object.keys(b.embeds ?? {})) {
                    val[embedKey] = { presets: [], custom: [] };
                }
                out[b.key] = val as BlockValue;
                break;
            }
            case 'cta_selector':
                out[b.key] = { presets: [], custom: [] } as BlockValue;
                break;
            case 'custom_sizes':
                out[b.key] = [] as BlockValue;
                break;
            case 'order_info':
            default: {
                const val: Record<string, unknown> = {};
                for (const f of b.fields) {
                    val[f.key] = f.type === 'attachments' ? [] : null;
                }
                out[b.key] = val as BlockValue;
                break;
            }
        }
    }
    return out;
}

function groupErrorsByBlock(
    errors: Record<string, string>,
): Record<string, Record<string, string>> {
    const grouped: Record<string, Record<string, string>> = {};
    for (const [key, message] of Object.entries(errors)) {
        if (!key.startsWith('answers.')) continue;
        const rest = key.slice('answers.'.length);
        const [blockKey, ...tail] = rest.split('.');
        if (!blockKey) continue;
        grouped[blockKey] ??= {};
        grouped[blockKey][tail.join('.') || '__self'] = message;
    }
    return grouped;
}

function getBlockCondition(block: BlockDescriptor): ConditionRule | undefined {
    const raw = (block as unknown as { visibleIf?: ConditionRule }).visibleIf;
    return raw;
}

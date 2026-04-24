import { Checkbox } from '@/components/ui/checkbox';
import {
    ColumnedRowsChild,
    ColumnedRowsParent,
} from '@/components/utils/column-row-layouts';
import Divider from '@/components/utils/divider';
import { cn } from '@/lib/utils';
import type { ItemDescriptor, ItemListBlockValue } from '@/types/forms';
import { useCallback } from 'react';
import { CtaSelectorBlock } from './cta-selector-block';
import type { BlockRendererProps } from './types';

function formatDims(item: ItemDescriptor): string {
    if (item.width == null && item.height == null) {
        return '—';
    }
    return `${item.width ?? '—'} x ${item.height ?? '—'}`;
}

export function ItemListBlock({
    block,
    value,
    allValues,
    onChange,
    errors,
    uploadAction,
    scope,
}: BlockRendererProps) {
    const current = (value as ItemListBlockValue | undefined) ?? {
        selected: [],
    };
    const selected = new Set(current.selected ?? []);

    const toggle = useCallback(
        (key: string) => {
            const next = new Set(selected);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            onChange({ ...current, selected: Array.from(next) });
        },
        [current, onChange, selected],
    );

    const embedEntries = Object.entries(block.embeds ?? {});

    return (
        <section className="bg-card px-4 py-3">
            <div className="mb-3 flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold">{block.name}</h3>
                <span className="text-xs text-muted-foreground">
                    {selected.size}/{block.items.length} selected
                </span>
            </div>

            {block.items.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    No items configured.
                </p>
            ) : (
                <ColumnedRowsParent>
                    <div className="mb-0.5 flex flex-col gap-2 text-muted-foreground sm:flex-row sm:justify-between">
                        <div className="pl-9 text-xs sm:flex-1">Type</div>
                        <div className="pl-0 text-xs sm:flex-2">W x H</div>
                    </div>
                    {block.items.map((item: ItemDescriptor) => {
                        const id = `${block.key}-${item.key}`;
                        const err =
                            errors[
                                `selected.${block.items.findIndex((i) => i.key === item.key)}`
                            ];
                        return (
                            <ColumnedRowsChild
                                key={item.key}
                                labelFor={id}
                                className="items-center"
                                labelContent={
                                    <span className="inline-flex items-center gap-2 font-normal">
                                        <Checkbox
                                            id={id}
                                            checked={selected.has(item.key)}
                                            onCheckedChange={() =>
                                                toggle(item.key)
                                            }
                                        />
                                        <span
                                            className={cn(
                                                err && 'text-destructive',
                                            )}
                                        >
                                            {item.name}
                                        </span>
                                    </span>
                                }
                            >
                                <span className="text-sm text-muted-foreground tabular-nums sm:text-left">
                                    {formatDims(item)}
                                </span>
                            </ColumnedRowsChild>
                        );
                    })}
                </ColumnedRowsParent>
            )}

            {embedEntries.length > 0 ? (
                <div className="mt-4 space-y-4">
                    <Divider className="mb-0" />
                    {embedEntries.map(([propName, embed]) => (
                        <CtaSelectorBlock
                            key={propName}
                            block={embed}
                            value={
                                (current as Record<string, unknown>)[
                                    propName
                                ] as never
                            }
                            allValues={allValues}
                            errors={scopeErrorsToProp(errors, propName)}
                            uploadAction={uploadAction}
                            scope={scope}
                            htmlFieldPrefix={`${block.key}-${propName}`}
                            onChange={(next) => {
                                onChange({ ...current, [propName]: next });
                            }}
                        />
                    ))}
                </div>
            ) : null}

            {errors.__self ? (
                <p className="mt-2 text-sm text-destructive">
                    {Array.isArray(errors.__self)
                        ? errors.__self.join(' · ')
                        : errors.__self}
                </p>
            ) : null}
        </section>
    );
}

function scopeErrorsToProp(
    errors: Record<string, string | string[]>,
    propName: string,
): Record<string, string | string[]> {
    const out: Record<string, string | string[]> = {};
    for (const [k, v] of Object.entries(errors)) {
        if (k === propName) out.__self = v;
        else if (k.startsWith(`${propName}.`))
            out[k.slice(propName.length + 1)] = v;
    }
    return out;
}

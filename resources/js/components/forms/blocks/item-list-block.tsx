import { Checkbox } from '@/components/ui/checkbox';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { ItemDescriptor, ItemListBlockValue } from '@/types/forms';
import { ChevronDown } from 'lucide-react';
import { useCallback, useState } from 'react';
import { CtaSelectorBlock } from './cta-selector-block';
import type { BlockRendererProps } from './types';

export function ItemListBlock({ block, value, allValues, onChange, errors, uploadAction, scope }: BlockRendererProps) {
    const [open, setOpen] = useState(true);

    const current = (value as ItemListBlockValue | undefined) ?? { selected: [] };
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
        <Collapsible open={open} onOpenChange={setOpen} className="rounded-md border bg-card">
            <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                    <span className="text-base font-semibold">{block.name}</span>
                    <span className="text-muted-foreground text-xs">
                        {selected.size}/{block.items.length} selected
                    </span>
                </div>
                <ChevronDown className={cn('h-4 w-4 transition-transform', open ? 'rotate-180' : 'rotate-0')} />
            </CollapsibleTrigger>
            <CollapsibleContent className="border-t px-4 pt-3 pb-4">
                {block.items.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No items configured.</p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-10" />
                                <TableHead>Name</TableHead>
                                <TableHead className="w-24 text-right">Width</TableHead>
                                <TableHead className="w-24 text-right">Height</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {block.items.map((item: ItemDescriptor) => {
                                const id = `${block.key}-${item.key}`;
                                const err = errors[`selected.${block.items.findIndex((i) => i.key === item.key)}`];
                                return (
                                    <TableRow key={item.key}>
                                        <TableCell>
                                            <Checkbox
                                                id={id}
                                                checked={selected.has(item.key)}
                                                onCheckedChange={() => toggle(item.key)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Label htmlFor={id} className={cn('font-normal', err && 'text-destructive')}>
                                                {item.name}
                                            </Label>
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums">
                                            {item.width ?? '—'}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums">
                                            {item.height ?? '—'}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                )}

                {embedEntries.length > 0 ? (
                    <div className="mt-4 space-y-4 border-t pt-4">
                        {embedEntries.map(([propName, embed]) => (
                            <CtaSelectorBlock
                                key={propName}
                                block={embed}
                                value={(current as Record<string, unknown>)[propName] as never}
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
                    <p className="text-destructive mt-2 text-sm">
                        {Array.isArray(errors.__self) ? errors.__self.join(' · ') : errors.__self}
                    </p>
                ) : null}
            </CollapsibleContent>
        </Collapsible>
    );
}

function scopeErrorsToProp(errors: Record<string, string | string[]>, propName: string): Record<string, string | string[]> {
    const out: Record<string, string | string[]> = {};
    for (const [k, v] of Object.entries(errors)) {
        if (k === propName) out.__self = v;
        else if (k.startsWith(`${propName}.`)) out[k.slice(propName.length + 1)] = v;
    }
    return out;
}

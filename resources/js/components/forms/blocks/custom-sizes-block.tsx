import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CustomSizeRow } from '@/types/forms';
import { Plus, X } from 'lucide-react';
import type { BlockRendererProps } from './types';

export function CustomSizesBlock({ block, value, onChange, errors }: BlockRendererProps) {
    const rows = ((value as CustomSizeRow[] | undefined) ?? []) as CustomSizeRow[];

    const emit = (next: CustomSizeRow[]) => onChange(next as unknown as Parameters<typeof onChange>[0]);
    const addRow = () => emit([...rows, { name: '', width: 0, height: 0 }]);
    const setRow = (idx: number, patch: Partial<CustomSizeRow>) =>
        emit(rows.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
    const removeRow = (idx: number) => emit(rows.filter((_, i) => i !== idx));

    return (
        <div className="rounded-md border bg-card px-4 py-3">
            <div className="flex items-center justify-between">
                <p className="text-base font-semibold">{block.name}</p>
                <Button type="button" variant="outline" size="sm" onClick={addRow}>
                    <Plus className="mr-1 h-4 w-4" /> Add size
                </Button>
            </div>
            <div className="mt-3 space-y-2">
                {rows.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No custom sizes added yet.</p>
                ) : (
                    rows.map((row, idx) => {
                        const nameErr = errors[`${idx}.name`];
                        const widthErr = errors[`${idx}.width`];
                        const heightErr = errors[`${idx}.height`];
                        return (
                            <div key={idx} className="grid grid-cols-[1fr_120px_120px_auto] items-end gap-2">
                                <div className="space-y-1">
                                    <Label htmlFor={`${block.key}-name-${idx}`}>Name</Label>
                                    <Input
                                        id={`${block.key}-name-${idx}`}
                                        value={row.name}
                                        onChange={(e) => setRow(idx, { name: e.target.value })}
                                    />
                                    {nameErr ? <p className="text-destructive text-xs">{formatErr(nameErr)}</p> : null}
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor={`${block.key}-width-${idx}`}>Width</Label>
                                    <Input
                                        id={`${block.key}-width-${idx}`}
                                        type="number"
                                        min={1}
                                        value={Number.isFinite(row.width) ? row.width : ''}
                                        onChange={(e) => setRow(idx, { width: Number(e.target.value) || 0 })}
                                    />
                                    {widthErr ? <p className="text-destructive text-xs">{formatErr(widthErr)}</p> : null}
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor={`${block.key}-height-${idx}`}>Height</Label>
                                    <Input
                                        id={`${block.key}-height-${idx}`}
                                        type="number"
                                        min={1}
                                        value={Number.isFinite(row.height) ? row.height : ''}
                                        onChange={(e) => setRow(idx, { height: Number(e.target.value) || 0 })}
                                    />
                                    {heightErr ? <p className="text-destructive text-xs">{formatErr(heightErr)}</p> : null}
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeRow(idx)}
                                    aria-label="Remove size"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

function formatErr(err: string | string[]): string {
    return Array.isArray(err) ? err.join(' · ') : err;
}

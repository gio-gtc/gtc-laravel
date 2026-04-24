import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CtaSelectorValue } from '@/types/forms';
import { Plus, X } from 'lucide-react';
import type { BlockRendererProps } from './types';

export function CtaSelectorBlock({ block, value, onChange, errors, htmlFieldPrefix }: BlockRendererProps) {
    const current = (value as CtaSelectorValue | undefined) ?? { presets: [], custom: [] };
    const presetSet = new Set(current.presets ?? []);
    const prefix = htmlFieldPrefix ?? block.key;

    const togglePreset = (presetValue: string, checked: boolean) => {
        const next = new Set(presetSet);
        if (checked) {
            next.add(presetValue);
        } else {
            next.delete(presetValue);
        }
        onChange({ ...current, presets: Array.from(next) });
    };

    const addCustom = () => onChange({ ...current, custom: [...current.custom, { label: '' }] });
    const setLabel = (idx: number, label: string) =>
        onChange({
            ...current,
            custom: current.custom.map((c, i) => (i === idx ? { ...c, label } : c)),
        });
    const removeCustom = (idx: number) =>
        onChange({ ...current, custom: current.custom.filter((_, i) => i !== idx) });

    return (
        <div className="space-y-3">
            <p className="text-sm font-semibold">{block.name}</p>

            {block.presets.length > 0 ? (
                <div className="space-y-2">
                    {block.presets.map((p) => {
                        const id = `${prefix}-preset-${p.value}`;
                        return (
                            <div key={p.value} className="flex items-center gap-2 text-sm">
                                <Checkbox
                                    id={id}
                                    checked={presetSet.has(p.value)}
                                    onCheckedChange={(checked) => togglePreset(p.value, checked === true)}
                                />
                                <Label htmlFor={id} className="cursor-pointer font-normal">
                                    {p.label}
                                </Label>
                            </div>
                        );
                    })}
                </div>
            ) : null}

            <div className="space-y-2">
                {current.custom.map((cta, idx) => {
                    const err = errors[`custom.${idx}.label`];
                    return (
                        <div key={idx} className="flex items-center gap-2">
                            <div className="flex-1 space-y-1">
                                <Label htmlFor={`${prefix}-cta-${idx}`} className="sr-only">
                                    Custom CTA {idx + 1}
                                </Label>
                                <Input
                                    id={`${prefix}-cta-${idx}`}
                                    value={cta.label}
                                    placeholder="Enter a description…"
                                    onChange={(e) => setLabel(idx, e.target.value)}
                                />
                                {err ? (
                                    <p className="text-destructive text-xs">
                                        {Array.isArray(err) ? err.join(' · ') : err}
                                    </p>
                                ) : null}
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeCustom(idx)}
                                aria-label="Remove custom CTA"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    );
                })}
                <Button type="button" variant="outline" size="sm" onClick={addCustom}>
                    <Plus className="mr-1 h-4 w-4" /> Add Additional Custom CTA
                </Button>
            </div>
        </div>
    );
}

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CtaSelectorValue } from '@/types/forms';
import { Plus, X } from 'lucide-react';
import type { BlockRendererProps } from './types';

export function CtaSelectorBlock({ block, value, onChange, errors, htmlFieldPrefix }: BlockRendererProps) {
    const current = (value as CtaSelectorValue | undefined) ?? { preset: null, custom: [] };
    const prefix = htmlFieldPrefix ?? block.key;
    const presetGroupName = `${prefix}-preset`;

    const setPreset = (next: string | null) => onChange({ ...current, preset: next });
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
                            <label
                                key={p.value}
                                htmlFor={id}
                                className="flex items-center gap-2 text-sm"
                            >
                                <input
                                    id={id}
                                    type="radio"
                                    name={presetGroupName}
                                    className="h-4 w-4"
                                    checked={current.preset === p.value}
                                    onChange={() => setPreset(p.value)}
                                />
                                <span>{p.label}</span>
                            </label>
                        );
                    })}
                    <button
                        type="button"
                        onClick={() => setPreset(null)}
                        className="text-muted-foreground text-xs underline"
                    >
                        Clear preset
                    </button>
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
                                    placeholder="Custom CTA label"
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

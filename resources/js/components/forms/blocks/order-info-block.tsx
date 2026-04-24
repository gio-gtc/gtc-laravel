import { FileUploader } from '@/components/forms/file-uploader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { evalRule } from '@/lib/forms/conditions';
import type { FieldDescriptor, FileDescriptor } from '@/types/forms';
import type { BlockRendererProps } from './types';

export function OrderInfoBlock({
    block,
    value,
    allValues,
    onChange,
    errors,
    uploadAction,
    scope,
}: BlockRendererProps) {
    const current = (value as Record<string, unknown> | undefined) ?? {};
    const set = (key: string, next: unknown) =>
        onChange({ ...current, [key]: next });

    return (
        <section className="bg-card px-4 py-3">
            <h2 className="text-base font-semibold">{block.name}</h2>
            <div className="mt-3 grid gap-4">
                {block.fields.map((field) => {
                    const visible = evalRule(
                        field.visibleIf,
                        allValues as Record<string, unknown>,
                    );
                    if (!visible) return null;
                    const err = errors[field.key];
                    return (
                        <OrderInfoField
                            key={field.key}
                            field={field}
                            value={current[field.key]}
                            onChange={(v) => set(field.key, v)}
                            error={err}
                            uploadAction={uploadAction}
                            scope={scope}
                        />
                    );
                })}
            </div>
        </section>
    );
}

interface OrderInfoFieldProps {
    field: FieldDescriptor;
    value: unknown;
    onChange: (next: unknown) => void;
    error: string | string[] | undefined;
    uploadAction: string;
    scope: string;
}

function OrderInfoField({
    field,
    value,
    onChange,
    error,
    uploadAction,
    scope,
}: OrderInfoFieldProps) {
    const id = `field-${field.key}`;
    const label = (
        <Label htmlFor={id}>
            {field.label}
            {field.required ? (
                <span className="ml-0.5 text-destructive">*</span>
            ) : null}
        </Label>
    );
    const errEl = error ? (
        <p className="text-xs text-destructive">
            {Array.isArray(error) ? error.join(' · ') : error}
        </p>
    ) : null;
    const help = field.helpText ? (
        <p className="text-xs text-muted-foreground">{field.helpText}</p>
    ) : null;

    switch (field.type) {
        case 'textarea':
            return (
                <div className="space-y-1">
                    {label}
                    <Textarea
                        id={id}
                        maxLength={field.maxLength}
                        placeholder={field.placeholder}
                        value={(value as string) ?? ''}
                        onChange={(e) => onChange(e.target.value)}
                    />
                    {help}
                    {errEl}
                </div>
            );
        case 'number':
        case 'integer':
            return (
                <div className="space-y-1">
                    {label}
                    <Input
                        id={id}
                        type="number"
                        min={field.min}
                        max={field.max}
                        value={
                            Number.isFinite(value as number)
                                ? (value as number)
                                : ''
                        }
                        onChange={(e) =>
                            onChange(
                                e.target.value === ''
                                    ? null
                                    : Number(e.target.value),
                            )
                        }
                    />
                    {help}
                    {errEl}
                </div>
            );
        case 'date':
            return (
                <div className="space-y-1">
                    {label}
                    <Input
                        id={id}
                        type="date"
                        value={(value as string) ?? ''}
                        onChange={(e) => onChange(e.target.value || null)}
                    />
                    {help}
                    {errEl}
                </div>
            );
        case 'datetime':
            return (
                <div className="space-y-1">
                    {label}
                    <Input
                        id={id}
                        type="datetime-local"
                        value={(value as string) ?? ''}
                        onChange={(e) => onChange(e.target.value || null)}
                    />
                    {help}
                    {errEl}
                </div>
            );
        case 'boolean':
            return (
                <div className="flex items-center gap-2">
                    <input
                        id={id}
                        type="checkbox"
                        className="h-4 w-4"
                        checked={Boolean(value)}
                        onChange={(e) => onChange(e.target.checked)}
                    />
                    {label}
                    {errEl}
                </div>
            );
        case 'select':
            return (
                <div className="space-y-1">
                    {label}
                    <Select
                        value={(value as string) ?? ''}
                        onValueChange={(next) => onChange(next || null)}
                    >
                        <SelectTrigger id={id}>
                            <SelectValue
                                placeholder={field.placeholder ?? 'Choose…'}
                            />
                        </SelectTrigger>
                        <SelectContent>
                            {(field.options ?? []).map((o) => (
                                <SelectItem key={o.value} value={o.value}>
                                    {o.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {help}
                    {errEl}
                </div>
            );
        case 'file':
            return (
                <div className="space-y-1">
                    {label}
                    <FileUploader
                        uploadAction={uploadAction}
                        scope={scope}
                        value={(value as FileDescriptor | null) ?? null}
                        onChange={onChange}
                        accept={field.accept}
                        maxSizeMb={field.maxSizeMb}
                    />
                    {help}
                    {errEl}
                </div>
            );
        case 'attachments':
            return (
                <div className="space-y-1">
                    {label}
                    <FileUploader
                        uploadAction={uploadAction}
                        scope={scope}
                        multiple
                        value={
                            ((value as FileDescriptor[] | null) ??
                                []) as FileDescriptor[]
                        }
                        onChange={onChange}
                        accept={field.accept}
                        maxSizeMb={field.maxSizeMb}
                    />
                    {help}
                    {errEl}
                </div>
            );
        case 'email':
        case 'text':
        default:
            return (
                <div className="space-y-1">
                    {label}
                    <Input
                        id={id}
                        type={field.type === 'email' ? 'email' : 'text'}
                        maxLength={field.maxLength}
                        placeholder={field.placeholder}
                        value={(value as string) ?? ''}
                        onChange={(e) => onChange(e.target.value)}
                    />
                    {help}
                    {errEl}
                </div>
            );
    }
}

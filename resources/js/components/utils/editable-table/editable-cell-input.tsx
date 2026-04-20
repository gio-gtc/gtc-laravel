import { Input, InputVariants } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import * as React from 'react';

interface EditableCellInputProps {
    value: string | number;
    itemId: number | string;
    field: string;
    type?: 'text' | 'number';
    formatValue?: (value: string | number) => string;
    onChange: (
        itemId: number | string,
        field: string,
        value: string | number,
    ) => void;
    onDoubleClick: (itemId: number | string, field: string) => void;
    onBlur: () => void;
    onKeyDown: (
        e: React.KeyboardEvent<HTMLInputElement>,
        itemId: number | string,
        field: string,
    ) => void;
    isEditing: boolean;
    className?: string;
    align?: 'left' | 'right' | 'center';
    min?: number;
    step?: number;
    disabled?: boolean;
    /** When value equals this, show empty in display/edit mode with placeholder. Use 0 for quantity/price so 0 doesn't block typing. */
    emptyValue?: number | string;
    /** Placeholder shown in input when value is empty. Defaults to String(emptyValue) when emptyValue is set. */
    emptyPlaceholder?: string;
    variant?: InputVariants;
}

export function EditableCellInput({
    value,
    itemId,
    field,
    type = 'text',
    formatValue,
    onChange,
    onDoubleClick,
    onBlur,
    onKeyDown,
    isEditing,
    className,
    align = 'left',
    min,
    step,
    disabled = false,
    emptyValue,
    emptyPlaceholder,
    variant = 'default',
}: EditableCellInputProps) {
    const isEmpty =
        emptyValue !== undefined &&
        (value === emptyValue || (type === 'number' && Number(value) === 0));
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled) return;
        const newValue =
            type === 'number'
                ? parseFloat(e.target.value) || 0
                : e.target.value;
        onChange(itemId, field, newValue);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (disabled) return;
        onKeyDown(e, itemId, field);
    };

    const handleDoubleClick = () => {
        if (disabled) return;
        onDoubleClick(itemId, field);
    };

    const displayValue = isEmpty
        ? ''
        : formatValue
          ? formatValue(value)
          : String(value);

    const inputPlaceholder =
        emptyPlaceholder ??
        (emptyValue !== undefined ? String(emptyValue) : undefined);
    const inputValue = isEmpty ? '' : type === 'number' ? value : String(value);

    const alignmentClasses = {
        left: 'text-left',
        right: 'text-right',
        center: 'text-center',
    };

    if (isEditing && !disabled) {
        return (
            <Input
                type={type}
                value={inputValue}
                placeholder={inputPlaceholder}
                onChange={handleChange}
                onBlur={onBlur}
                onKeyDown={handleKeyDown}
                autoFocus
                min={min}
                step={step}
                disabled={disabled}
                variant={variant}
                className={cn(
                    'w-full p-0.5',
                    alignmentClasses[align],
                    className,
                )}
            />
        );
    }

    return (
        <p
            onDoubleClick={handleDoubleClick}
            className={cn(
                disabled
                    ? 'cursor-default'
                    : 'xs-gray-500-weight-600 cursor-pointer',
                alignmentClasses[align],
                className,
            )}
        >
            {displayValue || ''}
        </p>
    );
}

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import * as React from 'react';

interface EditableTableCellProps {
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
}

export function EditableTableCell({
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
}: EditableTableCellProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue =
            type === 'number'
                ? parseFloat(e.target.value) || 0
                : e.target.value;
        onChange(itemId, field, newValue);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        onKeyDown(e, itemId, field);
    };

    const displayValue = formatValue ? formatValue(value) : String(value);

    const alignmentClasses = {
        left: 'text-left',
        right: 'text-right',
        center: 'text-center',
    };

    if (isEditing) {
        return (
            <Input
                type={type}
                value={type === 'number' ? value : String(value)}
                onChange={handleChange}
                onBlur={onBlur}
                onKeyDown={handleKeyDown}
                autoFocus
                min={min}
                step={step}
                className={cn(
                    'h-8 w-full',
                    alignmentClasses[align],
                    className,
                )}
            />
        );
    }

    return (
        <span
            onDoubleClick={() => onDoubleClick(itemId, field)}
            className={cn(
                'cursor-pointer',
                alignmentClasses[align],
                className,
            )}
        >
            {displayValue}
        </span>
    );
}

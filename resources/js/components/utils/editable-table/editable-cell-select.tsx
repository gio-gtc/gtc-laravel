import { InputVariants } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import * as React from 'react';

export interface EditableCellSelectOption {
    value: string;
    label?: React.ReactNode;
}

interface EditableCellSelectProps {
    value: string;
    itemId: number | string;
    field: string;
    options: EditableCellSelectOption[];
    onChange: (itemId: number | string, field: string, value: string) => void;
    onDoubleClick: (itemId: number | string, field: string) => void;
    onBlur: () => void;
    onKeyDown: (
        e: React.KeyboardEvent<HTMLElement>,
        itemId: number | string,
        field: string,
    ) => void;
    isEditing: boolean;
    className?: string;
    disabled?: boolean;
    /** Muted read-mode styling for cancelled rows */
    inactive?: boolean;
    renderDisplay?: (value: string) => React.ReactNode;
    variant?: InputVariants;
}

function mergeOptionsForValue(
    value: string,
    options: EditableCellSelectOption[],
): EditableCellSelectOption[] {
    if (value === '' || options.some((o) => o.value === value)) {
        return options;
    }
    return [{ value, label: value }, ...options];
}

export function EditableCellSelect({
    value,
    itemId,
    field,
    options,
    onChange,
    onDoubleClick,
    onBlur,
    onKeyDown,
    isEditing,
    className,
    disabled = false,
    inactive = false,
    renderDisplay,
    variant = 'default',
}: EditableCellSelectProps) {
    const [open, setOpen] = React.useState(false);
    const closedFromValueChangeRef = React.useRef(false);

    const effectiveOptions = React.useMemo(
        () => mergeOptionsForValue(value, options),
        [value, options],
    );

    React.useEffect(() => {
        if (isEditing && !disabled) {
            setOpen(true);
        } else {
            setOpen(false);
        }
    }, [isEditing, disabled]);

    const handleDoubleClick = () => {
        if (disabled) return;
        onDoubleClick(itemId, field);
    };

    const handleEscape = (e: React.KeyboardEvent<HTMLElement>) => {
        if (disabled || !isEditing) return;
        if (e.key === 'Escape') {
            onKeyDown(e, itemId, field);
        }
    };

    const display =
        renderDisplay != null ? renderDisplay(value) : <>{value || '\u00A0'}</>;

    if (isEditing && !disabled) {
        return (
            <div className="w-full min-w-0">
                <Select
                    value={value}
                    open={open}
                    onOpenChange={(next) => {
                        setOpen(next);
                        if (!next) {
                            if (closedFromValueChangeRef.current) {
                                closedFromValueChangeRef.current = false;
                                return;
                            }
                            onBlur();
                        }
                    }}
                    onValueChange={(v) => {
                        onChange(itemId, field, v);
                        closedFromValueChangeRef.current = true;
                        setOpen(false);
                        onBlur();
                    }}
                >
                    <SelectTrigger
                        variant={variant}
                        className={cn('w-full px-1.5 py-0.5', className)}
                    >
                        <SelectValue placeholder="Choose…" />
                    </SelectTrigger>
                    <SelectContent
                        position="popper"
                        onEscapeKeyDown={(e) => {
                            onKeyDown(
                                e as unknown as React.KeyboardEvent<HTMLElement>,
                                itemId,
                                field,
                            );
                        }}
                    >
                        {effectiveOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label ?? opt.value}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        );
    }

    return (
        <div
            role="presentation"
            onDoubleClick={handleDoubleClick}
            onKeyDownCapture={handleEscape}
            className={cn(
                disabled ? 'cursor-default' : 'cursor-pointer',
                inactive
                    ? 'xs-gray-300-weight-600'
                    : !disabled && 'xs-gray-500-weight-600',
                className,
            )}
        >
            {display}
        </div>
    );
}

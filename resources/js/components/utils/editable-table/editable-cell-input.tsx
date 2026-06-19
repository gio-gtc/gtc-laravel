import { Input, InputVariants } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
    useLayoutEffect,
    useRef,
    useState,
    type KeyboardEvent,
} from 'react';

const INPUT_VARIANT_MEASURE_CLASSES: Partial<Record<InputVariants, string>> = {
    default: 'text-sm',
    orderSlideoutTableCells: 'xs-gray-500-weight-600',
    invoiceSlideout: 'xs-gray-500-weight-600',
};

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
        e: KeyboardEvent<HTMLInputElement>,
        itemId: number | string,
        field: string,
    ) => void;
    isEditing: boolean;
    className?: string;
    align?: 'left' | 'right' | 'center';
    min?: number;
    step?: number;
    disabled?: boolean;
    /** Muted read-mode styling for cancelled rows */
    inactive?: boolean;
    emptyValue?: number | string;
    /** Placeholder shown in input when value is empty. Defaults to String(emptyValue) when emptyValue is set. */
    emptyPlaceholder?: string;
    variant?: InputVariants;
    /** When editing, size the input to measured text width × 1.2. */
    fitContentWidth?: boolean;
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
    inactive = false,
    emptyValue,
    emptyPlaceholder,
    variant = 'default',
    fitContentWidth = false,
}: EditableCellInputProps) {
    const isEmpty =
        emptyValue !== undefined &&
        (value === emptyValue || (type === 'number' && Number(value) === 0));

    const [numberDraft, setNumberDraft] = useState<string | null>(null);

    useLayoutEffect(() => {
        if (isEditing && type === 'number') {
            if (value === '' || value === emptyValue) {
                setNumberDraft('');
            } else {
                setNumberDraft(String(value));
            }
        } else if (!isEditing) {
            setNumberDraft(null);
        }
    }, [isEditing, type, value, emptyValue]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled) return;
        if (type === 'number') {
            const raw = e.target.value;
            setNumberDraft(raw);
            if (raw === '' || raw === '-') {
                onChange(itemId, field, '');
                return;
            }
            const parsed = Number.parseFloat(raw);
            if (Number.isFinite(parsed)) {
                onChange(itemId, field, parsed);
            }
            return;
        }
        onChange(itemId, field, e.target.value);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
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
    const inputValue =
        isEditing && type === 'number' && numberDraft !== null
            ? numberDraft
            : isEmpty
              ? ''
              : type === 'number'
                ? value
                : String(value);

    const alignmentClasses = {
        left: 'text-left',
        right: 'text-right',
        center: 'text-center',
    };

    const measureRef = useRef<HTMLSpanElement>(null);
    const [fitWidthPx, setFitWidthPx] = useState<number | undefined>();
    const measureText =
        inputValue === '' ? (inputPlaceholder ?? '') : String(inputValue);

    useLayoutEffect(() => {
        if (!isEditing || !fitContentWidth) {
            setFitWidthPx(undefined);
            return;
        }
        const measured = measureRef.current?.offsetWidth ?? 0;
        const padded = Math.ceil(measured * 1.05);
        setFitWidthPx(Math.max(padded, 24));
    }, [fitContentWidth, isEditing, measureText, variant]);

    if (isEditing && !disabled) {
        return (
            <span className="relative inline-flex max-w-full min-w-0">
                {fitContentWidth ? (
                    <span
                        ref={measureRef}
                        aria-hidden
                        className={cn(
                            'pointer-events-none invisible absolute px-2.5 py-1 whitespace-pre',
                            INPUT_VARIANT_MEASURE_CLASSES[variant],
                            alignmentClasses[align],
                        )}
                    >
                        {measureText || '\u00a0'}
                    </span>
                ) : null}
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
                    style={
                        fitContentWidth && fitWidthPx
                            ? { width: fitWidthPx }
                            : undefined
                    }
                    className={cn(
                        fitContentWidth
                            ? 'w-auto min-w-[24px] p-0.5'
                            : 'w-full min-w-[60px] p-0.5',
                        alignmentClasses[align],
                        className,
                    )}
                />
            </span>
        );
    }

    return (
        <p
            onDoubleClick={handleDoubleClick}
            className={cn(
                'flex h-full items-center truncate',
                disabled ? 'cursor-default' : 'cursor-pointer',
                inactive
                    ? 'xs-gray-300-weight-600'
                    : !disabled && 'xs-gray-500-weight-600',
                alignmentClasses[align],
                variant === 'invoiceSlideout' &&
                    !inactive &&
                    'xs-gray-500-weight-600',
                className,
            )}
        >
            {displayValue || ''}
        </p>
    );
}

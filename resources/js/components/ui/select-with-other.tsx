import { Input, type InputVariants } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useEffect, useMemo, useState } from 'react';

export const SELECT_WITH_OTHER_VALUE = '__other__';

export type SelectWithOtherOption =
    | string
    | {
          value: string;
          label: string;
      };

export type NormalizedSelectWithOtherOption = {
    value: string;
    label: string;
};

export function normalizeSelectWithOtherOptions(
    options: readonly SelectWithOtherOption[],
): NormalizedSelectWithOtherOption[] {
    return options.map((option) =>
        typeof option === 'string' ? { value: option, label: option } : option,
    );
}

function isCustomValue(value: string, optionValues: Set<string>): boolean {
    return value !== '' && !optionValues.has(value);
}

export interface SelectWithOtherProps {
    id?: string;
    options: readonly SelectWithOtherOption[];
    value: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    otherLabel?: string;
    otherInputPlaceholder?: string;
    /** When false, catalog options only; custom values render read-only. */
    allowOther?: boolean;
    disabled?: boolean;
    triggerClassName?: string;
    selectTriggerVariant?: InputVariants;
    otherInputClassName?: string;
}

export function SelectWithOther({
    id,
    options,
    value,
    onValueChange,
    placeholder = 'Select…',
    otherLabel = 'Other',
    otherInputPlaceholder = 'Enter value…',
    allowOther = false,
    disabled = false,
    triggerClassName,
    selectTriggerVariant = 'default',
    otherInputClassName,
}: SelectWithOtherProps) {
    const normalizedOptions = useMemo(
        () => normalizeSelectWithOtherOptions(options),
        [options],
    );

    const optionValues = useMemo(
        () => new Set(normalizedOptions.map((option) => option.value)),
        [normalizedOptions],
    );

    const [otherActive, setOtherActive] = useState(() =>
        isCustomValue(value, optionValues),
    );

    useEffect(() => {
        if (isCustomValue(value, optionValues)) {
            setOtherActive(true);
            return;
        }
        if (optionValues.has(value)) {
            setOtherActive(false);
        }
    }, [value, optionValues]);

    const selectValue = otherActive
        ? SELECT_WITH_OTHER_VALUE
        : value || undefined;

    const handleSelectChange = (next: string) => {
        if (next === SELECT_WITH_OTHER_VALUE) {
            setOtherActive(true);
            onValueChange('');
            return;
        }
        setOtherActive(false);
        onValueChange(next);
    };

    const otherInputId = id ? `${id}-other` : undefined;

    if (!allowOther && isCustomValue(value, optionValues)) {
        return (
            <Input
                id={id}
                value={value}
                disabled
                variant={selectTriggerVariant}
                className={cn(triggerClassName, otherInputClassName)}
            />
        );
    }

    return (
        <div className="flex flex-col gap-1.5">
            <Select
                value={selectValue}
                onValueChange={handleSelectChange}
                disabled={disabled}
            >
                <SelectTrigger
                    id={id}
                    variant={selectTriggerVariant}
                    className={triggerClassName}
                >
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {normalizedOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                    {allowOther ? (
                        <SelectItem value={SELECT_WITH_OTHER_VALUE}>
                            {otherLabel}
                        </SelectItem>
                    ) : null}
                </SelectContent>
            </Select>

            {allowOther && otherActive ? (
                <Input
                    id={otherInputId}
                    value={value}
                    onChange={(event) => onValueChange(event.target.value)}
                    placeholder={otherInputPlaceholder}
                    disabled={disabled}
                    variant={selectTriggerVariant}
                    className={cn(otherInputClassName)}
                />
            ) : null}
        </div>
    );
}

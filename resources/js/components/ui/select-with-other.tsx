import { Input, type InputVariants } from '@/components/ui/input';
import {
    mergeComboboxOptionsWithCustoms,
    MultiSelectWithOther,
} from '@/components/ui/multi-select-with-other';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

/** @deprecated Radix "Other" item value; combobox UI no longer uses this. */
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
    /** @deprecated Combobox Other footer does not use a select item label. */
    otherLabel?: string;
    otherInputPlaceholder?: string;
    emptyMessage?: string;
    /** When false, catalog options only; custom values render read-only. */
    allowOther?: boolean;
    /** Called when admin adds a new custom option to the session list. */
    onCustomOptionAdded?: (option: string) => void;
    disabled?: boolean;
    triggerClassName?: string;
    /** @deprecated Use triggerClassName; combobox trigger does not use Input variant. */
    selectTriggerVariant?: InputVariants;
    /** @deprecated Use triggerClassName only. */
    otherInputClassName?: string;
}

export function SelectWithOther({
    id,
    options,
    value,
    onValueChange,
    placeholder = 'Select…',
    otherInputPlaceholder = 'Enter value…',
    emptyMessage = 'No results found.',
    allowOther = false,
    onCustomOptionAdded,
    disabled = false,
    triggerClassName,
    selectTriggerVariant = 'default',
    otherInputClassName,
}: SelectWithOtherProps) {
    const normalizedOptions = useMemo(
        () => normalizeSelectWithOtherOptions(options),
        [options],
    );

    const catalogValues = useMemo(
        () => normalizedOptions.map((option) => option.value),
        [normalizedOptions],
    );

    const optionValues = useMemo(
        () => new Set(catalogValues),
        [catalogValues],
    );

    const mergedOptions = useMemo(
        () =>
            mergeComboboxOptionsWithCustoms(
                catalogValues,
                value && isCustomValue(value, optionValues) ? [value] : [],
            ),
        [catalogValues, optionValues, value],
    );

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
        <MultiSelectWithOther
            mode="single"
            id={id}
            disabled={disabled}
            options={mergedOptions}
            value={value ? [value] : []}
            onValueChange={(next) => onValueChange(next[0] ?? '')}
            allowOther={allowOther}
            onCustomOptionAdded={onCustomOptionAdded}
            placeholder={placeholder}
            emptyMessage={emptyMessage}
            otherInputPlaceholder={otherInputPlaceholder}
            triggerClassName={triggerClassName}
        />
    );
}

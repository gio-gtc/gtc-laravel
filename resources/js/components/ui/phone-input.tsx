import * as React from 'react';

import {
    AsYouType,
    parseIncompletePhoneNumber,
    parsePhoneNumberFromString,
    validatePhoneNumberLength,
    type CountryCode,
    type E164Number,
} from 'libphonenumber-js/max';

import { Input, type InputVariants } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export function tryParsePhoneE164(
    text: string,
    defaultCountry: CountryCode = 'US',
): E164Number | null {
    const trimmed = text.trim();
    if (!trimmed) {
        return null;
    }
    const parsed = parsePhoneNumberFromString(trimmed, defaultCountry);
    return parsed?.isValid() ? parsed.number : null;
}

export type PhoneInputHandle = {
    getDisplayValue: () => string;
};

export type PhoneInputProps = {
    id: string;
    value: string;
    onChange: (e164: string) => void;
    defaultCountry?: CountryCode;
    disabled?: boolean;
    variant?: InputVariants;
    className?: string;
    placeholder?: string;
    autoComplete?: string;
    'aria-invalid'?: boolean;
    'aria-describedby'?: string;
    nativeRequired?: boolean;
    tabIndex?: number;
};

/** Visible display: no parentheses or hyphens; spaces and leading + preserved. */
function toSpaceSeparatedDisplay(text: string): string {
    let s = text.replace(/[()]/g, '').replace(/-/g, ' ');
    s = s.replace(/\s+/g, ' ').trim();
    return s;
}

function e164ToDisplay(e164: string): string {
    if (!e164) {
        return '';
    }
    const parsed = parsePhoneNumberFromString(e164);
    if (!parsed) {
        return e164;
    }
    return toSpaceSeparatedDisplay(parsed.formatInternational());
}

/** Accepts output of `parseIncompletePhoneNumber` (dial characters only), not a pasted national mask. */
function formatWithAsYouType(
    incompleteDial: string,
    defaultCountry: CountryCode,
): { formatted: string; instance: AsYouType } {
    const asYouType = new AsYouType(defaultCountry);
    let formatted = '';
    for (const character of incompleteDial) {
        formatted = asYouType.input(character);
    }
    return { formatted, instance: asYouType };
}

const PhoneInput = React.forwardRef<PhoneInputHandle, PhoneInputProps>(
    function PhoneInput(
        {
            id,
            value,
            onChange,
            defaultCountry = 'US',
            disabled,
            variant,
            className,
            placeholder = '+1 555 555 5555',
            autoComplete = 'tel',
            'aria-invalid': ariaInvalid,
            'aria-describedby': ariaDescribedBy,
            nativeRequired = false,
            tabIndex,
        },
        ref,
    ) {
        const [displayValue, setDisplayValue] = React.useState(() =>
            e164ToDisplay(value),
        );

        React.useEffect(() => {
            setDisplayValue(e164ToDisplay(value));
        }, [value]);

        React.useImperativeHandle(ref, () => ({
            getDisplayValue: () => displayValue,
        }));

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const raw = e.target.value;
            const native = e.nativeEvent as InputEvent;
            const inputType = native?.inputType ?? 'unknown';

            if (!raw.trim()) {
                setDisplayValue('');
                onChange('');
                return;
            }

            let incomplete = parseIncompletePhoneNumber(raw);
            if (!incomplete.length) {
                setDisplayValue('');
                onChange('');
                return;
            }

            while (
                incomplete.length > 0 &&
                validatePhoneNumberLength(incomplete, defaultCountry) ===
                    'TOO_LONG'
            ) {
                incomplete = incomplete.slice(0, -1);
            }

            let { formatted, instance } = formatWithAsYouType(
                incomplete,
                defaultCountry,
            );

            // Deleting a formatting character (e.g. ")") can leave the same
            // incomplete dial string; AsYouType would then re-expand to the same
            // template. Strip a digit until the formatted length fits the raw input.
            if (inputType === 'deleteContentBackward') {
                while (incomplete.length > 0) {
                    const displayLen =
                        toSpaceSeparatedDisplay(formatted).length;
                    if (displayLen <= raw.length) {
                        break;
                    }
                    incomplete = incomplete.slice(0, -1);
                    if (!incomplete.length) {
                        setDisplayValue('');
                        onChange('');
                        return;
                    }
                    ({ formatted, instance } = formatWithAsYouType(
                        incomplete,
                        defaultCountry,
                    ));
                }
            }

            setDisplayValue(toSpaceSeparatedDisplay(formatted));

            if (instance.isValid()) {
                const e164 = instance.getNumberValue();
                if (e164) {
                    onChange(e164);
                }
            }
        };

        return (
            <Input
                id={id}
                type="tel"
                autoComplete={autoComplete}
                placeholder={placeholder}
                disabled={disabled}
                variant={variant}
                value={displayValue}
                onChange={handleChange}
                required={nativeRequired}
                aria-invalid={ariaInvalid}
                aria-describedby={ariaDescribedBy}
                tabIndex={tabIndex}
                className={cn(className)}
            />
        );
    },
);

PhoneInput.displayName = 'PhoneInput';

export { PhoneInput };

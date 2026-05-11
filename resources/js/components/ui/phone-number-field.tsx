import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';

import type { CountryCode } from 'libphonenumber-js/max';

import {
    PhoneInput,
    tryParsePhoneE164,
    type PhoneInputHandle,
    type PhoneInputProps,
} from '@/components/ui/phone-input';

export type PhoneNumberFieldHandle = {
    /**
     * Returns the validated E.164 string, or null when the current input is
     * empty or not a valid phone number. Use this in submit-time transforms
     * to keep `null` (rather than `''`) on the wire to the API.
     */
    getValue: () => string | null;
};

export type PhoneNumberFieldProps = {
    id: string;
    /** Raw phone value from the API (any format). `null` renders as empty. */
    rawDefault?: string | null;
    /**
     * Bump this to reseed the internal value from `rawDefault` (e.g. when a
     * modal reopens against a different user).
     */
    syncKey?: string | number;
    defaultCountry?: CountryCode;
} & Omit<PhoneInputProps, 'id' | 'value' | 'onChange' | 'defaultCountry'>;

export const PhoneNumberField = forwardRef<
    PhoneNumberFieldHandle,
    PhoneNumberFieldProps
>(function PhoneNumberField(
    { id, rawDefault, syncKey, defaultCountry = 'US', ...rest },
    ref,
) {
    const inputHandleRef = useRef<PhoneInputHandle>(null);

    const seed = (raw: string | null | undefined): string =>
        tryParsePhoneE164(raw ?? '', defaultCountry) ?? '';

    const [e164, setE164] = useState<string>(() => seed(rawDefault));

    useEffect(() => {
        setE164(seed(rawDefault));
        // `seed` closes over `defaultCountry`; including the raw inputs is enough.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [syncKey, rawDefault, defaultCountry]);

    useImperativeHandle(
        ref,
        () => ({
            getValue: () =>
                tryParsePhoneE164(
                    inputHandleRef.current?.getDisplayValue() ?? '',
                    defaultCountry,
                ),
        }),
        [defaultCountry],
    );

    return (
        <PhoneInput
            ref={inputHandleRef}
            id={id}
            value={e164}
            onChange={setE164}
            defaultCountry={defaultCountry}
            {...rest}
        />
    );
});

PhoneNumberField.displayName = 'PhoneNumberField';

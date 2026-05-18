import type { FormDataConvertible } from '@inertiajs/core';

export type FlashShape = {
    success?: string | null;
    error?: string | null;
    new_organisation?: { id: number; name: string } | null;
};

/** Matches `routes/web.php` `organisations.store` — POST `/organisations`. */
export const ORGANISATIONS_STORE_FORM = {
    action: '/organisations',
    method: 'post' as const,
};

export type OrganisationModalFormValues = {
    name: string;
    billing_address: string;
    city: string;
    state: string;
    zip: string;
    country_id: string;
    credit_limit: string;
    credit_terms: string;
    currency_code: string;
    accounts_payable_contact: string;
    accounts_payable_emails: string[];
    types: string[];
};

export function buildOrganisationModalDefaults(
    currency_codes: string[],
): OrganisationModalFormValues {
    const defaultCurrency =
        currency_codes.find((c) => c.toUpperCase() === 'USD') ??
        currency_codes[0] ??
        '';

    return {
        name: '',
        billing_address: '',
        city: '',
        state: '',
        zip: '',
        country_id: '',
        credit_limit: '',
        credit_terms: '',
        currency_code: defaultCurrency,
        accounts_payable_contact: '',
        accounts_payable_emails: [''],
        types: [],
    };
}

export function refRowValue(row: unknown): string {
    if (!row || typeof row !== 'object') {
        return '';
    }
    const o = row as Record<string, unknown>;
    const raw = o.id ?? o.code ?? o.value ?? o.slug;

    return raw !== undefined && raw !== null ? String(raw) : '';
}

export function refRowLabel(row: unknown): string {
    if (!row || typeof row !== 'object') {
        return '';
    }
    const o = row as Record<string, unknown>;
    const raw = o.name ?? o.label ?? o.code;
    const label = raw !== undefined && raw !== null ? String(raw) : '';

    return label !== '' ? label : refRowValue(row);
}

function stringifyErrorValue(val: unknown): string | undefined {
    if (typeof val === 'string' && val.trim() !== '') {
        return val.trim();
    }
    if (Array.isArray(val)) {
        for (const entry of val) {
            const s =
                typeof entry === 'string' && entry.trim() !== ''
                    ? entry.trim()
                    : typeof entry === 'object' &&
                        entry !== null &&
                        typeof (entry as { message?: unknown }).message ===
                            'string'
                      ? ((entry as { message: string }).message || '').trim()
                      : '';
            if (s !== '') {
                return s;
            }
        }
    }
    return undefined;
}

/** Single toast body for modal validation failures (handles string or string[] Bag values). */
export function summariseOrganisationValidationErrors(
    errors: Partial<Record<string, string | string[]>>,
): string {
    const chunks: string[] = [];
    const seen = new Set<string>();

    for (const value of Object.values(errors)) {
        const text = stringifyErrorValue(value);
        if (text && !seen.has(text)) {
            seen.add(text);
            chunks.push(text);
        }
    }

    if (chunks.length === 0) {
        return 'Please correct the highlighted issues.';
    }
    if (chunks.length === 1) {
        return chunks[0]!;
    }
    return chunks.map((line) => `• ${line}`).join('\n');
}

export function mergeOrganisationCreatePayload(
    base: Record<string, FormDataConvertible>,
    fields: OrganisationModalFormValues,
): Record<string, FormDataConvertible> {
    const filteredEmails = fields.accounts_payable_emails
        .map((e) => e.trim())
        .filter(Boolean);

    return {
        ...base,
        country_id: fields.country_id,
        currency_code: fields.currency_code,
        types: fields.types,
        accounts_payable_emails: filteredEmails,
    };
}

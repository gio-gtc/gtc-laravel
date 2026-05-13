import type { User } from '@/types';
import type { FormDataConvertible } from '@inertiajs/core';

export type CreateContactPrefill = Partial<{
    first_name: string;
    last_name: string;
    email: string;
    organisation: string;
    job_title: string;
    phone_number: string;
}>;

export function splitName(fullName: string) {
    const normalized = fullName.trim().replace(/\s+/g, ' ');
    if (!normalized) return { first: '', last: '' };

    const parts = normalized.split(' ');
    if (parts.length === 1) return { first: parts[0], last: '' };

    return {
        first: parts[0],
        last: parts.slice(1).join(' '),
    };
}

export type UserInfoFormDefaults = {
    first_name: string;
    last_name: string;
    email: string;
    organisation_id: number | null;
    job_title: string;
    department: string;
    phone_number: string;
    about_me: string;
    out_of_office: boolean;
    out_of_office_start_date: string;
    out_of_office_end_date: string;
    role: string;
};

export function buildUserInfoFormDefaults(
    user: User,
    isCreateMode: boolean,
    createPrefill: CreateContactPrefill | null | undefined,
): UserInfoFormDefaults {
    if (isCreateMode) {
        return {
            first_name: '',
            last_name: '',
            email: '',
            organisation_id: null,
            job_title: '',
            department: '',
            phone_number: '',
            about_me: '',
            out_of_office: false,
            out_of_office_start_date: '',
            out_of_office_end_date: '',
            role: '',
            ...(createPrefill ?? {}),
        };
    }

    const fallback = splitName(user.name ?? '');

    return {
        first_name: user.first_name ?? fallback.first,
        last_name: user.last_name ?? fallback.last,
        email: user.email ?? '',
        organisation_id: user.organisation_id ?? '',
        job_title: user.job_title ?? '',
        department: user.department ?? '',
        phone_number: user.phone_number ?? '',
        about_me: user.about_me ?? '',
        out_of_office: Boolean(user.out_of_office),
        out_of_office_start_date: user.out_of_office_start_date ?? '',
        out_of_office_end_date: user.out_of_office_end_date ?? '',
        role: user.role,
    };
}

export function firstContactValidationToastMessage(
    errs: Record<string, string | string[]>,
): string | undefined {
    for (const value of Object.values(errs)) {
        if (Array.isArray(value) && value.length > 0 && value[0]) {
            return value[0];
        }
        if (typeof value === 'string' && value !== '') {
            return value;
        }
    }
    return undefined;
}

/** Merge submit `data` with E164 phone; create invite omits file `photo` from the payload. */
export function buildUserInfoFormTransformPayload(
    data: Record<string, FormDataConvertible>,
    options: { isCreateMode: boolean; phoneNumber: string | null },
): Record<string, FormDataConvertible> {
    const record = { ...data };
    if (options.isCreateMode) {
        delete record.photo;
    }
    return { ...record, phone_number: options.phoneNumber };
}

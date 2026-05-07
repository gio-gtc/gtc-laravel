import { parsePhoneNumberFromString } from 'libphonenumber-js/max';
import type { User } from '@/types';

export type CreateContactPrefill = Partial<{
    first_name: string;
    last_name: string;
    email: string;
    organisation: string;
    job_title: string;
    phone_number: string;
}>;

export function phoneRawToE164(raw: string | undefined): string {
    if (!raw) {
        return '';
    }
    const parsed = parsePhoneNumberFromString(raw, 'US');
    return parsed?.isValid() ? parsed.number : '';
}

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
    organisation: string;
    job_title: string;
    department: string;
    phone_number: string;
    about_me: string;
    out_of_office: boolean;
    out_of_office_start_date: string;
    out_of_office_end_date: string;
    permissions_level: string;
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
            organisation: '',
            job_title: '',
            department: '',
            phone_number: '',
            about_me: '',
            out_of_office: false,
            out_of_office_start_date: '',
            out_of_office_end_date: '',
            permissions_level: '',
            ...(createPrefill ?? {}),
        };
    }

    const fallback = splitName(user.name ?? '');

    return {
        first_name: user.first_name ?? fallback.first,
        last_name: user.last_name ?? fallback.last,
        email: user.email ?? '',
        organisation: user.organisation ?? '',
        job_title: user.job_title ?? '',
        department: user.department ?? '',
        phone_number: user.phone_number ?? '',
        about_me: user.about_me ?? '',
        out_of_office: Boolean(user.out_of_office),
        out_of_office_start_date: user.out_of_office_start_date ?? '',
        out_of_office_end_date: user.out_of_office_end_date ?? '',
        permissions_level: user.permissions_level ?? 'Admin',
    };
}

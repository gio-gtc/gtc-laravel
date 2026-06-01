import type { User } from '@/types';
import { useCallback } from 'react';

export type InitialsInput =
    | null
    | undefined
    | Pick<User, 'first_name' | 'last_name' | 'name'>;

function initialsFromParts(
    firstRaw: string | null | undefined,
    lastRaw: string | null | undefined,
): string {
    const first = firstRaw?.trim() ?? '';
    const last = lastRaw?.trim() ?? '';

    if (first && last) {
        return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
    }
    if (first) {
        return (
            first.length >= 2
                ? `${first.charAt(0)}${first.charAt(1)}`
                : first.charAt(0)
        ).toUpperCase();
    }
    if (last) {
        return last.charAt(0).toUpperCase();
    }

    return '?';
}

export function useInitials() {
    return useCallback((input: InitialsInput): string => {
        if (input == null || typeof input !== 'object') {
            return '?';
        }

        const direct = initialsFromParts(input.first_name, input.last_name);
        if (direct !== '?') {
            return direct;
        }

        const name = input.name?.trim();
        if (name) {
            const tokens = name.split(/\s+/).filter(Boolean);
            return initialsFromParts(tokens[0], tokens.slice(1).join(' '));
        }

        return '?';
    }, []);
}

import type { User } from '@/types';

/** GTC internal org — staff/collaborators belong to this organisation. */
export const GTC_INTERNAL_ORG_ID = 1;

type UserWithLegacyOrganisationFields = User & {
    organisation_id?: number;
    organisation_name?: string | null;
};

export function userOrganisationId(user: User): number | null {
    const id = user.organisation?.id;

    return typeof id === 'number' && id > 0 ? id : null;
}

/** Ensures roster/catalog users expose nested `organisation` (legacy mock rows may only have flat ids). */
export function normalizeUserOrganisationShape(user: User): User {
    const orgId = userOrganisationId(user);
    if (orgId != null) {
        return user;
    }

    const legacy = user as UserWithLegacyOrganisationFields;
    const legacyOrgId = legacy.organisation_id;
    if (typeof legacyOrgId !== 'number' || legacyOrgId <= 0) {
        return user;
    }

    const legacyOrgName =
        typeof legacy.organisation_name === 'string'
            ? legacy.organisation_name
            : '';

    return {
        ...user,
        organisation: { id: legacyOrgId, name: legacyOrgName },
    };
}

export function isGtcStaffUser(user: User): boolean {
    return userOrganisationId(user) === GTC_INTERNAL_ORG_ID;
}

export function isExternalClientUser(user: User): boolean {
    const orgId = userOrganisationId(user);

    return orgId != null && orgId !== GTC_INTERNAL_ORG_ID;
}

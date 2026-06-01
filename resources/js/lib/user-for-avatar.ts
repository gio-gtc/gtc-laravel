import {
    GTC_INTERNAL_ORG_ID,
    normalizeUserOrganisationShape,
} from '@/lib/user-organisation';
import type { User } from '@/types';

/**
 * Slim person row from gtc-api embeds (orders client/collaborators, assignees, etc.).
 * Wire format uses `first_name` / `last_name`; `name` is optional legacy/summary.
 */
export type PersonEmbed = {
    id: number;
    email?: string | null;
    name?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    avatar?: string | null;
};

/** Map an API person embed → `User` for `UserAvatar` / `UserAvatarsStack`. */
export function embedPersonToUser(
    person: PersonEmbed,
    organisation: User['organisation'],
): User {
    const first_name =
        typeof person.first_name === 'string' ? person.first_name.trim() : '';
    const last_name =
        typeof person.last_name === 'string' ? person.last_name.trim() : '';
    const email = typeof person.email === 'string' ? person.email.trim() : '';
    const fromParts = [first_name, last_name].filter(Boolean).join(' ');
    const fromName = typeof person.name === 'string' ? person.name.trim() : '';
    const displayName = fromParts || fromName || email || `User ${person.id}`;

    let resolvedFirst = first_name;
    let resolvedLast = last_name;
    if (!resolvedFirst && !resolvedLast) {
        const tokens = displayName.split(/\s+/).filter(Boolean);
        resolvedFirst = tokens[0] ?? '';
        resolvedLast = tokens.slice(1).join(' ');
    }

    const avatar =
        typeof person.avatar === 'string' && person.avatar.trim() !== ''
            ? person.avatar
            : undefined;

    return normalizeUserOrganisationShape({
        id: person.id,
        name: displayName,
        email,
        avatar,
        email_verified_at: null,
        role: '',
        first_name: resolvedFirst,
        last_name: resolvedLast,
        organisation,
    });
}

export function staffEmbedToUser(person: PersonEmbed): User {
    return embedPersonToUser(person, {
        id: GTC_INTERNAL_ORG_ID,
        name: '',
    });
}

export function externalClientEmbedToUser(person: PersonEmbed): User {
    return embedPersonToUser(person, { id: 0, name: '' });
}

export function findUserInRoster(
    id: number | null | undefined,
    roster: User[],
): User | undefined {
    if (id == null) return undefined;
    return roster.find((u) => u.id === id);
}

/**
 * Standard resolver for avatar UI: prefer full roster row, else map API embed.
 */
export function resolveUserForAvatar(
    id: number,
    roster: User[],
    embed?: PersonEmbed | null,
    organisation: User['organisation'] = {
        id: GTC_INTERNAL_ORG_ID,
        name: '',
    },
): User {
    const fromRoster = findUserInRoster(id, roster);
    if (fromRoster) {
        return fromRoster;
    }

    if (embed != null) {
        return embedPersonToUser(embed, organisation);
    }

    return embedPersonToUser({ id, email: '' }, organisation);
}

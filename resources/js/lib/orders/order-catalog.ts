import type {
    OrderCatalogMenu,
    OrderCatalogMenuItem,
    OrderMenuFormBlueprint,
    OrderMenuFormBlueprintTypeSlice,
} from '@/types/order-catalog';
import type { OrderMenuCategoryId } from '@/types/orders-api';

export const INTERNATIONAL_SPOT_TYPE = 'International';
export const INTERNATIONAL_TV_PACKAGE_CUT = 'International TV Package';
export const INTERNATIONAL_LOCKED_DURATION_SECONDS = 30;
export const INTERNATIONAL_LOCKED_LANGUAGE = 'English';

export function resolveMenuItemByCategoryId(
    catalog: OrderCatalogMenu | null | undefined,
    categoryId: OrderMenuCategoryId,
): OrderCatalogMenuItem | null {
    if (!Array.isArray(catalog) || catalog.length === 0) {
        return null;
    }

    const items = catalog.flatMap((category) => category.order_menu_items ?? []);

    const withBlueprint = items.find(
        (item) => item.order_menu_category_id === categoryId && item.form_blueprint,
    );
    if (withBlueprint) {
        return withBlueprint;
    }

    const byItemCategory = items.find(
        (item) => item.order_menu_category_id === categoryId,
    );
    if (byItemCategory) {
        return byItemCategory;
    }

    for (const category of catalog) {
        const categoryKey = category.order_menu_category_id ?? category.id;
        if (categoryKey !== categoryId) {
            continue;
        }

        const firstWithBlueprint = (category.order_menu_items ?? []).find(
            (item) => item.form_blueprint,
        );
        if (firstWithBlueprint) {
            return firstWithBlueprint;
        }

        const first = category.order_menu_items?.[0];
        if (first) {
            return first;
        }
    }

    return null;
}

export function getBlueprintTypeKeys(
    blueprint: OrderMenuFormBlueprint | null | undefined,
): string[] {
    if (!blueprint?.types) {
        return [];
    }
    return Object.keys(blueprint.types);
}

export function getBlueprintSlice(
    blueprint: OrderMenuFormBlueprint | null | undefined,
    type: string,
): OrderMenuFormBlueprintTypeSlice | null {
    if (!blueprint?.types || !type) {
        return null;
    }
    return blueprint.types[type] ?? null;
}

/** Matches Category 1 seed blueprint when API catalog is not yet available. */
export const FALLBACK_BROADCAST_DURATIONS_BY_TYPE: Record<string, number[]> = {
    Generic: [10, 15, 30],
    AmEx: [15, 30],
    Verizon: [15, 30],
    Citi: [15, 30],
    International: [30],
};

function normalizeDurationSeconds(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }
    if (typeof value === 'string' && value.trim() !== '') {
        const parsed = Number.parseInt(value, 10);
        return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
}

/** Durations in seconds for a broadcast spot type (blueprint-first, seed fallback). */
export function getBroadcastDurationSeconds(
    blueprint: OrderMenuFormBlueprint | null | undefined,
    type: string,
): number[] {
    const slice = getBlueprintSlice(blueprint, type);
    const fromBlueprint = (slice?.durations ?? [])
        .map(normalizeDurationSeconds)
        .filter((n): n is number => n !== null);

    if (fromBlueprint.length > 0) {
        return fromBlueprint;
    }

    return FALLBACK_BROADCAST_DURATIONS_BY_TYPE[type] ?? [15, 30];
}

/** Pill labels (`:10`, `:15`, …) for broadcast add/edit duration toggles. */
export function getBroadcastDurationPills(
    blueprint: OrderMenuFormBlueprint | null | undefined,
    type: string,
): string[] {
    return getBroadcastDurationSeconds(blueprint, type).map(
        blueprintDurationToPill,
    );
}

/** Every duration pill shown in the modal (union across all spot types). */
export function getAllBroadcastDurationPills(
    blueprint: OrderMenuFormBlueprint | null | undefined,
): string[] {
    const typeKeys = getBlueprintTypeKeys(blueprint);
    const seconds = new Set<number>();

    if (typeKeys.length > 0) {
        for (const typeKey of typeKeys) {
            for (const n of getBroadcastDurationSeconds(blueprint, typeKey)) {
                seconds.add(n);
            }
        }
    } else {
        for (const durations of Object.values(
            FALLBACK_BROADCAST_DURATIONS_BY_TYPE,
        )) {
            for (const n of durations) {
                seconds.add(n);
            }
        }
    }

    return [...seconds]
        .sort((a, b) => a - b)
        .map(blueprintDurationToPill);
}

const FALLBACK_BROADCAST_LANGUAGES = ['English', 'Spanish', 'French'] as const;

/** Languages allowed for the selected spot type. */
export function getBroadcastLanguagesForType(
    blueprint: OrderMenuFormBlueprint | null | undefined,
    type: string,
): string[] {
    const slice = getBlueprintSlice(blueprint, type);
    if (slice?.languages?.length) {
        return slice.languages;
    }
    return [...FALLBACK_BROADCAST_LANGUAGES];
}

/** Every language pill shown in the modal (union across all spot types). */
export function getAllBroadcastLanguages(
    blueprint: OrderMenuFormBlueprint | null | undefined,
): string[] {
    const typeKeys = getBlueprintTypeKeys(blueprint);
    const langs = new Set<string>();

    if (typeKeys.length > 0) {
        for (const typeKey of typeKeys) {
            for (const lang of getBroadcastLanguagesForType(
                blueprint,
                typeKey,
            )) {
                langs.add(lang);
            }
        }
    } else {
        for (const lang of FALLBACK_BROADCAST_LANGUAGES) {
            langs.add(lang);
        }
    }

    return [...langs];
}

/** Cuts allowed for the selected spot type. */
export function getBroadcastCutsForType(
    blueprint: OrderMenuFormBlueprint | null | undefined,
    type: string,
): string[] {
    const slice = getBlueprintSlice(blueprint, type);
    if (slice?.cuts?.length) {
        return slice.cuts;
    }
    return [];
}

/** Every cut option shown in the cuts combobox (union across all spot types). */
export function getAllBroadcastCuts(
    blueprint: OrderMenuFormBlueprint | null | undefined,
): string[] {
    const typeKeys = getBlueprintTypeKeys(blueprint);
    const cuts: string[] = [];
    const seen = new Set<string>();

    if (typeKeys.length > 0) {
        for (const typeKey of typeKeys) {
            for (const cut of getBroadcastCutsForType(blueprint, typeKey)) {
                if (!seen.has(cut)) {
                    seen.add(cut);
                    cuts.push(cut);
                }
            }
        }
        return cuts;
    }

    return [];
}

export function blueprintDurationToPill(seconds: number): string {
    return `:${seconds}`;
}

export function pillToBlueprintDuration(pill: string): number {
    const trimmed = pill.trim();
    if (trimmed.startsWith(':')) {
        const n = Number.parseInt(trimmed.slice(1), 10);
        return Number.isFinite(n) ? Math.max(0, n) : 0;
    }
    const parts = trimmed.split(':');
    if (parts.length === 2) {
        const m = Number.parseInt(parts[0] || '0', 10);
        const s = Number.parseInt(parts[1] || '0', 10);
        if (Number.isFinite(m) && Number.isFinite(s)) {
            return Math.max(0, m * 60 + s);
        }
    }
    const parsed = Number.parseInt(trimmed, 10);
    return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

export function isInternationalSpotType(type: string): boolean {
    return type === INTERNATIONAL_SPOT_TYPE;
}

/** Blueprint/options lookup key for unknown or custom broadcast spot types. */
export function broadcastOptionsTypeKey(
    type: string,
    knownTypeKeys: readonly string[],
): string {
    return knownTypeKeys.includes(type) ? type : 'Generic';
}

export interface InternationalLockedSelection {
    cuts: string[];
    durations: number[];
    languages: string[];
    durationPill: string;
}

/** Auto-lock cut/duration/language when type is International. */
export function applyInternationalLocks(
    type: string,
    slice: OrderMenuFormBlueprintTypeSlice | null,
): InternationalLockedSelection | null {
    if (!isInternationalSpotType(type)) {
        return null;
    }

    const cut = INTERNATIONAL_TV_PACKAGE_CUT;
    const durationSeconds = INTERNATIONAL_LOCKED_DURATION_SECONDS;
    const language = INTERNATIONAL_LOCKED_LANGUAGE;

    return {
        cuts: [cut],
        durations: [durationSeconds],
        languages: [language],
        durationPill: blueprintDurationToPill(durationSeconds),
    };
}

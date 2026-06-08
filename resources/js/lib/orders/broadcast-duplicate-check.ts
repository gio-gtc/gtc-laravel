import type { AddBroadcastStreamingFormValues } from '@/components/pages/orders/slideout/switch-view/general-media/modals/add-broadcast-streaming-modal';
import {
    venueItemEncodingIdToLabel,
    venueItemLanguageIdToLabel,
} from '@/components/utils/venue-items';
import { pillToBlueprintDuration } from '@/lib/orders/order-catalog';
import type {
    OrderItemEncoding,
    OrderItemLanguage,
    OrderItemsBroadcastRow,
} from '@/types';

export type BroadcastCombinationParts = {
    spot_type: string;
    cut: string;
    duration_seconds: number;
    language: string;
    encoding_custom?: string;
    encoding?: string;
};

function normalizeEncoding(parts: BroadcastCombinationParts): string {
    const custom = parts.encoding_custom?.trim();
    if (custom) {
        return `custom:${custom.toLowerCase()}`;
    }
    return `catalog:${(parts.encoding ?? '').trim()}`;
}

/** Stable fingerprint for one broadcast line (type + cut + duration + language + encoding). */
export function broadcastCombinationKey(
    parts: BroadcastCombinationParts,
): string {
    return [
        parts.spot_type,
        parts.cut,
        String(parts.duration_seconds),
        parts.language,
        normalizeEncoding(parts),
    ].join('|');
}

export type BroadcastDuplicateCatalogs = {
    venue_item_language?: OrderItemLanguage[];
    venue_item_encoding?: OrderItemEncoding[];
};

export function broadcastRowCombinationKey(
    row: OrderItemsBroadcastRow,
    catalogs: BroadcastDuplicateCatalogs = {},
): string | null {
    const languageCatalog = catalogs.venue_item_language ?? [];
    const encodingCatalog = catalogs.venue_item_encoding ?? [];

    const language =
        row.language?.trim() ||
        (row.language_id != null
            ? venueItemLanguageIdToLabel(row.language_id, languageCatalog)
            : '');

    if (!language) {
        return null;
    }

    const encodingCustom = row.encoding_custom?.trim();
    const encoding =
        row.encoding?.trim() ||
        (row.encoding_id != null
            ? venueItemEncodingIdToLabel(row.encoding_id, encodingCatalog)
            : '');

    return broadcastCombinationKey({
        spot_type: row.spot_type,
        cut: row.cut,
        duration_seconds: row.duration_seconds,
        language,
        encoding_custom: encodingCustom || undefined,
        encoding: encodingCustom ? undefined : encoding || undefined,
    });
}

function encodingRowToCombinationParts(
    form: AddBroadcastStreamingFormValues,
    enc: AddBroadcastStreamingFormValues['encodings'][number],
): BroadcastCombinationParts | null {
    const language = enc.language?.trim();
    if (!language) {
        return null;
    }

    if (enc.encodingMode === 'custom') {
        const text = enc.encoding.trim();
        if (!text) {
            return null;
        }
        return {
            spot_type: form.type,
            cut: enc.cut,
            duration_seconds: pillToBlueprintDuration(enc.duration),
            language,
            encoding_custom: text,
        };
    }

    const catalogEncoding = enc.encoding?.trim();
    if (!catalogEncoding) {
        return null;
    }

    return {
        spot_type: form.type,
        cut: enc.cut,
        duration_seconds: pillToBlueprintDuration(enc.duration),
        language,
        encoding: catalogEncoding,
    };
}

/** Encoding rows from the add form that match an existing broadcast line on the order. */
export function findBroadcastFormDuplicates(
    form: AddBroadcastStreamingFormValues,
    existingRows: OrderItemsBroadcastRow[],
    catalogs: BroadcastDuplicateCatalogs = {},
): AddBroadcastStreamingFormValues['encodings'] {
    const existingKeys = new Set(
        existingRows
            .map((row) => broadcastRowCombinationKey(row, catalogs))
            .filter((key): key is string => key != null),
    );

    if (existingKeys.size === 0) {
        return [];
    }

    return form.encodings.filter((enc) => {
        const parts = encodingRowToCombinationParts(form, enc);
        if (!parts) {
            return false;
        }
        return existingKeys.has(broadcastCombinationKey(parts));
    });
}

export function hasBroadcastFormDuplicates(
    form: AddBroadcastStreamingFormValues,
    existingRows: OrderItemsBroadcastRow[],
    catalogs: BroadcastDuplicateCatalogs = {},
): boolean {
    return (
        findBroadcastFormDuplicates(form, existingRows, catalogs).length > 0
    );
}

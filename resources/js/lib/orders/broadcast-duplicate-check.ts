import type { AddBroadcastStreamingFormValues } from '@/components/pages/orders/slideout/switch-view/general-media/modals/add-broadcast-streaming-modal';
import {
    venueItemEncodingIdToLabel,
    venueItemLanguageIdToLabel,
} from '@/components/utils/venue-items';
import {
    durationWireFromPill,
    encodingFingerprint,
    encodingWireFromRowLabel,
} from '@/lib/orders/broadcast-spec-wire';
import type {
    OrderItemEncoding,
    OrderItemLanguage,
    OrderItemsBroadcastRow,
} from '@/types';

export type BroadcastCombinationParts = {
    spot_type: string;
    cut: string;
    duration_seconds: string;
    language: string;
    encoding: string[];
};

function normalizeEncoding(parts: BroadcastCombinationParts): string {
    return encodingFingerprint(parts.encoding);
}

/** Stable fingerprint for one broadcast line (type + cut + duration + language + encoding). */
export function broadcastCombinationKey(
    parts: BroadcastCombinationParts,
): string {
    return [
        parts.spot_type,
        parts.cut,
        parts.duration_seconds,
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

    let encodingLabels: string[] = [];
    if (Array.isArray(row.encoding) && row.encoding.length > 0) {
        encodingLabels = row.encoding;
    } else if (row.encoding_label?.trim()) {
        encodingLabels = [row.encoding_label.trim()];
    } else if (row.encoding_id != null) {
        const label = venueItemEncodingIdToLabel(
            row.encoding_id,
            encodingCatalog,
        );
        if (label) {
            encodingLabels = [label];
        }
    }

    const durationWire =
        typeof row.duration_seconds === 'string'
            ? row.duration_seconds.trim()
            : String(row.duration_seconds);

    return broadcastCombinationKey({
        spot_type: row.spot_type,
        cut: row.cut,
        duration_seconds: durationWire,
        language,
        encoding: encodingLabels,
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

    const encoding =
        enc.encodingMode === 'custom'
            ? encodingWireFromRowLabel(enc.encoding)
            : encodingWireFromRowLabel(enc.encoding);

    if (encoding.length === 0) {
        return null;
    }

    return {
        spot_type: form.type,
        cut: enc.cut,
        duration_seconds: durationWireFromPill(enc.duration),
        language,
        encoding,
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

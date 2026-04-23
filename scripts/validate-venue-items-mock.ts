/**
 * Validates config/mockdata/generated/venueItems.json media rows use only
 * add-modal spot_type / cut pairs. Run: npx tsx scripts/validate-venue-items-mock.ts
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    isValidAudioSpotCut,
    isValidBroadcastSpotCut,
    isValidSocialSpotCut,
    VENUE_ITEM_ART_PACKAGE_TYPES,
    VENUE_ITEM_SOCIAL_CARD_HOLDERS,
} from '../resources/js/components/pages/orders/slideout/switch-view/general-media/modals/spot-type-cuts-options.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const jsonPath = join(__dirname, '../config/mockdata/generated/venueItems.json');

const allowedArtPackages = new Set<string>(VENUE_ITEM_ART_PACKAGE_TYPES);
const allowedCardHolders = new Set<string>(VENUE_ITEM_SOCIAL_CARD_HOLDERS);

/** ISO 8601 with Z suffix (UTC), e.g. 2026-04-21T12:00:00.000Z */
const ISO_UTC_RE =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

type VenueItemRow = {
    id: string;
    type: string;
    spot_type?: string;
    cut?: string;
    label?: string;
    package_type?: string;
    card_holder?: string;
};

type VenueItemNoteRow = {
    id: number;
    venue_item_id: string;
    user_id: number;
    message: string;
    created_date: string;
    updated_date: string | null;
    deleted_date: string | null;
};

const data = JSON.parse(readFileSync(jsonPath, 'utf8')) as {
    venue_items: VenueItemRow[];
    venue_item_notes?: VenueItemNoteRow[];
};

let errors = 0;
for (const row of data.venue_items) {
    const created = (row as { created_date?: string }).created_date;
    if (typeof created !== 'string' || !ISO_UTC_RE.test(created)) {
        console.error(
            `Invalid or missing created_date on row ${row.id}: expected ISO 8601 UTC (…Z), got ${JSON.stringify(created)}`,
        );
        errors++;
    }

    const { type, spot_type: st, cut, id } = row;
    if (type === 'broadcast') {
        if (!st || !cut || !isValidBroadcastSpotCut(st, cut)) {
            console.error(
                `Invalid broadcast row ${id}: spot_type=${JSON.stringify(st)} cut=${JSON.stringify(cut)}`,
            );
            errors++;
        }
    } else if (type === 'radio') {
        if (!st || !cut || !isValidAudioSpotCut(st, cut)) {
            console.error(
                `Invalid radio row ${id}: spot_type=${JSON.stringify(st)} cut=${JSON.stringify(cut)}`,
            );
            errors++;
        }
    } else if (type === 'social') {
        if (!st || !cut || !isValidSocialSpotCut(st, cut)) {
            console.error(
                `Invalid social row ${id}: spot_type=${JSON.stringify(st)} cut=${JSON.stringify(cut)}`,
            );
            errors++;
        }
        const ch = row.card_holder;
        if (ch !== undefined && !allowedCardHolders.has(ch)) {
            console.error(
                `Invalid social row ${id}: card_holder=${JSON.stringify(ch)} (expected Amex, Citi, or omit)`,
            );
            errors++;
        }
    } else if (type === 'art') {
        const pkg = row.package_type;
        if (!pkg || !allowedArtPackages.has(pkg)) {
            console.error(
                `Invalid art row ${id}: package_type must be one of ${[...allowedArtPackages].join(', ')}`,
            );
            errors++;
        }
    }
}

const venueItemIds = new Set(data.venue_items.map((r) => r.id));
const seenNoteIds = new Set<number>();
for (const note of data.venue_item_notes ?? []) {
    if (typeof note.id !== 'number' || !Number.isInteger(note.id)) {
        console.error(
            `Invalid venue_item_notes row: id must be an integer, got ${JSON.stringify(note.id)}`,
        );
        errors++;
    } else if (seenNoteIds.has(note.id)) {
        console.error(
            `Duplicate venue_item_notes id ${note.id}`,
        );
        errors++;
    } else {
        seenNoteIds.add(note.id);
    }

    if (
        typeof note.venue_item_id !== 'string' ||
        !venueItemIds.has(note.venue_item_id)
    ) {
        console.error(
            `Invalid venue_item_notes row ${note.id}: venue_item_id=${JSON.stringify(note.venue_item_id)} does not reference a known venue_items.id`,
        );
        errors++;
    }

    if (typeof note.user_id !== 'number' || !Number.isInteger(note.user_id)) {
        console.error(
            `Invalid venue_item_notes row ${note.id}: user_id must be an integer, got ${JSON.stringify(note.user_id)}`,
        );
        errors++;
    }

    if (typeof note.message !== 'string' || note.message.trim() === '') {
        console.error(
            `Invalid venue_item_notes row ${note.id}: message must be a non-empty string`,
        );
        errors++;
    }

    if (
        typeof note.created_date !== 'string' ||
        !ISO_UTC_RE.test(note.created_date)
    ) {
        console.error(
            `Invalid venue_item_notes row ${note.id}: created_date must be ISO 8601 UTC (…Z), got ${JSON.stringify(note.created_date)}`,
        );
        errors++;
    }

    if (
        note.updated_date !== null &&
        (typeof note.updated_date !== 'string' ||
            !ISO_UTC_RE.test(note.updated_date))
    ) {
        console.error(
            `Invalid venue_item_notes row ${note.id}: updated_date must be null or ISO 8601 UTC (…Z), got ${JSON.stringify(note.updated_date)}`,
        );
        errors++;
    }

    if (
        note.deleted_date !== null &&
        (typeof note.deleted_date !== 'string' ||
            !ISO_UTC_RE.test(note.deleted_date))
    ) {
        console.error(
            `Invalid venue_item_notes row ${note.id}: deleted_date must be null or ISO 8601 UTC (…Z), got ${JSON.stringify(note.deleted_date)}`,
        );
        errors++;
    }
}

if (errors > 0) {
    process.exit(1);
}
console.log(
    'venueItems.json: broadcast/radio/social/art rows + venue_item_notes pass modal and contract checks.',
);

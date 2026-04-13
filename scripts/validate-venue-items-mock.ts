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

type VenueItemRow = {
    id: string;
    type: string;
    spot_type?: string;
    cut?: string;
    label?: string;
    package_type?: string;
    card_holder?: string;
};

const data = JSON.parse(readFileSync(jsonPath, 'utf8')) as {
    venue_items: VenueItemRow[];
};

let errors = 0;
for (const row of data.venue_items) {
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

if (errors > 0) {
    process.exit(1);
}
console.log(
    'venueItems.json: broadcast/radio/social/art rows pass modal and contract checks.',
);

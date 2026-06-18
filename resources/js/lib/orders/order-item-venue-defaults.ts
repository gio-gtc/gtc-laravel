import {
    BROADCAST_SPOT_TYPES,
    SOCIAL_CUT_OPTIONS,
    SOCIAL_VIDEO_TYPE_OPTIONS,
    VENUE_ITEM_ART_PACKAGE_TYPES,
    VENUE_ITEM_SOCIAL_CARD_HOLDERS,
    type AudioSpotType,
    type BroadcastSpotType,
    type OrderItemSocialCardHolder,
    type SocialCutOption,
    type SocialVideoLayoutType,
    type VenueItemArtPackageType,
} from '@/components/pages/orders/slideout/switch-view/general-media/modals/spot-type-cuts-options';
import {
    specString,
    type OrderItemSpecRecord,
} from '@/lib/orders/order-item-specifications';

export function defaultBroadcastSpotType(
    specs: OrderItemSpecRecord,
): string {
    const type = specString(specs, 'type');
    if (BROADCAST_SPOT_TYPES.includes(type as BroadcastSpotType)) {
        return type as BroadcastSpotType;
    }
    if (type.trim() !== '') {
        return type;
    }
    return 'Generic';
}

export function defaultAudioSpotType(
    specs: OrderItemSpecRecord,
): AudioSpotType | string {
    const type = specString(specs, 'type');
    if (BROADCAST_SPOT_TYPES.includes(type as AudioSpotType)) {
        return type as AudioSpotType;
    }
    if (type.trim() !== '') {
        return type;
    }
    return 'Generic';
}

export function defaultSocialSpotType(
    specs: OrderItemSpecRecord,
): SocialVideoLayoutType | string {
    const type = specString(specs, 'type');
    if (SOCIAL_VIDEO_TYPE_OPTIONS.includes(type as SocialVideoLayoutType)) {
        return type as SocialVideoLayoutType;
    }
    if (type.trim() !== '') {
        return type;
    }
    return 'Social - 16:9';
}

export function defaultSocialCut(
    specs: OrderItemSpecRecord,
): SocialCutOption | string {
    const cut = specString(specs, 'cut');
    if (SOCIAL_CUT_OPTIONS.includes(cut as SocialCutOption)) {
        return cut as SocialCutOption;
    }
    if (cut.trim() !== '') {
        return cut;
    }
    return 'On Sale Now';
}

export function defaultSocialCardHolder(
    specs: OrderItemSpecRecord,
): string | undefined {
    const holder = specString(specs, 'card_holder');
    return holder || undefined;
}

export function isKnownSocialCardHolder(
    value: string,
): value is OrderItemSocialCardHolder {
    return VENUE_ITEM_SOCIAL_CARD_HOLDERS.includes(
        value as OrderItemSocialCardHolder,
    );
}

export function defaultArtPackage(
    specs: OrderItemSpecRecord,
): VenueItemArtPackageType {
    const type = specString(specs, 'type');
    if (VENUE_ITEM_ART_PACKAGE_TYPES.includes(type as VenueItemArtPackageType)) {
        return type as VenueItemArtPackageType;
    }
    return VENUE_ITEM_ART_PACKAGE_TYPES[0];
}

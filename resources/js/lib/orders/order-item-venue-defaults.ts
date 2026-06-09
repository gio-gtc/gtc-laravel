import {
    BROADCAST_SPOT_TYPES,
    SOCIAL_CUT_OPTIONS,
    SOCIAL_VIDEO_TYPE_OPTIONS,
    VENUE_ITEM_ART_PACKAGE_TYPES,
    type BroadcastSpotType,
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
): BroadcastSpotType {
    const type = specString(specs, 'type');
    if (BROADCAST_SPOT_TYPES.includes(type as BroadcastSpotType)) {
        return type as BroadcastSpotType;
    }
    return 'Generic';
}

export function defaultSocialSpotType(
    specs: OrderItemSpecRecord,
): SocialVideoLayoutType {
    const type = specString(specs, 'type');
    if (SOCIAL_VIDEO_TYPE_OPTIONS.includes(type as SocialVideoLayoutType)) {
        return type as SocialVideoLayoutType;
    }
    return 'Social - 16:9';
}

export function defaultSocialCut(specs: OrderItemSpecRecord): SocialCutOption {
    const cut = specString(specs, 'cut');
    if (SOCIAL_CUT_OPTIONS.includes(cut as SocialCutOption)) {
        return cut as SocialCutOption;
    }
    return 'On Sale Now';
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

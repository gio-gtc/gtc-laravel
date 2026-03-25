export type DemoTab = 'broadcast' | 'social' | 'radio' | 'art';

export type DemoAssetKind = 'video' | 'image';

export interface DemoAsset {
    id: string;
    tab: DemoTab;
    title: string;
    durationLabel: string;
    thumbnailUrl: string;
    mediaUrl: string;
    kind: DemoAssetKind;
}

export interface DemoShowPageProps {
    uuid: string;
    tourName: string;
    venueName: string;
    assets: DemoAsset[];
}

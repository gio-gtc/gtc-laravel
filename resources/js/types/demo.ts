export type DemoTab = 'broadcast' | 'social' | 'radio' | 'art';

export type DemoAssetKind = 'video' | 'audio' | 'image';

export interface DemoAsset {
    id: string;
    tab: DemoTab;
    label: string;
    duration_seconds: number;
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

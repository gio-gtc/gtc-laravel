import DemoBrandBadge from '@/components/pages/demo/demo-brand-badge';
import DemoHeaderTitle from '@/components/pages/demo/demo-header-title';
import DemoMediaStage from '@/components/pages/demo/demo-media-stage';
import DemoSidebar from '@/components/pages/demo/demo-sidebar';
import DemoLayout from '@/layouts/demo-layout';
import {
    type DemoAsset,
    type DemoShowPageProps,
    type DemoTab,
} from '@/types/demo';
import { useCallback, useMemo, useState } from 'react';

function defaultTab(assets: DemoAsset[]): DemoTab {
    return assets[0]?.tab ?? 'broadcast';
}

function firstAssetIdForTab(assets: DemoAsset[], tab: DemoTab): string {
    const first = assets.find((a) => a.tab === tab);
    return first?.id ?? assets[0]?.id ?? '';
}

export default function DemoShow({
    tourName,
    venueName,
    assets,
}: DemoShowPageProps) {
    const initialTab = useMemo(() => defaultTab(assets), [assets]);
    const [activeTab, setActiveTab] = useState<DemoTab>(initialTab);
    const [selectedId, setSelectedId] = useState(() =>
        firstAssetIdForTab(assets, initialTab),
    );

    const filteredAssets = useMemo(
        () => assets.filter((a) => a.tab === activeTab),
        [assets, activeTab],
    );

    const selectedAsset =
        assets.find((a) => a.id === selectedId) ?? filteredAssets[0] ?? null;

    const reserveBottomForMedia =
        selectedAsset?.kind === 'video' || selectedAsset?.kind === 'audio';

    const handleTabChange = useCallback(
        (tab: DemoTab) => {
            setActiveTab(tab);
            const inTab = assets.some(
                (a) => a.tab === tab && a.id === selectedId,
            );
            if (!inTab) {
                setSelectedId(firstAssetIdForTab(assets, tab));
            }
        },
        [assets, selectedId],
    );

    const pageTitle = `${tourName} — Demo`;

    return (
        <DemoLayout title={pageTitle}>
            <div className="relative size-full overflow-hidden bg-black">
                <DemoHeaderTitle tourName={tourName} venueName={venueName} />

                <DemoSidebar
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                    assets={filteredAssets}
                    selectedId={selectedAsset?.id ?? selectedId}
                    onSelectAsset={setSelectedId}
                    reserveBottomForMedia={reserveBottomForMedia}
                />
                <div className="absolute inset-0">
                    <DemoMediaStage asset={selectedAsset} />
                </div>

                <DemoBrandBadge />
            </div>
        </DemoLayout>
    );
}

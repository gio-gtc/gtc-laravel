import { CustomSocialIcon } from '@/components/ui/icons';
import { formatDurationSeconds } from '@/helper-functions/format-time';
import { useCoarseOrNoHoverPointer } from '@/hooks/use-coarse-or-no-hover-pointer';
import { unpicPassthroughTransform } from '@/lib/unpic-passthrough-transform';
import { cn } from '@/lib/utils';
import { type DemoAsset, type DemoTab } from '@/types/demo';
import { Image } from '@unpic/react/base';
import {
    BoomBoxIcon,
    Menu,
    RadioTower,
    WallpaperIcon,
    type LucideIcon,
} from 'lucide-react';
import { useCallback, useState } from 'react';

const TABS: { id: DemoTab; label: string; icon: LucideIcon }[] = [
    { id: 'broadcast', label: 'Broadcast', icon: RadioTower },
    { id: 'social', label: 'Social', icon: CustomSocialIcon },
    { id: 'radio', label: 'Radio', icon: BoomBoxIcon },
    { id: 'art', label: 'Art', icon: WallpaperIcon },
];

export default function DemoSidebar({
    activeTab,
    onTabChange,
    assets,
    selectedId,
    onSelectAsset,
}: {
    activeTab: DemoTab;
    onTabChange: (tab: DemoTab) => void;
    assets: DemoAsset[];
    selectedId: string;
    onSelectAsset: (id: string) => void;
}) {
    const isCoarse = useCoarseOrNoHoverPointer();
    const [touchOpen, setTouchOpen] = useState(false);

    const closeTouch = useCallback(() => setTouchOpen(false), []);
    const openTouch = useCallback(() => setTouchOpen(true), []);

    return (
        <>
            {isCoarse ? (
                <>
                    {!touchOpen ? (
                        <button
                            type="button"
                            className="fixed top-1 right-1 z-[10] flex size-8 items-center justify-center text-white shadow-lg"
                            onClick={openTouch}
                            aria-expanded={touchOpen}
                            aria-controls="demo-assets-panel"
                        >
                            <span className="sr-only">Open assets panel</span>
                            <Menu className="size-5 shrink-0" aria-hidden />
                        </button>
                    ) : null}
                    {touchOpen ? (
                        <button
                            type="button"
                            className="fixed inset-0 z-[8] bg-black/50"
                            aria-label="Close assets panel"
                            onClick={closeTouch}
                        />
                    ) : null}
                </>
            ) : null}
            <div
                className={cn(
                    'demo-sidebar-rail absolute top-0 right-0 bottom-0 z-10 flex justify-end overflow-visible',
                    isCoarse && !touchOpen && 'w-0',
                    (!isCoarse || touchOpen) &&
                        'w-[min(22rem,90vw)] md:w-[min(26rem,45vw)]',
                    isCoarse && touchOpen && 'demo-sidebar-rail--open z-[25]',
                )}
            >
                <aside
                    id="demo-assets-panel"
                    className={cn(
                        'demo-sidebar-panel absolute top-0 right-0 bottom-0 flex min-h-0 w-full flex-col bg-black/40',
                    )}
                >
                    {/* Sidebar Navigation */}
                    <div className="flex shrink-0 md:h-[var(--theater-mode-spacing)]">
                        {TABS.map(({ id, label, icon: Icon }) => {
                            const active = activeTab === id;
                            return (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => onTabChange(id)}
                                    className={`flex max-w-[120px] min-w-0 flex-1 grow cursor-pointer flex-col items-center justify-center gap-2 px-2 py-4 text-white uppercase transition-all duration-300 ${
                                        active
                                            ? 'grow-2 bg-white/15 text-white'
                                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                                    }`}
                                >
                                    <Icon
                                        className="size-[40px] shrink-0 text-white opacity-90"
                                        strokeWidth={1.5}
                                        aria-hidden
                                    />
                                    <span className="text-xl">{label}</span>
                                </button>
                            );
                        })}
                    </div>
                    {/* Sidebar Items */}
                    <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto px-2 py-3">
                        {assets.map((asset) => {
                            const selected = asset.id === selectedId;
                            return (
                                <li key={asset.id}>
                                    <button
                                        type="button"
                                        onClick={() => onSelectAsset(asset.id)}
                                        className={cn(
                                            'flex w-full cursor-pointer gap-3 rounded-lg p-2 text-left outline-none focus:outline-none',
                                            'transition-[box-shadow,backdrop-filter] duration-200',
                                            'focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-0',
                                            selected
                                                ? 'bg-gradient-to-br from-white/20 via-transparent to-transparent shadow-lg ring-1 ring-white/12 backdrop-blur-lg ring-inset'
                                                : 'hover:bg-gradient-to-br hover:from-white/10 hover:via-transparent hover:to-transparent hover:shadow-xs hover:backdrop-blur-xs',
                                        )}
                                    >
                                        <Image
                                            src={asset.thumbnailUrl}
                                            alt={asset.label}
                                            layout="fixed"
                                            width={120}
                                            height={64}
                                            objectFit="cover"
                                            transformer={
                                                unpicPassthroughTransform
                                            }
                                            className="h-16 w-30 shrink-0 rounded object-cover"
                                        />
                                        <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
                                            <span className="text-white uppercase">
                                                {asset.label}
                                            </span>
                                            {asset.duration_seconds > 0 ? (
                                                <span className="text-gray-400 tabular-nums">
                                                    {formatDurationSeconds(
                                                        asset.duration_seconds,
                                                    )}
                                                </span>
                                            ) : null}
                                        </div>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </aside>
            </div>
        </>
    );
}

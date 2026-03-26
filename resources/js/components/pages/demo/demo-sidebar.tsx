import { useCoarseOrNoHoverPointer } from '@/hooks/use-coarse-or-no-hover-pointer';
import { cn } from '@/lib/utils';
import { type DemoAsset, type DemoTab } from '@/types/demo';
import {
    Frame,
    Menu,
    Radio,
    RadioTower,
    Share2,
    type LucideIcon,
} from 'lucide-react';
import { useCallback, useState } from 'react';

const TABS: { id: DemoTab; label: string; icon: LucideIcon }[] = [
    { id: 'broadcast', label: 'Broadcast', icon: RadioTower },
    { id: 'social', label: 'Social', icon: Share2 },
    { id: 'radio', label: 'Radio', icon: Radio },
    { id: 'art', label: 'Art', icon: Frame },
];

export default function DemoSidebar({
    activeTab,
    onTabChange,
    assets,
    selectedId,
    onSelectAsset,
    reserveBottomForMedia,
}: {
    activeTab: DemoTab;
    onTabChange: (tab: DemoTab) => void;
    assets: DemoAsset[];
    selectedId: string;
    onSelectAsset: (id: string) => void;
    reserveBottomForMedia: boolean;
}) {
    const isCoarse = useCoarseOrNoHoverPointer();
    const [touchOpen, setTouchOpen] = useState(false);

    const closeTouch = useCallback(() => setTouchOpen(false), []);
    const openTouch = useCallback(() => setTouchOpen(true), []);

    const bottomClass = reserveBottomForMedia ? 'bottom-[40px]' : 'bottom-0';

    return (
        <>
            {isCoarse ? (
                <>
                    {!touchOpen ? (
                        <button
                            type="button"
                            className="fixed top-1 right-1 z-[11] flex size-10 items-center justify-center text-white shadow-lg"
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
                    'demo-sidebar-rail absolute top-0 right-0 z-10 flex justify-end overflow-visible',
                    bottomClass,
                    isCoarse && !touchOpen && 'w-0',
                    (!isCoarse || touchOpen) &&
                        'w-[min(22rem,90vw)] md:w-[min(26rem,45vw)]',
                    isCoarse && touchOpen && 'demo-sidebar-rail--open z-[25]',
                )}
            >
                <aside
                    id="demo-assets-panel"
                    className={cn(
                        'demo-sidebar-panel absolute top-0 right-0 bottom-0 flex min-h-0 w-full flex-col bg-zinc-900/10 backdrop-blur-md',
                    )}
                >
                    {/* {isCoarse ? (
                        <button
                            type="button"
                            onClick={closeTouch}
                            className="absolute top-[4.25rem] right-2 z-20 rounded-md bg-white/10 p-2 text-white hover:bg-white/20"
                            aria-label="Close assets panel"
                        >
                            <X className="size-4" aria-hidden />
                        </button>
                    ) : null} */}
                    <div className="flex shrink-0">
                        {TABS.map(({ id, label, icon: Icon }) => {
                            const active = activeTab === id;
                            return (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => onTabChange(id)}
                                    className={`flex min-w-0 flex-1 flex-col items-center gap-2 px-2 py-4 text-white uppercase transition-colors ${
                                        active
                                            ? 'bg-white/15 text-white'
                                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                                    }`}
                                >
                                    <Icon
                                        className="size-[40px] shrink-0 opacity-90"
                                        strokeWidth={1.5}
                                        aria-hidden
                                    />
                                    <span className="text-xl">{label}</span>
                                </button>
                            );
                        })}
                    </div>
                    <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto px-2 py-3">
                        {assets.map((asset) => {
                            const selected = asset.id === selectedId;
                            return (
                                <li key={asset.id}>
                                    <button
                                        type="button"
                                        onClick={() => onSelectAsset(asset.id)}
                                        className={`flex w-full gap-3 rounded-lg p-2 text-left transition-colors ${
                                            selected
                                                ? 'border bg-white/10'
                                                : 'hover:bg-white/5'
                                        }`}
                                    >
                                        <img
                                            src={asset.thumbnailUrl}
                                            alt=""
                                            className="h-16 w-30 shrink-0 rounded object-cover"
                                        />
                                        <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
                                            <span className="text-white uppercase">
                                                {asset.title}
                                            </span>
                                            <span className="text-gray-400 tabular-nums">
                                                {asset.durationLabel}
                                            </span>
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

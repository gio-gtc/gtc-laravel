import { type DemoAsset, type DemoTab } from '@/types/demo';
import { Frame, Radio, RadioTower, Share2, type LucideIcon } from 'lucide-react';

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
}: {
    activeTab: DemoTab;
    onTabChange: (tab: DemoTab) => void;
    assets: DemoAsset[];
    selectedId: string;
    onSelectAsset: (id: string) => void;
}) {
    return (
        <aside className="demo-chrome absolute top-0 right-0 z-10 flex h-full w-[min(22rem,90vw)] flex-col border-l border-white/10 bg-zinc-900/85 pt-20 backdrop-blur-md sm:w-[min(22rem,28vw)]">
            <div className="flex shrink-0 gap-1 border-b border-white/10 px-2 pt-2 pb-3">
                {TABS.map(({ id, label, icon: Icon }) => {
                    const active = activeTab === id;
                    return (
                        <button
                            key={id}
                            type="button"
                            onClick={() => onTabChange(id)}
                            className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-md px-1 py-2 text-[0.65rem] font-medium tracking-wide text-white uppercase transition-colors ${
                                active
                                    ? 'bg-white/15 text-white'
                                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            <Icon
                                className="size-4 shrink-0 opacity-90"
                                strokeWidth={1.5}
                                aria-hidden
                            />
                            <span className="truncate">{label}</span>
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
                                        ? 'bg-white/20'
                                        : 'hover:bg-white/10'
                                }`}
                            >
                                <img
                                    src={asset.thumbnailUrl}
                                    alt=""
                                    className="size-16 shrink-0 rounded object-cover"
                                />
                                <div className="min-w-0 flex flex-1 flex-col justify-center gap-0.5">
                                    <span className="text-xs font-semibold tracking-wide text-white uppercase">
                                        {asset.title}
                                    </span>
                                    <span className="text-[0.65rem] text-white/60 tabular-nums">
                                        {asset.durationLabel}
                                    </span>
                                </div>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </aside>
    );
}

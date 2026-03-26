import { type DemoAsset } from '@/types/demo';
import { useRef, type MouseEvent } from 'react';

const DEMO_AUDIO_POSTER = '/GTC-audio.jpg';

export default function DemoMediaStage({ asset }: { asset: DemoAsset | null }) {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    if (!asset) {
        return (
            <div className="flex size-full items-center justify-center bg-black text-white/50">
                No media
            </div>
        );
    }

    if (asset.kind === 'image') {
        return (
            <img
                key={asset.id}
                src={asset.mediaUrl}
                alt=""
                className="size-full object-cover"
            />
        );
    }

    if (asset.kind === 'audio') {
        const handleAudioStageClick = (e: MouseEvent<HTMLDivElement>) => {
            const t = e.target;
            if (!(t instanceof Element) || t.closest('audio')) return;
            const el = audioRef.current;
            if (!el) return;
            if (el.paused) {
                void el.play().catch(() => {});
            } else {
                el.pause();
            }
        };

        return (
            <div
                key={asset.id}
                className="relative size-full cursor-pointer overflow-hidden"
                onClick={handleAudioStageClick}
            >
                <div
                    className="absolute inset-0 z-0 bg-contain bg-center bg-no-repeat lg:bg-cover"
                    style={{
                        backgroundImage: `url('${DEMO_AUDIO_POSTER}')`,
                    }}
                    aria-hidden
                />
                <audio
                    ref={audioRef}
                    className="absolute inset-x-0 bottom-0 z-10 w-full cursor-default"
                    controls
                    preload="metadata"
                    src={asset.mediaUrl}
                />
            </div>
        );
    }

    return (
        <video
            key={asset.id}
            className="size-full object-cover"
            controls
            playsInline
            preload="metadata"
            src={asset.mediaUrl}
        />
    );
}

import { type DemoAsset } from '@/types/demo';
import { Pause, Play } from 'lucide-react';
import { useEffect, useRef, useState, type MouseEvent } from 'react';

const DEMO_AUDIO_POSTER = '/GTC-audio.jpg';

function DemoAudioStage({ id, mediaUrl }: { id: string; mediaUrl: string }) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [playing, setPlaying] = useState(false);

    useEffect(() => {
        const el = audioRef.current;
        if (!el) return;
        const sync = () => setPlaying(!el.paused);
        sync();
        el.addEventListener('play', sync);
        el.addEventListener('pause', sync);
        el.addEventListener('ended', sync);
        return () => {
            el.removeEventListener('play', sync);
            el.removeEventListener('pause', sync);
            el.removeEventListener('ended', sync);
        };
    }, [id, mediaUrl]);

    const togglePlayback = () => {
        const el = audioRef.current;
        if (!el) return;
        if (el.paused) void el.play().catch(() => {});
        else el.pause();
    };

    const handleAudioStageClick = (e: MouseEvent<HTMLDivElement>) => {
        const t = e.target;
        if (!(t instanceof Element) || t.closest('audio')) return;
        togglePlayback();
    };

    const handleOverlayButtonClick = (e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        togglePlayback();
    };

    return (
        <div
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
            <div className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center">
                {/* Chrome matches Video.js `.vjs-big-play-button` + white icons like `.video-js` / `.vjs-play-control` (video-js.css). */}
                <button
                    type="button"
                    className="box-border flex h-[1.63332em] w-[3em] cursor-pointer items-center justify-center rounded-[0.3em] border-[0.06666em] border-solid border-white bg-[rgba(43,51,63,0.7)] text-[30px] text-white transition-all duration-[400ms] hover:border-white hover:bg-[rgba(115,133,159,0.5)] hover:transition-none focus-visible:bg-[rgba(115,133,159,0.5)] focus-visible:outline-none focus-visible:transition-none"
                    aria-label={playing ? 'Pause' : 'Play'}
                    onClick={handleOverlayButtonClick}
                >
                    {playing ? (
                        <Pause
                            className="size-[1em] shrink-0 text-white"
                            stroke="currentColor"
                            strokeWidth={1.5}
                            aria-hidden
                        />
                    ) : (
                        <Play
                            className="size-[1em] shrink-0 translate-x-[0.08em] text-white"
                            stroke="currentColor"
                            strokeWidth={1.5}
                            aria-hidden
                        />
                    )}
                </button>
            </div>
            <audio
                ref={audioRef}
                className="absolute inset-x-0 bottom-0 z-10 w-full cursor-default"
                controls
                preload="metadata"
                src={mediaUrl}
            />
        </div>
    );
}

export default function DemoMediaStage({ asset }: { asset: DemoAsset | null }) {
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
        return (
            <DemoAudioStage
                key={asset.id}
                id={asset.id}
                mediaUrl={asset.mediaUrl}
            />
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

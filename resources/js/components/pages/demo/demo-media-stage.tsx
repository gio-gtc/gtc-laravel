import { type DemoAsset } from '@/types/demo';
import { Pause, Play } from 'lucide-react';
import {
    useEffect,
    useRef,
    useState,
    type MouseEvent,
    type RefObject,
} from 'react';

const DEMO_AUDIO_POSTER = '/GTC-audio.jpg';

function useMediaPlayRejectionGuard(
    mediaRef: RefObject<HTMLMediaElement | null>,
    id: string,
    mediaUrl: string,
) {
    useEffect(() => {
        const el = mediaRef.current;
        if (!el) return;
        const nativePlay = el.play.bind(el);
        el.play = () => nativePlay().catch(() => undefined);
        return () => {
            el.play = nativePlay;
        };
    }, [id, mediaUrl, mediaRef]);
}

function DemoAudioStage({ id, mediaUrl }: { id: string; mediaUrl: string }) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    useMediaPlayRejectionGuard(audioRef, id, mediaUrl);
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
        if (el.paused) void el.play();
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
                className="absolute inset-0 z-0 bg-contain bg-center bg-no-repeat object-contain lg:bg-cover"
                style={{
                    backgroundImage: `url('${DEMO_AUDIO_POSTER}')`,
                }}
                aria-hidden
            />
            <div className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center opacity-100 transition-opacity duration-300 ease-in-out hover:opacity-40">
                <button
                    type="button"
                    className="box-border flex size-30 cursor-pointer items-center justify-center rounded-full bg-gray-900/70 text-[30px] text-white"
                    aria-label={playing ? 'Pause' : 'Play'}
                    onClick={handleOverlayButtonClick}
                >
                    {playing ? (
                        <Pause
                            className="size-12 shrink-0 fill-current text-white"
                            stroke="currentColor"
                            strokeWidth={1.5}
                            aria-hidden
                        />
                    ) : (
                        <Play
                            className="size-12 shrink-0 fill-current text-white"
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

function DemoVideoStage({ id, mediaUrl }: { id: string; mediaUrl: string }) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    useMediaPlayRejectionGuard(videoRef, id, mediaUrl);

    return (
        <div className="relative size-full overflow-hidden bg-black">
            <video
                ref={videoRef}
                className="absolute inset-0 h-full w-full object-contain"
                controls
                playsInline
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
                className="absolute inset-0 h-full w-full object-contain"
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
        <DemoVideoStage
            key={asset.id}
            id={asset.id}
            mediaUrl={asset.mediaUrl}
        />
    );
}

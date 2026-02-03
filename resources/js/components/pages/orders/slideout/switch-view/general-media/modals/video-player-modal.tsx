'use client';

import {
    Dialog,
    DialogContent,
    DialogTitle,
} from '@/components/ui/dialog';
import { Maximize2, Pause, Play, Volume2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const PLACEHOLDER_IMAGE =
    'data:image/svg+xml,' +
    encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360"><rect fill="%23e5e7eb" width="640" height="360"/><g fill="%239ca3af"><circle cx="320" cy="180" r="48"/><path d="M308 160v40l32-20-32-20z"/></g></svg>',
    );

/** Default video used when no per-row URL is provided (demo/placeholder). */
const DEFAULT_VIDEO_SRC = '/videos/auth-login.mp4';

interface VideoPlayerModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** Optional video URL (e.g. from row.previewVideoUrl). When not provided, default placeholder video is used. */
    videoSrc?: string | null;
    /** Optional label for the preview (e.g. cut name or ISCI). */
    label?: string;
}

function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function VideoPlayerModal({
    isOpen,
    onClose,
    videoSrc,
    label,
}: VideoPlayerModalProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [scrubHoverTime, setScrubHoverTime] = useState<number | null>(null);
    const [scrubHoverX, setScrubHoverX] = useState(0);
    const [posterImage, setPosterImage] = useState<string | null>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const volumeBeforeMute = useRef(1);

    const effectiveSrc = videoSrc ?? DEFAULT_VIDEO_SRC;
    const hasVideo = Boolean(effectiveSrc);

    /** Capture a frame from the video and set as poster so we don't show a black screen. */
    const capturePosterFrame = useCallback((videoEl: HTMLVideoElement) => {
        const w = videoEl.videoWidth;
        const h = videoEl.videoHeight;
        if (!w || !h) return;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(videoEl, 0, 0, w, h);
        try {
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            setPosterImage(dataUrl);
        } catch {
            setPosterImage(null);
        }
    }, []);

    const togglePlay = useCallback(() => {
        const el = videoRef.current;
        if (!el) return;
        if (el.paused) {
            el.play().catch(() => {});
            setIsPlaying(true);
        } else {
            el.pause();
            setIsPlaying(false);
        }
    }, []);

    const handleTimeUpdate = useCallback(() => {
        if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
    }, []);

    const handleLoadedMetadata = useCallback(() => {
        if (videoRef.current) setDuration(videoRef.current.duration);
    }, []);

    const handleEnded = useCallback(() => {
        setIsPlaying(false);
        setCurrentTime(0);
        if (videoRef.current) videoRef.current.currentTime = 0;
    }, []);

    const handleProgressClick = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (!videoRef.current || !progressRef.current || duration <= 0)
                return;
            const rect = progressRef.current.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const t = Math.max(0, Math.min(1, x)) * duration;
            videoRef.current.currentTime = t;
            setCurrentTime(t);
        },
        [duration],
    );

    const handleProgressMouseMove = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (!progressRef.current || duration <= 0) {
                setScrubHoverTime(null);
                return;
            }
            const rect = progressRef.current.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const t = Math.max(0, Math.min(1, x)) * duration;
            setScrubHoverTime(t);
            setScrubHoverX(e.clientX - rect.left);
        },
        [duration],
    );

    const handleProgressMouseLeave = useCallback(() => {
        setScrubHoverTime(null);
    }, []);

    const toggleMute = useCallback(() => {
        if (!videoRef.current) return;
        if (isMuted) {
            videoRef.current.volume = volumeBeforeMute.current;
            setIsMuted(false);
        } else {
            volumeBeforeMute.current = videoRef.current.volume;
            videoRef.current.volume = 0;
            setIsMuted(true);
        }
    }, [isMuted]);

    const handleVolumeChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const v = parseFloat(e.target.value);
            setVolume(v);
            if (videoRef.current) {
                videoRef.current.volume = v;
                if (v > 0) setIsMuted(false);
            }
        },
        [],
    );

    const toggleFullscreen = useCallback(() => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen?.();
        } else {
            document.exitFullscreen?.();
        }
    }, []);

    const hiddenVideoRef = useRef<HTMLVideoElement>(null);
    const posterCapturedForSrc = useRef<string | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setIsPlaying(false);
            setCurrentTime(0);
            setDuration(0);
            setScrubHoverTime(null);
            setPosterImage(null);
            posterCapturedForSrc.current = null;
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen || !hasVideo || posterImage !== null) return;
        const el = hiddenVideoRef.current;
        if (!el || posterCapturedForSrc.current === effectiveSrc) return;

        const handleSeeked = () => {
            if (posterCapturedForSrc.current === effectiveSrc) return;
            posterCapturedForSrc.current = effectiveSrc;
            capturePosterFrame(el);
        };

        const handleLoadedData = () => {
            const targetTime = Math.min(1, (el.duration || 1) * 0.05);
            el.currentTime = targetTime;
        };

        el.addEventListener('seeked', handleSeeked);
        el.addEventListener('loadeddata', handleLoadedData);

        if (el.readyState >= 2) {
            const targetTime = Math.min(1, (el.duration || 1) * 0.05);
            el.currentTime = targetTime;
        }

        return () => {
            el.removeEventListener('seeked', handleSeeked);
            el.removeEventListener('loadeddata', handleLoadedData);
        };
    }, [isOpen, hasVideo, effectiveSrc, posterImage, capturePosterFrame]);

    useEffect(() => {
        if (!videoRef.current || !hasVideo) return;
        const v = videoRef.current;
        v.volume = isMuted ? 0 : volume;
    }, [hasVideo, isMuted, volume]);

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                className="min-w-2xl gap-0 overflow-hidden rounded-xl border-0 bg-white p-0 shadow-2xl"
                onPointerDownOutside={onClose}
                onEscapeKeyDown={onClose}
            >
                <DialogTitle className="sr-only">
                    {label ?? 'Video preview'}
                </DialogTitle>
                <div
                    ref={containerRef}
                    className="relative aspect-video w-full overflow-hidden rounded-xl bg-black"
                >
                    {/* Hidden video used only to capture a frame for the poster */}
                    {hasVideo && isOpen && (
                        <video
                            ref={hiddenVideoRef}
                            src={effectiveSrc}
                            preload="auto"
                            className="pointer-events-none absolute h-0 w-0 opacity-0"
                        />
                    )}
                    {/* Video or placeholder - fills container */}
                    {hasVideo ? (
                        <>
                            <video
                                ref={videoRef}
                                className="absolute inset-0 h-full w-full object-contain"
                                src={effectiveSrc}
                                poster={posterImage ?? PLACEHOLDER_IMAGE}
                                onClick={togglePlay}
                                onTimeUpdate={handleTimeUpdate}
                                onLoadedMetadata={handleLoadedMetadata}
                                onEnded={handleEnded}
                                playsInline
                            />
                            {/* Poster overlay: screenshot from video so it's not a black screen; hide once playing */}
                            {!isPlaying && (
                                <img
                                    src={posterImage ?? PLACEHOLDER_IMAGE}
                                    alt=""
                                    className="pointer-events-none absolute inset-0 h-full w-full object-contain"
                                    aria-hidden
                                />
                            )}
                        </>
                    ) : (
                        <div
                            className="absolute inset-0 flex items-center justify-center bg-neutral-200"
                            onClick={togglePlay}
                        >
                            <img
                                src={PLACEHOLDER_IMAGE}
                                alt="Video placeholder"
                                className="h-full w-full object-contain"
                            />
                        </div>
                    )}

                    {/* Optional label overlay - top left */}
                    {label && (
                        <div className="absolute top-0 left-0 p-2 text-xs text-white/90 drop-shadow">
                            {label}
                        </div>
                    )}

                    {/* Controls overlay - transparent dark bar at bottom over video */}
                    <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-black/85 to-black/40 px-3 py-2.5">
                        <button
                            type="button"
                            className="flex size-4 shrink-0 items-center justify-center rounded-full text-white transition-colors hover:bg-white/25"
                            onClick={togglePlay}
                            aria-label={isPlaying ? 'Pause' : 'Play'}
                        >
                            {isPlaying ? (
                                <Pause className="size-2" fill="currentColor" />
                            ) : (
                                <Play className="size-2" fill="currentColor" />
                            )}
                        </button>

                        {hasVideo && (
                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    className="flex size-4 shrink-0 items-center justify-center text-white transition-colors hover:bg-white/20"
                                    onClick={toggleMute}
                                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                                >
                                    <Volume2 className="size-2" />
                                </button>
                                <input
                                    type="range"
                                    min={0}
                                    max={1}
                                    step={0.05}
                                    value={isMuted ? 0 : volume}
                                    onChange={handleVolumeChange}
                                    className="h-1.5 w-14 accent-white"
                                />
                            </div>
                        )}

                        {hasVideo && (
                            <span className="min-w-[2.75rem] shrink-0 text-right text-sm text-white tabular-nums">
                                {formatTime(currentTime)}
                            </span>
                        )}

                        {/* Progress bar with scrubber - main focus like image */}
                        <div
                            ref={progressRef}
                            className="relative flex flex-1 cursor-pointer items-center py-2"
                            onClick={handleProgressClick}
                            onMouseMove={handleProgressMouseMove}
                            onMouseLeave={handleProgressMouseLeave}
                        >
                            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/35">
                                <div
                                    className="h-full rounded-full bg-white"
                                    style={{ width: `${progress}%` }}
                                />
                                {/* Scrubber handle - circular, on top of bar */}
                                {hasVideo && duration > 0 && (
                                    <div
                                        className="absolute top-1/2 size-4 -translate-y-1/2 rounded-full border-2 border-white bg-white shadow-md"
                                        style={{
                                            left: `calc(${progress}% - 8px)`,
                                        }}
                                    />
                                )}
                            </div>
                            {/* Floating thumbnail-style preview above bar (timestamp | total) */}
                            {scrubHoverTime !== null &&
                                hasVideo &&
                                duration > 0 && (
                                    <div
                                        className="pointer-events-none absolute bottom-full z-10 mb-2"
                                        style={{
                                            left: scrubHoverX,
                                            transform: 'translateX(-50%)',
                                        }}
                                    >
                                        <div className="rounded-lg border border-white/20 bg-black/90 px-3 py-2 shadow-lg">
                                            <span className="text-xs font-medium text-white tabular-nums">
                                                {formatTime(scrubHoverTime)} |{' '}
                                                {formatTime(duration)}
                                            </span>
                                        </div>
                                    </div>
                                )}
                        </div>

                        {hasVideo && (
                            <span className="min-w-[2.75rem] shrink-0 text-left text-sm text-white tabular-nums">
                                -
                                {formatTime(
                                    Math.max(0, duration - currentTime),
                                )}
                            </span>
                        )}

                        <button
                            type="button"
                            className="flex size-9 shrink-0 items-center justify-center rounded text-white transition-colors hover:bg-white/25"
                            onClick={toggleFullscreen}
                            aria-label="Full screen"
                        >
                            <Maximize2 className="size-2" />
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

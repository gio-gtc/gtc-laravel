'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useCallback, useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

const COMPONENT_NAME = 'ElapsedTimeDisplay';

type VideoJsPlayer = ReturnType<typeof videojs>;
type ControlBarLike = {
    getChild: (name: string) => unknown;
    children_: unknown[];
    addChild: (
        name: string,
        opts?: Record<string, unknown>,
        index?: number,
    ) => unknown;
};

function registerElapsedTimeDisplay() {
    if (videojs.getComponent(COMPONENT_NAME)) return;
    const Component = videojs.getComponent('Component');
    class ElapsedTimeDisplay extends Component {
        declare contentEl_: HTMLElement | null;

        constructor(
            player: VideoJsPlayer,
            options?: Record<string, unknown>,
        ) {
            super(player, options);
            (this as unknown as { on: (t: unknown, e: string | string[], f: () => void) => void }).on(
                player,
                ['timeupdate', 'durationchange'],
                () => this.updateContent(),
            );
            this.updateContent();
        }
        createEl() {
            const el = super.createEl('div', {
                className: 'vjs-elapsed-time vjs-time-control vjs-control',
            });
            const span = document.createElement('span');
            span.className = 'vjs-elapsed-time-display';
            span.setAttribute('role', 'presentation');
            this.contentEl_ = span;
            el.appendChild(span);
            return el;
        }
        updateContent() {
            if (!this.contentEl_) return;
            const t = this.player_?.currentTime() ?? 0;
            this.contentEl_.textContent = videojs.formatTime(t);
        }
        dispose() {
            this.contentEl_ = null;
            super.dispose();
        }
    }
    videojs.registerComponent(COMPONENT_NAME, ElapsedTimeDisplay);
}

const PLACEHOLDER_IMAGE =
    'data:image/svg+xml,' +
    encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360"><rect fill="%23e5e7eb" width="640" height="360"/><g fill="%239ca3af"><circle cx="320" cy="180" r="48"/><path d="M308 160v40l32-20-32-20z"/></g></svg>',
    );

/** Login page video, used as placeholder when no per-row URL is provided. */
const PLACEHOLDER_VIDEO_SRC = '/videos/auth-login.mp4';

/** Poster image for audio (mp3) sources. Replace with a local image path when available. */
const AUDIO_POSTER_URL = 'https://picsum.photos/200/300';

function isAudioSrc(src: string): boolean {
    return src.toLowerCase().endsWith('.mp3');
}

interface VideoPlayerModalProps {
    isOpen: boolean;
    onClose: () => void;
    videoSrc?: string | null;
    label?: string;
}

export default function VideoPlayerModal({
    isOpen,
    onClose,
    videoSrc,
    label,
}: VideoPlayerModalProps) {
    const videoJsContainerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<ReturnType<typeof videojs> | null>(null);
    const hiddenVideoRef = useRef<HTMLVideoElement>(null);
    const posterCapturedForSrc = useRef<string | null>(null);

    const [posterImage, setPosterImage] = useState<string | null>(null);
    const [userActive, setUserActive] = useState(true);
    const [containerReady, setContainerReady] = useState(false);

    const effectiveSrc = videoSrc ?? PLACEHOLDER_VIDEO_SRC;
    const hasVideo = Boolean(effectiveSrc);
    const isAudio = isAudioSrc(effectiveSrc);

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

    // For video: capture first frame as poster. Not used for audio (mp3).
    useEffect(() => {
        if (!isOpen || !hasVideo || isAudio || posterImage !== null) return;
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
    }, [isOpen, hasVideo, isAudio, effectiveSrc, posterImage, capturePosterFrame]);

    useEffect(() => {
        if (
            !isOpen ||
            !hasVideo ||
            !containerReady ||
            !videoJsContainerRef.current
        ) {
            return;
        }

        const container = videoJsContainerRef.current;
        const videoEl = document.createElement('video-js');
        videoEl.classList.add('vjs-big-play-centered');
        container.appendChild(videoEl);

        const posterUrl = isAudio
            ? AUDIO_POSTER_URL
            : (posterImage ?? PLACEHOLDER_IMAGE);
        const sourceType = isAudio ? 'audio/mpeg' : 'video/mp4';

        const player = videojs(videoEl, {
            fluid: true,
            controls: true,
            responsive: true,
            inactivityTimeout: 2000,
            sources: [{ src: effectiveSrc, type: sourceType }],
            poster: posterUrl,
            playbackRates: [0.5, 1, 1.5, 2],
        });

        playerRef.current = player;

        registerElapsedTimeDisplay();
        const controlBar = player.getChild('controlBar') as ControlBarLike;
        const volumePanel = controlBar.getChild('volumePanel');
        const volumeIndex =
            volumePanel != null ? controlBar.children_.indexOf(volumePanel) : -1;
        const insertIndex = volumeIndex >= 0 ? volumeIndex + 1 : 0;
        controlBar.addChild(COMPONENT_NAME, {}, insertIndex);

        const handleUserActive = () => setUserActive(true);
        const handleUserInactive = () => setUserActive(false);

        player.on('useractive', handleUserActive);
        player.on('userinactive', handleUserInactive);

        return () => {
            player.off('useractive', handleUserActive);
            player.off('userinactive', handleUserInactive);
            if (!player.isDisposed()) {
                player.dispose();
            }
            playerRef.current = null;
        };
    }, [isOpen, hasVideo, containerReady, effectiveSrc, isAudio]);

    // When we capture the first frame (video), update the player poster
    useEffect(() => {
        if (isAudio || !posterImage) return;
        const player = playerRef.current;
        if (player && !player.isDisposed()) {
            player.poster(posterImage);
        }
    }, [isAudio, posterImage]);

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setPosterImage(null);
            setUserActive(true);
            setContainerReady(false);
            posterCapturedForSrc.current = null;
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                className="min-w-[min(90vw,768px)] gap-0 overflow-hidden rounded-xl border-0 bg-white p-0 shadow-2xl"
                onPointerDownOutside={onClose}
                onEscapeKeyDown={onClose}
            >
                <DialogTitle className="sr-only">
                    {label ?? 'Video preview'}
                </DialogTitle>
                <div className="video-player-modal relative aspect-video w-full overflow-hidden rounded-xl bg-black">
                    {hasVideo && !isAudio && isOpen && (
                        <video
                            ref={hiddenVideoRef}
                            src={effectiveSrc}
                            preload="auto"
                            className="pointer-events-none absolute h-0 w-0 opacity-0"
                            aria-hidden
                        />
                    )}
                    {hasVideo ? (
                        <>
                            <div
                                ref={(el) => {
                                    videoJsContainerRef.current = el;
                                    setContainerReady(!!el);
                                }}
                                className="video-js-container h-full w-full"
                                data-vjs-player
                            />
                            {label && (
                                <div
                                    className={`absolute top-0 left-0 p-2 text-xs text-white/90 drop-shadow transition-opacity duration-300 ${
                                        userActive
                                            ? 'pointer-events-none opacity-100'
                                            : 'pointer-events-none opacity-0'
                                    }`}
                                >
                                    {label}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-neutral-200">
                            <img
                                src={PLACEHOLDER_IMAGE}
                                alt="Video placeholder"
                                className="h-full w-full object-contain"
                            />
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

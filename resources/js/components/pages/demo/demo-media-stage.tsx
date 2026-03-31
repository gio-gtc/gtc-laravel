import { type DemoAsset } from '@/types/demo';
import { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

const DEMO_AUDIO_POSTER = '/GTC-audio.jpg';

function DemoVideoJsStage({
    id,
    mediaUrl,
    kind,
    title,
}: {
    id: string;
    mediaUrl: string;
    kind: 'audio' | 'video';
    title: string;
}) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const videoEl = document.createElement('video-js');
        videoEl.classList.add('gtc-video-js', 'vjs-big-play-centered');
        container.appendChild(videoEl);

        const isAudio = kind === 'audio';
        const sourceType = isAudio ? 'audio/mpeg' : 'video/mp4';

        const player = videojs(videoEl, {
            fill: true,
            controls: true,
            responsive: true,
            preload: 'metadata',
            sources: [{ src: mediaUrl, type: sourceType }],
            poster: isAudio ? DEMO_AUDIO_POSTER : undefined,
            inactivityTimeout: isAudio ? 0 : 2000,
            playbackRates: [0.5, 1, 1.5, 2],
        });

        return () => {
            if (!player.isDisposed()) {
                player.dispose();
            }
            container.innerHTML = '';
        };
    }, [id, mediaUrl, kind]);

    return (
        <div
            className={`demo-media-stage relative size-full overflow-hidden bg-black ${
                kind === 'audio' ? 'demo-media-stage--audio' : ''
            }`}
        >
            <span className="sr-only">{title}</span>
            <div
                ref={containerRef}
                className="video-js-container h-full w-full"
                data-vjs-player
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

    return (
        <DemoVideoJsStage
            key={asset.id}
            id={asset.id}
            mediaUrl={asset.mediaUrl}
            kind={asset.kind === 'audio' ? 'audio' : 'video'}
            title={asset.title}
        />
    );
}

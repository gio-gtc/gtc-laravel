import { type DemoAsset } from '@/types/demo';

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
            <div
                key={asset.id}
                className="flex size-full items-center justify-center bg-black px-8"
            >
                <audio
                    className="w-full max-w-xl"
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

import { cn } from '@/lib/utils';
import { Image, Mic, Volume2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const TAG_ICON_MAP: Record<string, { icon: LucideIcon; containerClass: string }> =
    {
        Audio: {
            icon: Volume2,
            containerClass: 'bg-yellow-500',
        },
        'Voice Over': {
            icon: Mic,
            containerClass: 'bg-yellow-500',
        },
        Art: {
            icon: Image,
            containerClass: 'bg-yellow-500',
        },
    };

interface AwaitingAssetIconProps {
    tag: string;
    className?: string;
    iconClassName?: string;
}

function AwaitingAssetIcon({
    tag,
    className,
    iconClassName,
}: AwaitingAssetIconProps) {
    const config = TAG_ICON_MAP[tag] ?? {
        icon: Volume2,
        containerClass: 'bg-gray-400',
    };
    const Icon = config.icon;

    return (
        <div
            className={cn(
                'flex h-[24px] w-[24px] items-center justify-center rounded-md',
                config.containerClass,
                className,
            )}
            title={tag}
        >
            <Icon className={cn('size-4 text-white', iconClassName)} />
        </div>
    );
}

export default function AwaitingAssetsIconGroup({
    tags,
    className,
    iconClassName,
}: {
    tags: string[] | null | undefined;
    className?: string;
    iconClassName?: string;
}) {
    if (!tags?.length) return null;

    return tags.map((tag, index) => (
        <AwaitingAssetIcon
            key={`${tag}-${index}`}
            tag={tag}
            className={className}
            iconClassName={iconClassName}
        />
    ));
}

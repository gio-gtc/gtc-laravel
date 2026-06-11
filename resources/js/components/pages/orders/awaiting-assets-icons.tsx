import { orderTagIconConfig } from '@/lib/orders/order-tag-icons';
import { cn } from '@/lib/utils';
import { Mic } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const VOICE_OVER_ICON = {
    icon: Mic,
    containerClass: 'bg-yellow-500',
} satisfies { icon: LucideIcon; containerClass: string };

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
    const config =
        tag === 'Voice Over'
            ? VOICE_OVER_ICON
            : orderTagIconConfig(tag);
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

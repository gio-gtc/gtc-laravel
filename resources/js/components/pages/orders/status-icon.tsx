import { cn } from '@/lib/utils';
import {
    CircleCheck,
    ClipboardPlus,
    Image,
    MessageCircleQuestion,
    Mic,
    Pause,
    Volume2,
} from 'lucide-react';

const ICON_MAP = {
    completed: {
        icon: CircleCheck,
        containerClass: 'bg-green-500',
    },
    'new-order': {
        icon: ClipboardPlus,
        containerClass: 'bg-green-500',
    },
    'voice-over': {
        icon: Mic,
        containerClass: 'bg-yellow-500',
    },
    audio: {
        icon: Volume2,
        containerClass: 'bg-yellow-500',
    },
    art: {
        icon: Image,
        containerClass: 'bg-yellow-500',
    },
    paused: {
        icon: Pause,
        containerClass: 'bg-red-500',
    },
    'in-progress': {
        icon: MessageCircleQuestion,
        containerClass: 'bg-red-500',
    },
    demo: {},
} as const;
type IconVariant = keyof typeof ICON_MAP;

interface StatusIconProps extends React.HTMLAttributes<HTMLDivElement> {
    status: IconVariant;
}

function StatusIcon({ status, className, ...props }: StatusIconProps) {
    if (status == 'demo') return;

    const { icon: Icon, containerClass } = ICON_MAP[status];

    return (
        <div
            className={cn(
                'flex h-[24px] w-[24px] items-center justify-center rounded-md',
                containerClass,
                className,
            )}
            {...props}
        >
            <Icon className="size-4 text-white" />
        </div>
    );
}

export default StatusIcon;

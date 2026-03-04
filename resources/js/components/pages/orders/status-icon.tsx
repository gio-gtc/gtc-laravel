import { cn } from '@/lib/utils';
import { CircleCheck, ClipboardPlus, Image, Mic, Pause } from 'lucide-react';

// interface StatusIconProps {
//     status: 'completed' | 'in-progress' | 'pending' | 'paused' | 'edit';
// }

const ICON_MAP = {
    completed: {
        icon: CircleCheck,
        containerClass: 'bg-green-500',
    },
    edit: {
        icon: ClipboardPlus,
        containerClass: 'bg-green-500',
    },
    'in-progress': {
        // icon: Volume2,?
        icon: Mic,
        containerClass: 'bg-yellow-500',
    },
    paused: {
        icon: Pause,
        containerClass: 'bg-red-500',
    },
    pending: {
        icon: Image,
        containerClass: 'bg-yellow-500',
    },
} as const;
type IconVariant = keyof typeof ICON_MAP;

interface StatusIconProps extends React.HTMLAttributes<HTMLDivElement> {
    status: IconVariant;
}

function StatusIcon({ status, className, ...props }: StatusIconProps) {
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

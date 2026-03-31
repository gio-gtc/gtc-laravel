import { ClipBoardPlusIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils';
import { type TourVenueStatusValue } from '@/types';
import {
    CircleCheck,
    Image,
    type LucideIcon,
    MessageCircleQuestion,
    Mic,
    Pause,
    Volume2,
} from 'lucide-react';

const ICON_MAP: Record<
    TourVenueStatusValue,
    { icon: LucideIcon; containerClass: string }
> = {
    7: {
        icon: CircleCheck,
        containerClass: 'bg-green-500',
    },
    1: {
        icon: ClipBoardPlusIcon,
        containerClass: 'bg-green-600',
    },
    3: {
        icon: Mic,
        containerClass: 'bg-yellow-500',
    },
    4: {
        icon: Volume2,
        containerClass: 'bg-yellow-500',
    },
    5: {
        icon: Image,
        containerClass: 'bg-yellow-500',
    },
    6: {
        icon: Pause,
        containerClass: 'bg-red-500',
    },
    2: {
        icon: MessageCircleQuestion,
        containerClass: 'bg-red-500',
    },
};

interface StatusIconProps extends React.HTMLAttributes<HTMLDivElement> {
    status: TourVenueStatusValue;
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

const StatusIconGroup = ({
    status,
}: {
    status: TourVenueStatusValue[] | null;
}) => {
    if (status == null) return <></>;

    return status.map((status, index) => (
        // TODO: Check if key is unique enough
        <StatusIcon key={`${status}-${index}`} status={status} />
    ));
};

export default StatusIconGroup;

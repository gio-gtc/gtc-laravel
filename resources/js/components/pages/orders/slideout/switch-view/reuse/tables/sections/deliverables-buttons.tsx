import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AmazonIcon,
    ConnectOneIcon,
    HuluIcon,
    MP4Icon,
    MPEG2Icon,
    NetflixIcon,
} from '@/components/ui/icons';
import { cn } from '@/lib/utils';
import type { MouseEvent } from 'react';
import {
    Check,
    CloudDownloadIcon,
    Download,
    RotateCwIcon,
    X,
} from 'lucide-react';

const DOWNLOAD_OPTIONS = [
    {
        id: 'all',
        label: 'All',
        icon: <Download className="size-[20px]" />,
    },
    {
        id: 'hulu',
        label: 'Hulu',
        icon: <HuluIcon />,
    },
    {
        id: 'amazon',
        label: 'Amazon',
        icon: <AmazonIcon />,
    },
    {
        id: 'netflix',
        label: 'Netflix',
        icon: <NetflixIcon />,
    },
    {
        id: 'connected-tv',
        label: 'Connected TV',
        icon: <ConnectOneIcon />,
    },
    {
        id: 'mp4',
        label: 'MP4',
        icon: <MP4Icon />,
    },
    {
        id: 'mpeg2',
        label: 'MPEG-2',
        icon: <MPEG2Icon />,
    },
] as const;

export interface ApprovalButtonsProps {
    onRevise?: () => void;
    onReject?: () => void;
    onApprove?: () => void;
}

export function ApprovalButtons({
    onRevise,
    onReject,
    onApprove,
}: ApprovalButtonsProps) {
    const handleReviseClick = (e: MouseEvent) => {
        e.stopPropagation();
        (onRevise ?? onReject)?.();
    };

    return (
        <div className="flex w-full items-center justify-center gap-2.5 md:gap-1.5">
            <Button
                variant="ghost"
                size="icon"
                className={cn(
                    'red-400-hover size-4 cursor-pointer rounded-full border-2',
                )}
                onClick={handleReviseClick}
            >
                <X className="size-3" strokeWidth={3} />
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            'green-400-hover size-4 cursor-pointer rounded-full border-2',
                        )}
                    >
                        <Check className="size-3" strokeWidth={3} />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[7rem]">
                    <DropdownMenuItem onClick={onApprove}>
                        Approve
                    </DropdownMenuItem>
                    <DropdownMenuItem>Cancel</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

export interface DownloadButtonsProps {
    onRevise?: () => void;
    onReject?: () => void;
    /** Called when user selects "All" (e.g. for approve/receive flow) */
    onApprove?: () => void;
    /** Called when user selects any option (optionId). For format-specific downloads. */
    onDownload?: (optionId: string) => void;
}

export function DownloadButtons({
    onRevise,
    onReject,
    onApprove,
    onDownload,
}: DownloadButtonsProps) {
    const handleOptionSelect = (optionId: string) => {
        if (optionId === 'all' && onApprove) {
            onApprove();
        }
        onDownload?.(optionId);
    };

    const handleReviseSelect = (e: Event) => {
        e.stopPropagation();
        onRevise?.();
    };

    return (
        <div className="flex items-center justify-center gap-2 md:gap-0.5">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="red-400-hover size-5.5 cursor-pointer rounded-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <RotateCwIcon className="size-[24px]" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[7rem]">
                    <DropdownMenuItem onSelect={handleReviseSelect}>
                        Revise
                    </DropdownMenuItem>
                    <DropdownMenuItem>Cancel</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="green-400-hover size-5.5 cursor-pointer rounded-full"
                    >
                        <CloudDownloadIcon className="size-[24px]" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[10rem] p-1">
                    {DOWNLOAD_OPTIONS.map((opt) => (
                        <DropdownMenuItem
                            key={opt.id}
                            onClick={() => handleOptionSelect(opt.id)}
                            className="flex items-center gap-2 rounded-md px-2 py-1.5"
                        >
                            {opt.icon}
                            <span>{opt.label}</span>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

export interface DeliverablesCellProps {
    status: string;
    deliverables?: {
        onReject?: () => void;
        onRevise?: () => void;
        onApprove?: () => void;
        onDownload?: (optionId: string) => void;
    };
}

export function DeliverablesCell({
    status,
    deliverables,
}: DeliverablesCellProps) {
    if (status === 'Client Review') {
        return (
            <ApprovalButtons
                onRevise={deliverables?.onRevise}
                onApprove={deliverables?.onApprove}
            />
        );
    }

    if (status === 'Out For Delivery') {
        return (
            <DownloadButtons
                onRevise={deliverables?.onRevise}
                onReject={deliverables?.onReject}
                onApprove={deliverables?.onApprove}
                onDownload={deliverables?.onDownload}
            />
        );
    }

    return <span className="text-muted-foreground"></span>;
}

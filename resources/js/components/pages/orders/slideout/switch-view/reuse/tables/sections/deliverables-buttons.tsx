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
import { LoadingDots } from '@/components/ui/loading-dots';
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
    isUpdating?: boolean;
}

export function ApprovalButtons({
    onRevise,
    onReject,
    onApprove,
    isUpdating = false,
}: ApprovalButtonsProps) {
    const handleReviseClick = (e: MouseEvent) => {
        e.stopPropagation();
        (onRevise ?? onReject)?.();
    };

    if (isUpdating) {
        return (
            <div
                className="flex w-full items-center justify-center gap-2.5 md:gap-1.5"
                aria-busy="true"
                aria-label="Updating status"
            >
                <LoadingDots className="text-muted-foreground" />
            </div>
        );
    }

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
                        onClick={(e) => e.stopPropagation()}
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
    isUpdating?: boolean;
}

export interface SimpleDownloadButtonsProps {
    onRevise?: () => void;
    onReject?: () => void;
    onDownload?: () => void;
    isUpdating?: boolean;
}

export function SimpleDownloadButtons({
    onRevise,
    onReject,
    onDownload,
    isUpdating = false,
}: SimpleDownloadButtonsProps) {
    if (isUpdating) {
        return (
            <div
                className="flex items-center justify-center gap-2 md:gap-0.5"
                aria-busy="true"
                aria-label="Updating status"
            >
                <LoadingDots className="text-muted-foreground" />
            </div>
        );
    }

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
            <Button
                variant="ghost"
                size="icon"
                className="green-400-hover size-5.5 cursor-pointer rounded-full"
                onClick={(e) => {
                    e.stopPropagation();
                    onDownload?.();
                }}
            >
                <CloudDownloadIcon className="size-[24px]" />
            </Button>
        </div>
    );
}

export function DownloadButtons({
    onRevise,
    onReject,
    onApprove,
    onDownload,
    isUpdating = false,
}: DownloadButtonsProps) {
    if (isUpdating) {
        return (
            <div
                className="flex items-center justify-center gap-2 md:gap-0.5"
                aria-busy="true"
                aria-label="Updating status"
            >
                <LoadingDots className="text-muted-foreground" />
            </div>
        );
    }

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
                        onClick={(e) => e.stopPropagation()}
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
        /** Broadcast uses multi-format download menu; other tables use a single download action. */
        downloadVariant?: 'broadcast' | 'simple';
    };
    isUpdating?: boolean;
}

export function DeliverablesCell({
    status,
    deliverables,
    isUpdating = false,
}: DeliverablesCellProps) {
    const shieldProps = {
        'data-slideout-column-shield': true,
        onMouseDown: (e: MouseEvent<HTMLDivElement>) => e.preventDefault(),
        onClick: (e: MouseEvent<HTMLDivElement>) => e.stopPropagation(),
    } as const;

    if (status === 'Client Review') {
        return (
            <div {...shieldProps}>
                <ApprovalButtons
                    onRevise={deliverables?.onRevise}
                    onApprove={deliverables?.onApprove}
                    isUpdating={isUpdating}
                />
            </div>
        );
    }

    if (status === 'Out For Delivery') {
        if (deliverables?.downloadVariant === 'broadcast') {
            return (
                <div {...shieldProps}>
                    <DownloadButtons
                        onRevise={deliverables?.onRevise}
                        onReject={deliverables?.onReject}
                        onApprove={deliverables?.onApprove}
                        onDownload={deliverables?.onDownload}
                        isUpdating={isUpdating}
                    />
                </div>
            );
        }

        return (
            <div {...shieldProps}>
                <SimpleDownloadButtons
                    onRevise={deliverables?.onRevise}
                    onReject={deliverables?.onReject}
                    onDownload={() => deliverables?.onDownload?.('single')}
                    isUpdating={isUpdating}
                />
            </div>
        );
    }

    return <span className="text-muted-foreground"></span>;
}

import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { orderStatusIconConfig } from '@/lib/orders/order-status';
import { orderTagIconConfig } from '@/lib/orders/order-tag-icons';
import { cn } from '@/lib/utils';
import type { OrderStatusRef, OrderTag } from '@/types/orders-api';

type OrderBadgesRowProps = {
    statuses?: OrderStatusRef[];
    tags?: OrderTag[];
    className?: string;
    /** Tag icons — legacy table used size-3. */
    tagIconClassName?: string;
    /** Status icons — legacy OrderStatusLabel used size-4. */
    statusIconClassName?: string;
};

export default function OrderBadgesRow({
    statuses,
    tags,
    className,
    tagIconClassName = 'size-3',
    statusIconClassName = 'size-4',
}: OrderBadgesRowProps) {
    const statusCount = statuses?.length ?? 0;
    const tagCount = tags?.length ?? 0;

    if (statusCount + tagCount === 0) {
        // #region agent log
        fetch('http://127.0.0.1:7931/ingest/c0ac6aac-d62f-4a9b-bc25-db6bcf617bbb', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Debug-Session-Id': '3df27b',
            },
            body: JSON.stringify({
                sessionId: '3df27b',
                runId: 'post-fix-tags',
                hypothesisId: 'C',
                location: 'order-badges-row.tsx:empty',
                message: 'OrderBadgesRow render skipped — no badges',
                data: { statusCount, tagCount },
                timestamp: Date.now(),
            }),
        }).catch(() => {});
        // #endregion
        return null;
    }

    // #region agent log
    fetch('http://127.0.0.1:7931/ingest/c0ac6aac-d62f-4a9b-bc25-db6bcf617bbb', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Debug-Session-Id': '3df27b',
        },
        body: JSON.stringify({
            sessionId: '3df27b',
            runId: 'post-fix-tags',
            hypothesisId: 'D',
            location: 'order-badges-row.tsx:render',
            message: 'OrderBadgesRow rendering badges',
            data: {
                statusCount,
                tagCount,
                statusNames: statuses?.map((s) => s.name),
                tags,
            },
            timestamp: Date.now(),
        }),
    }).catch(() => {});
    // #endregion

    return (
        <div
            className={cn(
                'flex min-w-0 items-center gap-1 overflow-x-auto',
                className,
            )}
        >
            {statuses?.map((status) => {
                const { icon: Icon, containerClass } = orderStatusIconConfig(
                    status.name,
                );

                return (
                    <Tooltip key={`status-${status.id}`}>
                        <TooltipTrigger asChild>
                            <div
                                className={cn(
                                    'flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-md text-white',
                                    containerClass,
                                )}
                                aria-label={status.name}
                            >
                                <Icon
                                    className={cn(
                                        statusIconClassName,
                                        'text-white',
                                    )}
                                    aria-hidden
                                />
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>{status.name}</TooltipContent>
                    </Tooltip>
                );
            })}
            {tags?.map((tag, index) => {
                const { icon: Icon, containerClass } =
                    orderTagIconConfig(tag);

                return (
                    <Tooltip key={`tag-${tag}-${index}`}>
                        <TooltipTrigger asChild>
                            <div
                                className={cn(
                                    'flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-md',
                                    containerClass,
                                )}
                                aria-label={tag}
                            >
                                <Icon
                                    className={cn(
                                        tagIconClassName,
                                        'text-white',
                                    )}
                                    aria-hidden
                                />
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>{tag}</TooltipContent>
                    </Tooltip>
                );
            })}
        </div>
    );
}

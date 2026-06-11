import {
    ContainedSheet,
    SheetContent,
    SheetTitle,
} from '@/components/ui/sheet';
import { useUsersWithFallback } from '@/hooks/use-users-with-fallback';
import {
    formatOrderShowDatesForHeader,
    formatVenueDateRangeForHeader,
} from '@/lib/orders/format-order-show-dates';
import { apiOrderClientToUser } from '@/lib/orders/orders-filter-users';
import { resolveOrderBadges } from '@/lib/orders/resolve-order-badges';
import { cn } from '@/lib/utils';
import { type Tour, type TourVenue, type User, type Venue } from '@/types';
import type { ApiOrder } from '@/types/orders-api';
import { useCallback, useEffect, useMemo, useState } from 'react';
import AddOrderModal from '../add-order-modal';
import OrderSlideoutHeader from './order-slideout-header';
import OrderSlideoutSkeleton from './order-slideout-skeleton';
import SwitchView from './switch-view';
import AttachFileOrDropboxModal, {
    type AttachFileModalContext,
} from './switch-view/general-media/modals/attach-file-or-dropbox-modal';

interface OrderDetailSlideoutProps {
    orderItem: {
        orderVenue: TourVenue;
        venue: Venue | null;
    } | null;
    order: Tour | null;
    isOpen: boolean;
    onClose: () => void;
    apiOrder?: ApiOrder | null;
    onOrderSaved?: (order: ApiOrder) => void;
    isLoading?: boolean;
}

export default function OrderDetailSlideout({
    orderItem,
    order,
    isOpen,
    onClose,
    apiOrder = null,
    onOrderSaved,
    isLoading = false,
}: OrderDetailSlideoutProps) {
    const usersWithFallback = useUsersWithFallback();

    const formatEventDates = useMemo(() => {
        if (!orderItem) return undefined;
        return formatVenueDateRangeForHeader(
            orderItem.orderVenue.start_date,
            orderItem.orderVenue.end_date,
        );
    }, [orderItem]);

    const client = useMemo((): User | undefined => {
        if (apiOrder?.client) {
            return apiOrderClientToUser(apiOrder.client);
        }
        return usersWithFallback.find(
            (u) => u.id === orderItem?.orderVenue.client,
        );
    }, [apiOrder?.client, orderItem?.orderVenue.client, usersWithFallback]);

    const eventDates = useMemo(() => {
        if (apiOrder?.show_dates?.length) {
            return formatOrderShowDatesForHeader(apiOrder.show_dates);
        }
        return formatEventDates;
    }, [apiOrder?.show_dates, formatEventDates]);

    const isApiBacked = apiOrder != null;
    const headerBadges = useMemo(
        () => (apiOrder ? resolveOrderBadges(apiOrder) : null),
        [apiOrder],
    );

    const [attachModalOpen, setAttachModalOpen] = useState(false);
    const [attachModalContext, setAttachModalContext] =
        useState<AttachFileModalContext | null>(null);
    const [isMaximized, setIsMaximized] = useState(false);
    const [isEditVenueModalOpen, setIsEditVenueModalOpen] = useState(false);
    const [selectedRowIds, setSelectedRowIds] = useState<Set<string | number>>(
        () => new Set(),
    );

    const toggleRowSelection = useCallback((id: string | number) => {
        setSelectedRowIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const clearRowSelection = useCallback(() => {
        setSelectedRowIds(new Set());
    }, []);

    useEffect(() => {
        if (!isOpen) {
            setSelectedRowIds(new Set());
        }
    }, [isOpen]);

    useEffect(() => {
        setSelectedRowIds(new Set());
    }, [orderItem?.orderVenue.id, order?.id]);

    if (!order && !isLoading) {
        return null;
    }

    if (isLoading || !order) {
        return (
            <ContainedSheet open={isOpen} onClose={onClose}>
                <SheetContent
                    side="right"
                    containedInMainColumn
                    className="w-full gap-1 overflow-y-auto sm:max-w-[875px]"
                    showExitBtn={false}
                >
                    <SheetTitle className="sr-only">
                        Loading order details
                    </SheetTitle>
                    <OrderSlideoutSkeleton />
                </SheetContent>
            </ContainedSheet>
        );
    }

    const isDemo = orderItem?.venue == null;

    return (
        <ContainedSheet open={isOpen} onClose={onClose}>
            <SheetContent
                side="right"
                containedInMainColumn
                className={cn(
                    'w-full gap-1 overflow-y-auto',
                    isMaximized
                        ? 'w-full max-w-full sm:max-w-full'
                        : 'sm:max-w-[875px]',
                    'transition-[max-width] duration-300 ease-in-out',
                )}
                showExitBtn={false}
            >
                <OrderSlideoutHeader
                    tour={order.name}
                    client={client}
                    venue={orderItem?.venue?.name ?? 'Demo'}
                    state={orderItem?.venue?.state ?? ''}
                    statuses={headerBadges?.statuses}
                    tags={headerBadges?.tags}
                    city={orderItem?.venue?.city}
                    eventDates={isDemo ? undefined : eventDates}
                    apiOrder={isApiBacked ? apiOrder : null}
                    onAttach={() => {
                        setAttachModalContext(null);
                        setAttachModalOpen(true);
                    }}
                    onMaximize={() => setIsMaximized((m) => !m)}
                    onMore={
                        isDemo || !isApiBacked
                            ? undefined
                            : () => setIsEditVenueModalOpen(true)
                    }
                    showMoreButton={!isDemo && isApiBacked}
                    onClose={onClose}
                    isMaximized={isMaximized}
                />

                <SwitchView
                    order={order}
                    orderItem={orderItem}
                    selectedRowIds={selectedRowIds}
                    onToggleRowSelection={toggleRowSelection}
                    onClearSelection={clearRowSelection}
                    onOpenAttachModal={(ctx) => {
                        setAttachModalContext(ctx ?? null);
                        setAttachModalOpen(true);
                    }}
                />

                <AttachFileOrDropboxModal
                    isOpen={attachModalOpen}
                    onClose={() => {
                        setAttachModalOpen(false);
                        setAttachModalContext(null);
                    }}
                    context={attachModalContext}
                />

                <AddOrderModal
                    isOpen={isEditVenueModalOpen}
                    onClose={() => setIsEditVenueModalOpen(false)}
                    apiOrder={apiOrder}
                    order={order}
                    mode="edit"
                    orderItem={orderItem}
                    onOrderSaved={onOrderSaved}
                />
            </SheetContent>
        </ContainedSheet>
    );
}

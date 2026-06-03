import { ContainedSheet, SheetContent } from '@/components/ui/sheet';
import { useUsersWithFallback } from '@/hooks/use-users-with-fallback';
import { apiOrderClientToUser } from '@/lib/orders/orders-filter-users';
import { cn } from '@/lib/utils';
import { type Tour, type TourVenue, type User, type Venue } from '@/types';
import type { ApiOrderClient } from '@/types/orders-api';
import { useCallback, useEffect, useMemo, useState } from 'react';
import AddOrderModal from '../add-order-modal';
import OrderSlideoutSkeleton from './order-slideout-skeleton';
import SwitchView from './switch-view';
import AttachFileOrDropboxModal, {
    type AttachFileModalContext,
} from './switch-view/general-media/modals/attach-file-or-dropbox-modal';
import OrderSlideoutHeader from './venue-slideout-header';

interface OrderDetailSlideoutProps {
    orderItem: {
        orderVenue: TourVenue;
        venue: Venue | null;
    } | null;
    order: Tour | null;
    isOpen: boolean;
    onClose: () => void;
    /** When set, header uses API show dates and hides legacy mock ticket/website fields. */
    apiEventDates?: string;
    apiClient?: ApiOrderClient | null;
    isLoading?: boolean;
}

export default function OrderDetailSlideout({
    orderItem,
    order,
    isOpen,
    onClose,
    apiEventDates,
    apiClient,
    isLoading = false,
}: OrderDetailSlideoutProps) {
    const usersWithFallback = useUsersWithFallback();

    // Format event dates for header (e.g., "Friday, July 12 2026 & Saturday, July 13, 2026")
    const formatEventDates = useMemo(() => {
        if (!orderItem) return undefined;
        const startDate = new Date(orderItem.orderVenue.start_date);
        const endDate = new Date(orderItem.orderVenue.end_date);

        const formatSingleDate = (date: Date): string => {
            return new Intl.DateTimeFormat('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
            }).format(date);
        };

        const startFormatted = formatSingleDate(startDate);

        // If same day, just return one date
        if (startDate.toDateString() === endDate.toDateString()) {
            return startFormatted;
        }

        // Format end date without weekday for cleaner display
        const endFormattedShort = new Intl.DateTimeFormat('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        }).format(endDate);

        return `${startFormatted} & ${endFormattedShort}`;
    }, [orderItem]);

    const clientFromApi = useMemo((): User | undefined => {
        if (!apiClient) {
            return undefined;
        }
        return apiOrderClientToUser(apiClient);
    }, [apiClient]);

    const client =
        clientFromApi ??
        usersWithFallback.find((u) => u.id === orderItem?.orderVenue.client);

    const isApiBacked = apiClient != null;

    // Generate mock data for ticket sale, website, and presale
    const mockTicketSaleDate = useMemo(() => {
        if (!orderItem) return undefined;
        // Mock: 3 months before start date
        const saleDate = new Date(orderItem.orderVenue.start_date);
        saleDate.setMonth(saleDate.getMonth() - 3);
        const formatted = new Intl.DateTimeFormat('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZoneName: 'short',
        }).format(saleDate);
        return formatted;
    }, [orderItem]);

    const mockPresaleInfo = useMemo(() => {
        if (!orderItem) return undefined;
        // Mock: 2 days before ticket sale
        const presaleDate = new Date(orderItem.orderVenue.start_date);
        presaleDate.setMonth(presaleDate.getMonth() - 3);
        presaleDate.setDate(presaleDate.getDate() - 2);
        const formatted = new Intl.DateTimeFormat('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZoneName: 'short',
        }).format(presaleDate);
        return `AMEX Presale : ${formatted}`;
    }, [orderItem]);

    // Mock website
    const mockWebsite = 'LiveNation.com';

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
                    status={orderItem?.orderVenue?.status ?? null}
                    city={orderItem?.venue?.city}
                    eventDates={
                        isDemo ? undefined : (apiEventDates ?? formatEventDates)
                    }
                    ticketSaleDate={
                        isDemo || isApiBacked ? undefined : mockTicketSaleDate
                    }
                    website={isDemo || isApiBacked ? undefined : mockWebsite}
                    presaleInfo={
                        isDemo || isApiBacked ? undefined : mockPresaleInfo
                    }
                    onAttach={() => {
                        setAttachModalContext(null);
                        setAttachModalOpen(true);
                    }}
                    onMaximize={() => setIsMaximized((m) => !m)}
                    onMore={
                        isDemo ? undefined : () => setIsEditVenueModalOpen(true)
                    }
                    showMoreButton={!isDemo}
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
                    orderId={order.id}
                    order={order}
                    mode="edit"
                    orderItem={orderItem}
                />
            </SheetContent>
        </ContainedSheet>
    );
}

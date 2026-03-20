import { mockUsers } from '@/components/mockdata';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { type Tour, type TourVenue, type Venue } from '@/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import AddVenueModal from '../add-venue-modal';
import SwitchView from './switch-view';
import AttachFileOrDropboxModal, {
    type AttachFileModalContext,
} from './switch-view/general-media/modals/attach-file-or-dropbox-modal';
import VenueSlideoutHeader from './venue-slideout-header';

interface VenueDetailSlideoutProps {
    venueItem: {
        orderVenue: TourVenue;
        venue: Venue | null;
    } | null;
    order: Tour | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function VenueDetailSlideout({
    venueItem,
    order,
    isOpen,
    onClose,
}: VenueDetailSlideoutProps) {
    // Format event dates for header (e.g., "Friday, July 12 2026 & Saturday, July 13, 2026")
    const formatEventDates = useMemo(() => {
        if (!venueItem) return undefined;
        const startDate = new Date(venueItem.orderVenue.start_date);
        const endDate = new Date(venueItem.orderVenue.end_date);

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
    }, [venueItem]);

    const client = mockUsers.find(
        (client) => client.id === venueItem?.orderVenue.client,
    );

    // Generate mock data for ticket sale, website, and presale
    const mockTicketSaleDate = useMemo(() => {
        if (!venueItem) return undefined;
        // Mock: 3 months before start date
        const saleDate = new Date(venueItem.orderVenue.start_date);
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
    }, [venueItem]);

    const mockPresaleInfo = useMemo(() => {
        if (!venueItem) return undefined;
        // Mock: 2 days before ticket sale
        const presaleDate = new Date(venueItem.orderVenue.start_date);
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
    }, [venueItem]);

    // Mock website
    const mockWebsite = 'LiveNation.com';

    const [attachModalOpen, setAttachModalOpen] = useState(false);
    const [attachModalContext, setAttachModalContext] =
        useState<AttachFileModalContext | null>(null);
    const [isMaximized, setIsMaximized] = useState(false);
    const [isEditVenueModalOpen, setIsEditVenueModalOpen] = useState(false);
    const [selectedRowIds, setSelectedRowIds] = useState<
        Set<string | number>
    >(() => new Set());

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
    }, [venueItem?.orderVenue.id, order?.id]);

    if (!order) {
        return null;
    }

    const isDemo = venueItem?.venue == null;

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent
                side="right"
                className={cn(
                    'w-full gap-1 overflow-y-auto',
                    isMaximized
                        ? 'w-full max-w-full sm:max-w-full'
                        : 'sm:max-w-5xl',
                    'transition-[max-width] duration-300 ease-in-out',
                )}
                showExitBtn={false}
            >
                <VenueSlideoutHeader
                    tour={order.name}
                    client={client}
                    venue={venueItem?.venue?.name ?? 'Demo'}
                    state={venueItem?.venue?.state ?? ''}
                    status={venueItem?.orderVenue?.status ?? ['demo']}
                    city={venueItem?.venue?.city}
                    eventDates={isDemo ? undefined : formatEventDates}
                    ticketSaleDate={isDemo ? undefined : mockTicketSaleDate}
                    website={isDemo ? undefined : mockWebsite}
                    presaleInfo={isDemo ? undefined : mockPresaleInfo}
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
                    venueItem={venueItem}
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

                <AddVenueModal
                    isOpen={isEditVenueModalOpen}
                    onClose={() => setIsEditVenueModalOpen(false)}
                    orderId={order.id}
                    order={order}
                    mode="edit"
                    venueItem={venueItem}
                />
            </SheetContent>
        </Sheet>
    );
}

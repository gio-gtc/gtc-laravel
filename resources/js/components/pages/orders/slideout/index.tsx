import { Sheet, SheetContent } from '@/components/ui/sheet';
import Divider from '@/components/utils/divider';
import { cn } from '@/lib/utils';
import { type Tour, type TourVenue, type Venue } from '@/types';
import { useMemo, useState } from 'react';
import SwitchView from './switch-view';
import AttachFileOrDropboxModal, {
    type AttachFileModalContext,
} from './switch-view/general-media/modals/attach-file-or-dropbox-modal';
import VenueSlideoutHeader from './venue-slideout-header';

interface VenueDetailSlideoutProps {
    venueItem: {
        orderVenue: TourVenue;
        venue: Venue;
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

    if (!venueItem || !order) {
        return null;
    }

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
                    venue={venueItem.venue.name}
                    state={venueItem.venue.state}
                    status={venueItem.orderVenue.status}
                    city={venueItem.venue.city}
                    eventDates={formatEventDates}
                    ticketSaleDate={mockTicketSaleDate}
                    website={mockWebsite}
                    presaleInfo={mockPresaleInfo}
                    onAttach={() => {
                        setAttachModalContext(null);
                        setAttachModalOpen(true);
                    }}
                    onMaximize={() => setIsMaximized((m) => !m)}
                    onClose={onClose}
                    isMaximized={isMaximized}
                />

                <Divider />
                <SwitchView
                    order={order}
                    venueItem={venueItem}
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
            </SheetContent>
        </Sheet>
    );
}

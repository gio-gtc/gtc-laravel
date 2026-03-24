import { SheetHeader, SheetTitle } from '@/components/ui/sheet';
import NavOptionButton from '@/components/ui/slideout/nav-option-button';
import Divider from '@/components/utils/divider';
import { User, type TourVenueStatusValue } from '@/types';
import {
    ArrowRightToLine,
    ExpandIcon,
    MoreHorizontalIcon,
    PaperclipIcon,
    SendIcon,
    ShrinkIcon,
} from 'lucide-react';
import StatusIcon from '../status-icon';

interface VenueSlideoutHeaderProps {
    tour: string;
    client: User | undefined;
    venue: string;
    state: string;
    status: Array<TourVenueStatusValue | 'demo'>;
    city?: string;
    eventDates?: string;
    ticketSaleDate?: string;
    website?: string;
    presaleInfo?: string;
    onAttach: () => void;
    onMaximize: () => void;
    onMore?: () => void;
    onClose: () => void;
    isMaximized?: boolean;
    showMoreButton?: boolean;
}

export default function VenueSlideoutHeader({
    tour,
    client,
    venue,
    state,
    status,
    city,
    eventDates,
    ticketSaleDate,
    website,
    presaleInfo,
    onAttach,
    onMaximize,
    onMore = () => {},
    onClose,
    isMaximized = false,
    showMoreButton = true,
}: VenueSlideoutHeaderProps) {
    // Format venue display with city if available (demo mode: venue only)
    const venueDisplay =
        !state && !city
            ? venue
            : city
              ? `${venue}, ${city}, ${state}`
              : `${venue}, ${state}`;

    const onSend = () => {
        if (!client) {
            console.log('No client!');
            return;
        }

        const recipient = `${client.email}`;
        const subject = `${tour} - ${venue} - ${eventDates}`;
        const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${recipient}&su=${encodeURIComponent(subject)}`;

        // Open in a new tab
        window.open(gmailLink, '_blank');
    };

    return (
        <SheetHeader className="relative gap-0 p-0">
            {/* Top row: Status icon on left, action buttons on right */}
            <div className="slide-out-container flex items-center justify-between">
                <div className="flex gap-0.5">
                    {status.map((s) => (
                        <StatusIcon key={`${tour}-${venue}-${s}`} status={s} />
                    ))}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-0.5">
                    <NavOptionButton onClick={onAttach} icon={PaperclipIcon} />
                    <NavOptionButton onClick={onSend} icon={SendIcon} />
                    <NavOptionButton
                        onClick={onMaximize}
                        icon={isMaximized ? ShrinkIcon : ExpandIcon}
                    />
                    {showMoreButton && (
                        <NavOptionButton
                            onClick={onMore}
                            icon={MoreHorizontalIcon}
                        />
                    )}
                    <NavOptionButton
                        onClick={onClose}
                        icon={ArrowRightToLine}
                    />
                </div>
            </div>

            {/* Main content: Title and details */}
            <Divider className="shadow-lg" />
            <SheetTitle className="slide-out-container text-2xl font-medium text-black">
                {tour}
            </SheetTitle>
            <Divider />
            <div className="slide-out-container flex-1">
                <div className="sm-black-weight-500">
                    <p>{venueDisplay}</p>
                    {eventDates && <p>{eventDates}</p>}
                    {ticketSaleDate && <p>Ticket Sale : {ticketSaleDate}</p>}
                    {website && <p>{website}</p>}
                    {presaleInfo && <p>{presaleInfo}</p>}
                </div>
            </div>
        </SheetHeader>
    );
}

import { DropBox } from '@/components/ui/icons';
import { SheetHeader, SheetTitle } from '@/components/ui/sheet';
import NavOptionButton from '@/components/ui/slideout/nav-option-button';
import Divider from '@/components/utils/divider';
import { type TourVenue } from '@/types';
import {
    ArrowRightToLine,
    Maximize2Icon,
    Minimize2Icon,
    MoreHorizontalIcon,
    PaperclipIcon,
    SendIcon,
} from 'lucide-react';
import StatusIcon from '../status-icon';

interface VenueSlideoutHeaderProps {
    tour: string;
    venue: string;
    state: string;
    status: TourVenue['status'];
    city?: string;
    eventDates?: string;
    ticketSaleDate?: string;
    website?: string;
    presaleInfo?: string;
    onAttach?: () => void;
    onCloud?: () => void;
    onSend?: () => void;
    onMaximize?: () => void;
    onMore?: () => void;
    onClose: () => void;
    isMaximized?: boolean;
}

export default function VenueSlideoutHeader({
    tour,
    venue,
    state,
    status,
    city,
    eventDates,
    ticketSaleDate,
    website,
    presaleInfo,
    onAttach = () => {},
    onCloud = () => {},
    onSend = () => {},
    onMaximize = () => {},
    onMore = () => {},
    onClose,
    isMaximized = false,
}: VenueSlideoutHeaderProps) {
    // Format venue display with city if available
    const venueDisplay = city
        ? `${venue}, ${city}, ${state}`
        : `${venue}, ${state}`;

    return (
        <SheetHeader className="relative gap-0 p-0">
            {/* Top row: Status icon on left, action buttons on right */}
            <div className="slide-out-container flex items-center justify-between">
                <StatusIcon status={status} />

                {/* Action buttons */}
                <div className="flex items-center gap-0.5">
                    <NavOptionButton onClick={onAttach} icon={PaperclipIcon} />
                    <NavOptionButton onClick={onCloud} icon={DropBox} />
                    <NavOptionButton onClick={onSend} icon={SendIcon} />
                    <NavOptionButton
                        onClick={onMaximize}
                        icon={isMaximized ? Minimize2Icon : Maximize2Icon}
                    />
                    <NavOptionButton
                        onClick={onMore}
                        icon={MoreHorizontalIcon}
                    />

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

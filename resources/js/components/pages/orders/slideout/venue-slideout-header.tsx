import { Button } from '@/components/ui/button';
import { SheetHeader, SheetTitle } from '@/components/ui/sheet';
import Divider from '@/components/utils/divider';
import {
    ArrowRightToLine,
    ClipboardPlus,
    Cloud,
    Maximize2,
    MoreHorizontal,
    Paperclip,
    Send,
} from 'lucide-react';

interface VenueSlideoutHeaderProps {
    tour: string;
    venue: string;
    state: string;
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
}

export default function VenueSlideoutHeader({
    tour,
    venue,
    state,
    city,
    eventDates,
    ticketSaleDate,
    website,
    presaleInfo,
    onAttach = () => console.log('Attach clicked'),
    onCloud = () => console.log('Cloud clicked'),
    onSend = () => console.log('Send clicked'),
    onMaximize = () => console.log('Maximize clicked'),
    onMore = () => console.log('More clicked'),
}: VenueSlideoutHeaderProps) {
    // Format venue display with city if available
    const venueDisplay = city
        ? `${venue}, ${city}, ${state}`
        : `${venue}, ${state}`;

    return (
        <SheetHeader className="relative p-0">
            {/* Top row: Green icon on left, action buttons on right */}
            <div className="slide-out-container flex items-center justify-between">
                {/* Green document icon with plus (decorative) */}
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-green-500">
                    <ClipboardPlus className="h-5 w-5 text-white" />
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-0.5 text-slate-500">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={onAttach}
                    >
                        <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={onCloud}
                    >
                        <Cloud className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={onSend}
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={onMaximize}
                    >
                        <Maximize2 className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={onMore}
                    >
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={onMore}
                    >
                        <ArrowRightToLine className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <Divider />
            {/* Main content: Title and details */}
            <div className="slide-out-container flex-1">
                <SheetTitle className="text-2xl font-semibold">
                    {tour}
                </SheetTitle>
                <div className="mt-1 space-y-1 text-sm text-muted-foreground">
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

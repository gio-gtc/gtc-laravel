import { SheetHeader, SheetTitle } from '@/components/ui/sheet';
import NavOptionButton from '@/components/ui/slideout/nav-option-button';
import Divider from '@/components/utils/divider';
import { ORDER_HEADER_DESCRIPTION_FIELDS } from '@/lib/orders/order-header-descriptions';
import { User, type TourVenueStatusValue } from '@/types';
import type { ApiOrder } from '@/types/orders-api';
import {
    ArrowRightToLine,
    ExpandIcon,
    MoreHorizontalIcon,
    PaperclipIcon,
    SendIcon,
    ShrinkIcon,
} from 'lucide-react';
import StatusIconGroup from '../status-icon';

interface OrderSlideoutHeaderProps {
    tour: string;
    client: User | undefined;
    venue: string;
    state: string;
    status: TourVenueStatusValue[] | null;
    city?: string;
    eventDates?: string;
    apiOrder?: ApiOrder | null;
    onAttach: () => void;
    onMaximize: () => void;
    onMore?: () => void;
    onClose: () => void;
    isMaximized?: boolean;
    showMoreButton?: boolean;
}

export default function OrderSlideoutHeader({
    tour,
    client,
    venue,
    state,
    status,
    city,
    eventDates,
    apiOrder = null,
    onAttach,
    onMaximize,
    onMore = () => {},
    onClose,
    isMaximized = false,
    showMoreButton = true,
}: OrderSlideoutHeaderProps) {
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

        window.open(gmailLink, '_blank');
    };

    return (
        <SheetHeader className="relative gap-0 p-0">
            <div className="slide-out-container flex items-center justify-between shadow-lg">
                <div className="flex gap-0.5">
                    <StatusIconGroup status={status} />
                </div>

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

            <Divider className="shadow-lg" />
            <SheetTitle className="px-3 py-[7px] text-[28px] font-medium text-black">
                {tour}
            </SheetTitle>
            <Divider variant="fade" />
            <div className="slide-out-container flex-1 !py-[10px]">
                <div className="sm-black-weight-500">
                    <p>{venueDisplay}</p>
                    {eventDates && <p>Show Dates: {eventDates}</p>}
                    {apiOrder &&
                        ORDER_HEADER_DESCRIPTION_FIELDS.map(({ key, label }) => {
                            const text = apiOrder[key]?.trim();
                            if (!text) {
                                return null;
                            }
                            return (
                                <p key={key}>
                                    {label}: {text}
                                </p>
                            );
                        })}
                </div>
            </div>
            <Divider variant="fade" />
        </SheetHeader>
    );
}

import { SheetHeader, SheetTitle } from '@/components/ui/sheet';
import NavOptionButton from '@/components/ui/slideout/nav-option-button';
import Divider from '@/components/utils/divider';
import { cn } from '@/lib/utils';
import { ArrowRightToLine, ExpandIcon, Send, ShrinkIcon } from 'lucide-react';

interface InvoiceSlideoutHeaderProps {
    tour: string;
    venue: string;
    market: string;
    onMaximize: () => void;
    onClose: () => void;
    isMaximized?: boolean;
    accountPayableEmail: string | null;
}

export default function InvoiceSlideoutHeader({
    tour,
    venue,
    market,
    onMaximize,
    onClose,
    isMaximized = false,
    accountPayableEmail,
}: InvoiceSlideoutHeaderProps) {
    const onSend = () => {
        if (!accountPayableEmail) {
            console.log('No Account Payable Email!');
            return;
        }

        const recipient = `${accountPayableEmail}`;
        const subject = `${tour} - ${venue} Invoice`;
        const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${recipient}&su=${encodeURIComponent(subject)}`;

        // Open in a new tab
        window.open(gmailLink, '_blank');
    };

    return (
        <SheetHeader className="relative gap-0 p-0">
            <div className="slide-out-container flex items-end justify-end shadow-lg">
                <div className="flex items-center gap-0.5">
                    <NavOptionButton onClick={onSend} icon={Send} />
                    <NavOptionButton
                        onClick={onMaximize}
                        icon={isMaximized ? ShrinkIcon : ExpandIcon}
                    />
                    <NavOptionButton
                        onClick={onClose}
                        icon={ArrowRightToLine}
                    />
                </div>
            </div>

            <div
                className={cn(
                    'flex flex-col px-3 lg:flex-row lg:items-baseline lg:gap-2',
                    'py-[7px]',
                )}
            >
                <SheetTitle className="text-[28px] font-medium text-black">
                    {tour}
                </SheetTitle>
                <p className="sm-black-weight-500">
                    {venue}, {market}
                </p>
            </div>
            <Divider variant="fade" />
        </SheetHeader>
    );
}

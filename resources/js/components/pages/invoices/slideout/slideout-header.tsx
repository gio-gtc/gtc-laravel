import { SheetHeader, SheetTitle } from '@/components/ui/sheet';
import NavOptionButton from '@/components/ui/slideout/nav-option-button';
import {
    ArrowRightToLine,
    ExpandIcon,
    MoreHorizontal,
    Send,
    ShrinkIcon,
} from 'lucide-react';

interface InvoiceSlideoutHeaderProps {
    tour: string;
    venue: string;
    market: string;
    onSend: () => void;
    onMaximize: () => void;
    onMore: () => void;
    onClose: () => void;
    isMaximized?: boolean;
}

export default function InvoiceSlideoutHeader({
    tour,
    venue,
    market,
    onSend,
    onMaximize,
    onMore,
    onClose,
    isMaximized = false,
}: InvoiceSlideoutHeaderProps) {
    return (
        <SheetHeader className="relative border-b px-6 pt-6 pb-4">
            <div className="flex flex-col items-start justify-between gap-1 sm:flex-row">
                <div className="flex-1">
                    <SheetTitle className="text-2xl font-medium text-black">
                        {tour}
                    </SheetTitle>
                    <p className="sm-black-weight-500">
                        {venue}, {market}
                    </p>
                </div>
                <div className="flex items-center gap-1">
                    <NavOptionButton onClick={onSend} icon={Send} />
                    <NavOptionButton
                        onClick={onMaximize}
                        icon={isMaximized ? ShrinkIcon : ExpandIcon}
                    />
                    <NavOptionButton onClick={onMore} icon={MoreHorizontal} />
                    <NavOptionButton
                        onClick={onClose}
                        icon={ArrowRightToLine}
                    />
                </div>
            </div>
        </SheetHeader>
    );
}

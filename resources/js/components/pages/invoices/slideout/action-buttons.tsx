import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface InvoiceActionButtonsProps {
    onReleaseHold?: () => void;
    onDeleteInvoice: () => void;
    disabled?: boolean;
}

export default function InvoiceActionButtons({
    onReleaseHold,
    onDeleteInvoice,
    disabled = false,
}: InvoiceActionButtonsProps) {
    return (
        <div className="mx-[-2%] flex flex-col justify-center gap-2 rounded-lg bg-neutral-100 py-1 sm:flex-row">
            <Button
                variant="destructive"
                onClick={onReleaseHold}
                disabled={disabled}
                className={disabled ? 'cursor-not-allowed opacity-50' : ''}
            >
                Release Hold
            </Button>
            <Button
                variant="outline"
                onClick={onDeleteInvoice}
                disabled={disabled}
                className={cn(
                    'text-gray-500',
                    disabled ? 'cursor-not-allowed opacity-50' : '',
                )}
            >
                Delete Invoice
            </Button>
        </div>
    );
}

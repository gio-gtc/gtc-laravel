import { Button } from '@/components/ui/button';

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
        <div className="flex flex-col justify-center gap-2 sm:flex-row">
            <Button
                variant="destructive"
                onClick={onReleaseHold}
                disabled={disabled}
                className={disabled ? 'opacity-50 cursor-not-allowed' : ''}
            >
                Release Hold
            </Button>
            <Button
                variant="outline"
                onClick={onDeleteInvoice}
                disabled={disabled}
                className={disabled ? 'opacity-50 cursor-not-allowed' : ''}
            >
                Delete Invoice
            </Button>
        </div>
    );
}

import { Button } from '@/components/ui/button';

interface InvoiceActionButtonsProps {
    onReleaseHold?: () => void;
    onDeleteInvoice: () => void;
}

export default function InvoiceActionButtons({
    onReleaseHold,
    onDeleteInvoice,
}: InvoiceActionButtonsProps) {
    return (
        <div className="flex flex-col justify-center gap-2 sm:flex-row">
            <Button variant="destructive" onClick={onReleaseHold}>
                Release Hold
            </Button>
            <Button variant="outline" onClick={onDeleteInvoice}>
                Delete Invoice
            </Button>
        </div>
    );
}

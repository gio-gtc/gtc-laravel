import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface InvoiceActionButtonsProps {
    isDeleted: boolean;
    onReleaseHold?: () => void;
    onDeleteInvoice: () => void;
    onRestoreInvoice: () => void;
    disabled?: boolean;
}

export default function InvoiceActionButtons({
    isDeleted,
    onReleaseHold,
    onDeleteInvoice,
    onRestoreInvoice,
    disabled = false,
}: InvoiceActionButtonsProps) {
    return (
        <div className="flex flex-col justify-center gap-2 rounded-lg bg-neutral-100 px-3 py-1 sm:flex-row">
            {!isDeleted && (
                <Button
                    variant="destructive"
                    onClick={onReleaseHold}
                    disabled={disabled}
                    size={'md'}
                    className={disabled ? 'cursor-not-allowed opacity-50' : ''}
                >
                    Release Hold
                </Button>
            )}
            {isDeleted ? (
                <Button
                    variant="outline"
                    onClick={onRestoreInvoice}
                    disabled={disabled}
                    size={'md'}
                    className={cn(
                        'text-gray-500',
                        disabled ? 'cursor-not-allowed opacity-50' : '',
                    )}
                >
                    Restore Invoice
                </Button>
            ) : (
                <Button
                    variant="outline"
                    onClick={onDeleteInvoice}
                    disabled={disabled}
                    size={'md'}
                    className={cn(
                        'text-gray-500',
                        disabled ? 'cursor-not-allowed opacity-50' : '',
                    )}
                >
                    Delete Invoice
                </Button>
            )}
        </div>
    );
}

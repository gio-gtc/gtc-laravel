import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { LoadingDots } from '@/components/ui/loading-dots';
import { orderModalStyles } from './shared';

interface ClearCartConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
    isClearing?: boolean;
}

export default function ClearCartConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    isClearing = false,
}: ClearCartConfirmModalProps) {
    const handleOpenChange = (open: boolean) => {
        if (!open && !isClearing) {
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="gap-2.5 sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className={orderModalStyles.dialogTitle}>
                        Clear cart
                    </DialogTitle>
                    <DialogDescription className="text-xs text-gray-600">
                        Are you sure you want to clear your cart?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:justify-end">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isClearing}
                        className={orderModalStyles.cancelButton}
                    >
                        Cancel
                    </Button>
                    <Button
                        className={orderModalStyles.primaryButton}
                        onClick={() => void onConfirm()}
                        disabled={isClearing}
                        aria-busy={isClearing}
                    >
                        {isClearing ? <LoadingDots /> : 'Clear Cart'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { LoadingDots } from '@/components/ui/loading-dots';
import Divider from '@/components/utils/divider';
import { orderModalStyles } from './shared';

interface OrderModalLayoutProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    primaryLabel: string;
    onPrimaryClick: () => void;
    primaryDisabled?: boolean;
    primaryLoading?: boolean;
    modalClasses?: string;
    children: React.ReactNode;
}

export default function OrderModalLayout({
    isOpen,
    onClose,
    title,
    primaryLabel,
    onPrimaryClick,
    primaryDisabled = false,
    primaryLoading = false,
    modalClasses = '',
    children,
}: OrderModalLayoutProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className={`gap-3 ${modalClasses}`}>
                <DialogHeader>
                    <DialogTitle className={orderModalStyles.dialogTitle}>
                        {title}
                    </DialogTitle>
                </DialogHeader>

                <Divider />

                {children}

                <Divider />

                <DialogFooter className="gap-2 sm:justify-end">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={primaryLoading}
                        className={orderModalStyles.cancelButton}
                    >
                        Cancel
                    </Button>
                    <Button
                        className={orderModalStyles.primaryButton}
                        onClick={onPrimaryClick}
                        disabled={primaryDisabled || primaryLoading}
                        aria-busy={primaryLoading}
                    >
                        {primaryLoading ? (
                            <LoadingDots />
                        ) : (
                            primaryLabel
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import Divider from '@/components/utils/divider';
import { orderModalStyles } from './shared';

interface OrderModalLayoutProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    primaryLabel: string;
    onPrimaryClick: () => void;
    primaryDisabled?: boolean;
    modalClasses?: string;
    children: React.ReactNode;
    dividerBeforeFooter?: boolean;
}

export default function OrderModalLayout({
    isOpen,
    onClose,
    title,
    primaryLabel,
    onPrimaryClick,
    primaryDisabled = false,
    modalClasses = '',
    children,
    dividerBeforeFooter = true,
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

                {dividerBeforeFooter && <Divider />}

                <DialogFooter className="gap-2 sm:justify-end">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className={orderModalStyles.cancelButton}
                    >
                        Cancel
                    </Button>
                    <Button
                        className={orderModalStyles.primaryButton}
                        onClick={onPrimaryClick}
                        disabled={primaryDisabled}
                    >
                        {primaryLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

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

type MaxWidth = 'sm' | 'lg' | '2xl';

const maxWidthClass: Record<MaxWidth, string> = {
    sm: 'sm:max-w-sm',
    lg: 'sm:max-w-lg',
    '2xl': 'sm:max-w-2xl',
};

interface OrderModalLayoutProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    primaryLabel: string;
    onPrimaryClick: () => void;
    maxWidth?: MaxWidth;
    children: React.ReactNode;
    /** If false, no divider is rendered before the footer. Default true. */
    dividerBeforeFooter?: boolean;
}

export default function OrderModalLayout({
    isOpen,
    onClose,
    title,
    primaryLabel,
    onPrimaryClick,
    maxWidth = '2xl',
    children,
    dividerBeforeFooter = true,
}: OrderModalLayoutProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className={`gap-3 ${maxWidthClass[maxWidth]}`}>
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
                    >
                        {primaryLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

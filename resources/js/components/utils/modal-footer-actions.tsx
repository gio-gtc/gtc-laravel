import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import type { ReactNode } from 'react';

type ButtonVariant = React.ComponentProps<typeof Button>['variant'];
type ButtonType = React.ButtonHTMLAttributes<HTMLButtonElement>['type'];

export interface ModalFooterActionsProps {
    onCancel: () => void;
    onConfirm?: () => void;
    cancelLabel?: string;
    confirmLabel?: string;
    cancelVariant?: ButtonVariant;
    confirmVariant?: ButtonVariant;
    cancelType?: ButtonType;
    confirmType?: ButtonType;
    cancelDisabled?: boolean;
    confirmDisabled?: boolean;
    confirmClassName?: string;
    cancelClassName?: string;
    children?: ReactNode;
}

export function ModalFooterActions({
    onCancel,
    onConfirm,
    cancelLabel = 'Cancel',
    confirmLabel = 'Save',
    cancelVariant = 'outline',
    confirmVariant = 'default',
    cancelType = 'button',
    confirmType = 'submit',
    cancelDisabled,
    confirmDisabled,
    confirmClassName,
    cancelClassName,
    children,
}: ModalFooterActionsProps) {
    return (
        <DialogFooter className="gap-3 sm:gap-2">
            <Button
                type={cancelType}
                variant={cancelVariant}
                onClick={onCancel}
                disabled={cancelDisabled}
                className={cancelClassName}
            >
                {cancelLabel}
            </Button>

            <Button
                type={confirmType}
                variant={confirmVariant}
                onClick={onConfirm}
                disabled={confirmDisabled}
                className={confirmClassName}
            >
                {confirmLabel}
            </Button>
            {children}
        </DialogFooter>
    );
}

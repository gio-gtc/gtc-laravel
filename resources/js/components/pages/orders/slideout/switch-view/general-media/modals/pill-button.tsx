import { Button } from '@/components/ui/button';
import { orderModalStyles, pillButtonClassName } from './shared';

interface PillButtonProps {
    selected: boolean;
    onClick: () => void;
    children: React.ReactNode;
    /** Use pillFull for full-width pills (e.g. Key Art modal) */
    baseClassName?: string;
    className?: string;
    size?: 'default' | 'sm';
    disabled?: boolean;
}

export default function PillButton({
    selected,
    onClick,
    children,
    baseClassName,
    className,
    size = 'sm',
    disabled,
}: PillButtonProps) {
    return (
        <Button
            type="button"
            variant="outline"
            size={size}
            disabled={disabled}
            className={pillButtonClassName(
                selected,
                baseClassName ?? orderModalStyles.pillBase,
                className,
                disabled,
            )}
            onClick={onClick}
        >
            {children}
        </Button>
    );
}

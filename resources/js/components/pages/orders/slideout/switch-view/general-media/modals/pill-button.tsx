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
}

export default function PillButton({
    selected,
    onClick,
    children,
    baseClassName,
    className,
    size = 'sm',
}: PillButtonProps) {
    return (
        <Button
            type="button"
            variant="outline"
            size={size}
            className={pillButtonClassName(
                selected,
                baseClassName ?? orderModalStyles.pillBase,
                className,
            )}
            onClick={onClick}
        >
            {children}
        </Button>
    );
}

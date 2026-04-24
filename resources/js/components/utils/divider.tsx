import { cn } from '@/lib/utils';

type DividerVariants = 'default' | 'fade';

function Divider({
    className = '',
    variant = 'default',
}: {
    className?: string;
    variant?: DividerVariants;
}) {
    const variants: Record<DividerVariants, string> = {
        default: '',
        fade: 'bg-gradient-to-r from-gray-300 from-10% to-transparent',
    };

    return (
        <hr
            className={cn(
                'h-px border-0 bg-gray-300',
                variants[variant],
                className,
            )}
        />
    );
}

export default Divider;

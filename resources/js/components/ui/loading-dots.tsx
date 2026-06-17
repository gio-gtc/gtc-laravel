import { cn } from '@/lib/utils';

const DOT_DELAYS_MS = [0, 150, 300] as const;

function LoadingDots({
    className,
    ...props
}: React.ComponentProps<'span'>) {
    return (
        <span
            className={cn('inline-flex items-center gap-0.5', className)}
            aria-hidden
            {...props}
        >
            {DOT_DELAYS_MS.map((delayMs) => (
                <span
                    key={delayMs}
                    className="inline-block size-1 animate-bounce rounded-full bg-current"
                    style={{ animationDelay: `${delayMs}ms` }}
                />
            ))}
        </span>
    );
}

export { LoadingDots };

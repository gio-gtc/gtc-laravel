import * as React from 'react';

import { cn } from '@/lib/utils';

interface TextAreaProps extends React.ComponentProps<'textarea'> {
    variant?: 'default' | 'orderSlideout' | 'invoiceSlideout';
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
    ({ className, variant = 'default', ...props }, ref) => {
        const baseStyles =
            'flex min-h-[80px] w-full resize-y rounded-md border border-input bg-transparent px-2.5 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-gray-400 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40';

        const variants = {
            default: 'md-gray-900-weight-400',
            orderSlideout: '',
            invoiceSlideout: '',
        };

        return (
            <textarea
                ref={ref}
                data-slot="textarea"
                className={cn(baseStyles, variants[variant], className)}
                {...props}
            />
        );
    },
);
Textarea.displayName = 'Textarea';

export { Textarea };

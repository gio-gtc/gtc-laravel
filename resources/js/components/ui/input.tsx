import * as React from 'react';

import { cn } from '@/lib/utils';

export type InputVariants =
    | 'default'
    | 'orderSlideoutTableCells'
    | 'orderSlideoutpopup'
    | 'invoiceSlideout'
    | 'invoiceSlideoutpopup';

interface InputProps extends React.ComponentProps<'input'> {
    variant?: InputVariants;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
    { className, variant = 'default', type, ...props },
    ref,
) {
    const baseStyles =
        'flex w-full min-w-0 rounded-md border border-input bg-transparent px-2.5 py-1 shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-gray-400 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20';

    const variants: Record<InputVariants, string> = {
        default: 'md-gray-900-weight-400 h-[44px]',
        orderSlideoutTableCells: 'xs-gray-500-weight-600 max-h-[30px]',
        orderSlideoutpopup: 'max-h-[30px]',
        invoiceSlideout: 'xs-gray-700-weight-600 max-h-[30px]',
        invoiceSlideoutpopup: '',
    };

    return (
        <input
            ref={ref}
            type={type}
            data-slot="input"
            className={cn(baseStyles, variants[variant], className)}
            {...props}
        />
    );
});
Input.displayName = 'Input';

export { Input };

import * as React from 'react';

import { cn } from '@/lib/utils';

import { Input } from './input';

export type InputWithLeadingIconProps = Omit<
    React.ComponentProps<typeof Input>,
    'className'
> & {
    icon: React.ReactNode;
    /** Merged onto the outer relative container */
    className?: string;
    /** Merged onto the inner Input (baseline includes pl-9) */
    inputClassName?: string;
    children?: React.ReactNode;
};

const InputWithLeadingIcon = React.forwardRef<
    HTMLInputElement,
    InputWithLeadingIconProps
>(function InputWithLeadingIcon(
    { icon, className, inputClassName, children, ...inputProps },
    ref,
) {
    return (
        <div className={cn('relative', className)}>
            <span
                className="pointer-events-none absolute top-1/2 left-3 flex size-4 -translate-y-1/2 items-center justify-center text-muted-foreground [&>svg]:size-4 [&>svg]:shrink-0"
                aria-hidden
            >
                {icon}
            </span>
            <Input
                ref={ref}
                {...inputProps}
                className={cn('pl-9 text-gray-400', inputClassName)}
            />
            {children}
        </div>
    );
});
InputWithLeadingIcon.displayName = 'InputWithLeadingIcon';

export { InputWithLeadingIcon };

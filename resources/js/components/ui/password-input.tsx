import * as React from 'react';

import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';

import { Button } from './button';
import { Input } from './input';

export type PasswordInputProps = Omit<
    React.ComponentProps<typeof Input>,
    'type'
> & {
    /** Merged onto the outer relative container */
    containerClassName?: string;
    /** Merged onto the visibility toggle (e.g. light icon on dark auth cards) */
    toggleButtonClassName?: string;
};

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
    function PasswordInput(
        { containerClassName, toggleButtonClassName, className, ...inputProps },
        ref,
    ) {
        const [visible, setVisible] = React.useState(false);

        return (
            <div className={cn('relative', containerClassName)}>
                <Input
                    ref={ref}
                    type={visible ? 'text' : 'password'}
                    className={cn('pr-10', className)}
                    {...inputProps}
                />
                <Button
                    type="button"
                    variant="ghost"
                    // size="icon"
                    className={cn(
                        'absolute top-1/2 right-1 size-6 -translate-y-1/2 text-muted-foreground hover:text-foreground',
                        toggleButtonClassName,
                    )}
                    aria-label={visible ? 'Hide password' : 'Show password'}
                    aria-pressed={visible}
                    onClick={() => setVisible((v) => !v)}
                >
                    {visible ? (
                        <EyeOff className="size-4" />
                    ) : (
                        <Eye className="size-4" />
                    )}
                </Button>
            </div>
        );
    },
);
PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };

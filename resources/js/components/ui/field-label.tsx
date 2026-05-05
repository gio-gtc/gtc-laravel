import * as React from 'react';

import { Label } from '@/components/ui/label';

export type FieldLabelProps = React.ComponentProps<typeof Label> & {
    required?: boolean;
};

function FieldLabel({
    className,
    required = false,
    children,
    ...props
}: FieldLabelProps) {
    return (
        <Label className={className} {...props}>
            {children}
            {required ? (
                <span aria-hidden className="ml-0.5 text-destructive">
                    *
                </span>
            ) : null}
        </Label>
    );
}

export { FieldLabel };

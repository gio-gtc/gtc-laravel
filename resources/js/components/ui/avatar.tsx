import * as AvatarPrimitive from '@radix-ui/react-avatar';
import * as React from 'react';

import { cn } from '@/lib/utils';

function Avatar({
    className,
    children,
    ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
    const keyedChildren = React.Children.map(children, (child, index) => {
        if (React.isValidElement(child) && child.key == null) {
            return React.cloneElement(child, {
                key: `avatar-child-${index}`,
            } as React.Attributes);
        }
        return child;
    });
    return (
        <AvatarPrimitive.Root
            data-slot="avatar"
            className={cn(
                'relative flex size-8 shrink-0 overflow-hidden rounded-full',
                className,
            )}
            {...props}
        >
            {keyedChildren}
        </AvatarPrimitive.Root>
    );
}

function AvatarImage({
    className,
    src,
    ...props
}: Omit<React.ComponentProps<typeof AvatarPrimitive.Image>, 'src'> & {
    src?: string | null;
}) {
    return (
        <AvatarPrimitive.Image
            data-slot="avatar-image"
            className={cn('aspect-square size-full', className)}
            src={src ?? undefined}
            {...props}
        />
    );
}

function AvatarFallback({
    className,
    ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
    return (
        <AvatarPrimitive.Fallback
            data-slot="avatar-fallback"
            className={cn(
                'flex size-full items-center justify-center rounded-full bg-muted',
                className,
            )}
            {...props}
        />
    );
}

export { Avatar, AvatarFallback, AvatarImage };

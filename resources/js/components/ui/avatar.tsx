import * as AvatarPrimitive from '@radix-ui/react-avatar';
import * as React from 'react';

import { cn } from '@/lib/utils';

function Avatar({
    className,
    ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
    return (
        <AvatarPrimitive.Root
            data-slot="avatar"
            className={cn(
                'relative flex size-8 shrink-0 overflow-hidden rounded-full',
                className,
            )}
            {...props}
        />
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

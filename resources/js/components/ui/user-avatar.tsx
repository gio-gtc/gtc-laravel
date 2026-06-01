import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { type User } from '@/types';

interface UserAvatarProps {
    /** Full `User` from roster or `@/lib/user-for-avatar` embed mapping. */
    user: User;
    className?: string;
    /** When set (e.g. local file preview), shown instead of `user.avatar`. */
    imageOverride?: string | null;
}

export function UserAvatar({
    user,
    className,
    imageOverride,
}: UserAvatarProps) {
    const getInitials = useInitials();
    const imageSrc = imageOverride ?? user.avatar ?? undefined;

    return (
        <Avatar
            className={cn('size-[24px] border-1 border-background', className)}
        >
            {imageSrc ? <AvatarImage src={imageSrc} alt={user.name} /> : null}
            <AvatarFallback className="bg-neutral-200 text-[9px] text-black">
                {getInitials(user)}
            </AvatarFallback>
        </Avatar>
    );
}

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { type User } from '@/types';

interface UserAvatarProps {
    user: User;
    className?: string;
}

export function UserAvatar({ user, className }: UserAvatarProps) {
    const getInitials = useInitials();

    return (
        <Avatar
            className={cn('size-[24px] border-1 border-background', className)}
        >
            {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
            <AvatarFallback className="bg-neutral-200 text-[9px] text-black">
                {getInitials(user.name)}
            </AvatarFallback>
        </Avatar>
    );
}

import { cn } from '@/lib/utils';
import { type User } from '@/types';
import { UserAvatar } from './user-avatar';

interface UserAvatarsStackProps {
    users: User[];
    maxCount?: number;
    onClick?: () => void;
    avatarClassName?: string;
}

export function UserAvatarsStack({
    users,
    maxCount = 3,
    onClick,
    avatarClassName,
}: UserAvatarsStackProps) {
    const visibleUsers = users.slice(0, maxCount);
    const overflowCount = users.length - maxCount;

    const content = (
        <>
            <div className="flex items-center">
                {visibleUsers.map((user) => (
                    <UserAvatar
                        key={user.id}
                        user={user}
                        className={cn('-ml-2.5 first:ml-0', avatarClassName)}
                    />
                ))}
            </div>
            {overflowCount > 0 && (
                <span className="ml-2 text-xs text-muted-foreground">
                    +{overflowCount}
                </span>
            )}
        </>
    );

    if (onClick) {
        return (
            <div
                className="flex cursor-pointer items-center"
                onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                }}
            >
                {content}
            </div>
        );
    }

    return <div className="flex items-center">{content}</div>;
}

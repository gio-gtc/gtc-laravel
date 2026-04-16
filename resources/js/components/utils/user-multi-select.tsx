import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { InputWithLeadingIcon } from '@/components/ui/input-with-leading-icon';
import { useInitials } from '@/hooks/use-initials';
import { useUsersWithFallback } from '@/hooks/use-users-with-fallback';
import { cn } from '@/lib/utils';
import { type User } from '@/types';
import { CheckIcon, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { UserAvatar } from '../ui/user-avatar';

interface UserMultiSelectProps {
    selectedUsers: User[];
    onSelectionChange: (users: User[]) => void;
    availableUsers?: User[];
}

function UserMultiSelect({
    selectedUsers,
    onSelectionChange,
    availableUsers: availableUsersProp,
}: UserMultiSelectProps) {
    const usersWithFallback = useUsersWithFallback();
    const availableUsers = availableUsersProp ?? usersWithFallback;
    const [searchQuery, setSearchQuery] = useState('');
    const getInitials = useInitials();

    const filteredUsers = useMemo(() => {
        if (!searchQuery) return availableUsers;
        const query = searchQuery.toLowerCase();
        return availableUsers.filter(
            (user) =>
                user.name.toLowerCase().includes(query) ||
                user.email.toLowerCase().includes(query),
        );
    }, [availableUsers, searchQuery]);

    const toggleUser = (user: User) => {
        const isSelected = selectedUsers.some((u) => u.id === user.id);
        if (isSelected) {
            onSelectionChange(selectedUsers.filter((u) => u.id !== user.id));
        } else {
            onSelectionChange([...selectedUsers, user]);
        }
    };

    const removeUser = (userId: number) => {
        onSelectionChange(selectedUsers.filter((u) => u.id !== userId));
    };

    return (
        <div className="space-y-4">
            {/* Search Input */}
            <InputWithLeadingIcon
                icon={<Search />}
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />

            {/* Selected Users */}
            {selectedUsers.length > 0 && (
                <div className="space-y-2">
                    <label className="text-sm font-medium">Selected</label>
                    <div className="flex max-h-[150px] flex-wrap gap-2 overflow-y-auto">
                        {selectedUsers.map((user) => (
                            <div
                                key={user.id}
                                className="flex items-center gap-2 rounded-md border bg-muted px-2 py-1"
                            >
                                {/* TODO: change to reuseable avatar component */}
                                {user && <UserAvatar user={user} />}
                                <span className="text-sm">{user.name}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-4 w-4"
                                    onClick={() => removeUser(user.id)}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* User List */}
            <div className="space-y-2">
                <div
                    className="max-h-48 space-y-1 overflow-y-auto"
                    role="listbox"
                    aria-multiselectable
                >
                    {filteredUsers.length === 0 ? (
                        <div className="py-4 text-center text-sm text-muted-foreground">
                            No users found
                        </div>
                    ) : (
                        filteredUsers.map((user) => {
                            const isSelected = selectedUsers.some(
                                (u) => u.id === user.id,
                            );
                            return (
                                <div
                                    key={user.id}
                                    role="option"
                                    aria-selected={isSelected}
                                    className={cn(
                                        'relative flex cursor-pointer items-center gap-3 rounded-md p-2 pr-8 hover:bg-muted',
                                        isSelected && 'bg-muted',
                                    )}
                                    onClick={() => toggleUser(user)}
                                >
                                    {isSelected && (
                                        <span className="absolute right-2 flex size-3.5 items-center justify-center">
                                            <CheckIcon className="size-4" />
                                        </span>
                                    )}
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage
                                            src={user.avatar || ''}
                                            alt={user.name}
                                        />
                                        <AvatarFallback className="bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                            {getInitials(user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium">
                                            {user.name}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {user.email}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}

export default UserMultiSelect;

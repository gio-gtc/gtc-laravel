import { mockUsers } from '@/components/mockdata';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { type User } from '@/types';
import { Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';

interface UserMultiSelectProps {
    selectedUsers: User[];
    onSelectionChange: (users: User[]) => void;
    availableUsers?: User[];
}

function UserMultiSelect({
    selectedUsers,
    onSelectionChange,
    availableUsers = mockUsers as unknown as User[],
}: UserMultiSelectProps) {
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
            <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Selected Users */}
            {selectedUsers.length > 0 && (
                <div className="space-y-2">
                    <label className="text-sm font-medium">Selected</label>
                    <div className="flex flex-wrap gap-2">
                        {selectedUsers.map((user) => (
                            <div
                                key={user.id}
                                className="flex items-center gap-2 rounded-md border bg-muted px-2 py-1"
                            >
                                <Avatar className="h-6 w-6">
                                    <AvatarImage
                                        src={user.avatar}
                                        alt={user.name}
                                    />
                                    <AvatarFallback className="bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                        {getInitials(user.name)}
                                    </AvatarFallback>
                                </Avatar>
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
                <label className="text-sm font-medium">Available Users</label>
                <div className="max-h-60 space-y-1 overflow-y-auto">
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
                                    className={cn(
                                        'flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-muted',
                                        isSelected && 'bg-muted',
                                    )}
                                    onClick={() => toggleUser(user)}
                                >
                                    <Checkbox
                                        checked={isSelected}
                                        onCheckedChange={() => toggleUser(user)}
                                    />
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage
                                            src={user.avatar}
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

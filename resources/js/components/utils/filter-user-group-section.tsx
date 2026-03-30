import { cn } from '@/lib/utils';
import { type User } from '@/types';
import { CheckIcon } from 'lucide-react';
import UserMultiSelect from './user-multi-select';

export interface FilterUserGroupSectionProps {
    title: string;
    myChecked?: boolean | null;
    onMyChange?: (checked: boolean) => void | undefined;
    selectedUsers: User[];
    onUsersChange: (users: User[]) => void;
    availableUsers: User[];
    myLabel?: string;
}

export default function FilterUserGroupSection({
    title,
    myChecked = null,
    onMyChange,
    selectedUsers,
    onUsersChange,
    availableUsers,
    myLabel = 'My',
}: FilterUserGroupSectionProps) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{title}</p>
                {myChecked !== null && onMyChange && (
                    <button
                        type="button"
                        className="relative flex cursor-pointer items-center pr-8 text-sm"
                        onClick={() => onMyChange(!myChecked)}
                    >
                        <span>{myLabel}</span>
                        <span
                            className={cn(
                                'absolute right-2 flex size-3.5 items-center justify-center',
                                myChecked && 'text-brand-gtc-red',
                            )}
                        >
                            <CheckIcon className="size-4" />
                        </span>
                    </button>
                )}
            </div>
            <UserMultiSelect
                selectedUsers={selectedUsers}
                onSelectionChange={onUsersChange}
                availableUsers={availableUsers}
            />
        </div>
    );
}

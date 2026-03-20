import { Checkbox } from '@/components/ui/checkbox';
import { type User } from '@/types';
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
                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                        <Checkbox
                            checked={myChecked}
                            onCheckedChange={(checked) => onMyChange(!!checked)}
                        />
                        {myLabel}
                    </label>
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

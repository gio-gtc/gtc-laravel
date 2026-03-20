import { Checkbox } from '@/components/ui/checkbox';
import { type User } from '@/types';
import UserMultiSelect from './user-multi-select';

export interface FilterUserGroupSectionProps {
    title: string;
    myChecked: boolean;
    onMyChange: (checked: boolean) => void;
    selectedUsers: User[];
    onUsersChange: (users: User[]) => void;
    availableUsers: User[];
    myLabel?: string;
}

export default function FilterUserGroupSection({
    title,
    myChecked,
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
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <Checkbox
                        checked={myChecked}
                        onCheckedChange={(checked) => onMyChange(!!checked)}
                    />
                    {myLabel}
                </label>
            </div>
            <div className="max-h-48 overflow-y-auto">
                <UserMultiSelect
                    selectedUsers={selectedUsers}
                    onSelectionChange={onUsersChange}
                    availableUsers={availableUsers}
                />
            </div>
        </div>
    );
}

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    ColumnedRowsChild,
    ColumnedRowsParent,
} from '@/components/utils/column-row-layouts';
import DatePickerInput from '@/components/utils/date-picker-input';
import Divider from '@/components/utils/divider';
import FilterUserGroupSection from '@/components/utils/filter-user-group-section';
import { useUsersWithFallback } from '@/hooks/use-users-with-fallback';
import type { SharedData, User } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

export interface BulkEditVenueRowsModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedCount: number;
    initialDueDateIso?: string;
    initialAssigned: User[];
    onSave: (payload: { dueDateIso: string; assigned: User[] }) => void;
}

export default function BulkEditVenueRowsModal({
    isOpen,
    onClose,
    selectedCount,
    initialDueDateIso,
    initialAssigned,
    onSave,
}: BulkEditVenueRowsModalProps) {
    const { auth } = usePage<SharedData>().props;
    const usersWithFallback = useUsersWithFallback();

    const [dueDateIso, setDueDateIso] = useState('');
    const [selectedAssignees, setSelectedAssignees] = useState<User[]>([]);
    const [myAssigned, setMyAssigned] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        setDueDateIso(initialDueDateIso ?? '');
        setSelectedAssignees([...initialAssigned]);
        setMyAssigned(false);
    }, [isOpen, initialDueDateIso, initialAssigned]);

    const assigneePool = useMemo(() => {
        if (myAssigned) {
            return usersWithFallback.filter((u) => u.id === auth.user.id);
        }
        return usersWithFallback;
    }, [myAssigned, usersWithFallback, auth.user.id]);

    const availableUsers = useMemo(
        () =>
            assigneePool.filter(
                (u) => !selectedAssignees.some((s) => s.id === u.id),
            ),
        [assigneePool, selectedAssignees],
    );

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!dueDateIso.trim()) return;
        onSave({ dueDateIso, assigned: selectedAssignees });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                    <DialogTitle>Update due date & assignees</DialogTitle>
                    <DialogDescription>
                        Applies to {selectedCount} selected row
                        {selectedCount === 1 ? '' : 's'}.
                    </DialogDescription>
                </DialogHeader>

                <Divider />
                <form onSubmit={handleSubmit} className="space-y-4">
                    <ColumnedRowsParent>
                        <ColumnedRowsChild
                            labelFor="bulk-due-date"
                            labelContent="Due date"
                            childrenContainerClasses="modal-child-container"
                            required
                        >
                            <DatePickerInput
                                id="bulk-due-date"
                                label=""
                                value={dueDateIso}
                                onChange={setDueDateIso}
                                required
                                dialogTitle="Due date"
                            />
                            <InputError message={undefined} />
                        </ColumnedRowsChild>
                        <ColumnedRowsChild
                            labelFor="bulk-assigned"
                            labelContent="Assigned"
                            childrenContainerClasses="modal-child-container"
                            multiInput
                        >
                            <FilterUserGroupSection
                                title=""
                                myChecked={myAssigned}
                                onMyChange={setMyAssigned}
                                selectedUsers={selectedAssignees}
                                onUsersChange={setSelectedAssignees}
                                availableUsers={availableUsers}
                                myLabel="My"
                            />
                            <InputError message={undefined} />
                        </ColumnedRowsChild>
                    </ColumnedRowsParent>
                    <Divider />
                    <DialogFooter className="gap-3 sm:gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-brand-gtc-red">
                            Save
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

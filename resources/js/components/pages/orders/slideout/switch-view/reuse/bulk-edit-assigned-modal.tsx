import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    ColumnedRowsChild,
    ColumnedRowsParent,
} from '@/components/utils/column-row-layouts';
import Divider from '@/components/utils/divider';
import FilterUserGroupSection from '@/components/utils/filter-user-group-section';
import { useUsersWithFallback } from '@/hooks/use-users-with-fallback';
import type { SharedData, User } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

export interface BulkEditAssignedModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedCount: number;
    initialAssigned: User[];
    onSave: (payload: { assigned: User[] }) => void;
}

export default function BulkEditAssignedModal({
    isOpen,
    onClose,
    selectedCount,
    initialAssigned,
    onSave,
}: BulkEditAssignedModalProps) {
    const { auth } = usePage<SharedData>().props;
    const usersWithFallback = useUsersWithFallback();

    const [selectedAssignees, setSelectedAssignees] = useState<User[]>([]);
    const [myAssigned, setMyAssigned] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        setSelectedAssignees([...initialAssigned]);
        setMyAssigned(false);
    }, [isOpen, initialAssigned]);

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
        onSave({ assigned: selectedAssignees });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update assignees</DialogTitle>
                </DialogHeader>

                <Divider />
                <form onSubmit={handleSubmit} className="space-y-4">
                    <ColumnedRowsParent>
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

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import Divider from '@/components/utils/divider';
import { ModalFooterActions } from '@/components/utils/modal-footer-actions';
import FilterUserGroupSection from '@/components/utils/filter-user-group-section';
import { useUsersWithFallback } from '@/hooks/use-users-with-fallback';
import type { SharedData, User } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

export interface BulkEditAssignedModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialAssigned: User[];
    onSave: (payload: { assigned: User[] }) => void;
}

export default function BulkEditAssignedModal({
    isOpen,
    onClose,
    initialAssigned,
    onSave,
}: BulkEditAssignedModalProps) {
    const { auth } = usePage<SharedData>().props;
    const usersWithFallback = useUsersWithFallback();

    const [selectedAssignees, setSelectedAssignees] = useState<User[]>([]);

    useEffect(() => {
        if (!isOpen) return;
        setSelectedAssignees([...initialAssigned]);
    }, [isOpen, initialAssigned]);

    const assigneePool = useMemo(() => {
        return usersWithFallback;
    }, [usersWithFallback, auth.user.id]);

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
            <DialogContent className="sm:max-w-[350px]">
                <DialogHeader>
                    <DialogTitle>Update Assignees</DialogTitle>
                </DialogHeader>

                <Divider />
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FilterUserGroupSection
                        title="Assignees"
                        selectedUsers={selectedAssignees}
                        onUsersChange={setSelectedAssignees}
                        availableUsers={availableUsers}
                    />
                    <InputError message={undefined} />
                    <Divider />
                    <ModalFooterActions onCancel={onClose} confirmLabel="Save" />
                </form>
            </DialogContent>
        </Dialog>
    );
}

import InputError from '@/components/input-error';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import Divider from '@/components/utils/divider';
import { ModalFooterActions } from '@/components/utils/modal-footer-actions';
import FilterUserGroupSection from '@/components/utils/filter-user-group-section';
import {
    fetchStaffRoster,
    OrderItemApiError,
} from '@/lib/orders/order-item-api-client';
import type { User } from '@/types';
import { useEffect, useMemo, useRef, useState } from 'react';

export interface BulkEditAssignedModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialAssigned: User[];
    onSave: (payload: { assigned: User[] }) => void | Promise<void>;
    saveError?: string;
}

export default function BulkEditAssignedModal({
    isOpen,
    onClose,
    initialAssigned,
    onSave,
    saveError,
}: BulkEditAssignedModalProps) {
    const staffCacheRef = useRef<User[] | null>(null);

    const [selectedAssignees, setSelectedAssignees] = useState<User[]>([]);
    const [assigneePool, setAssigneePool] = useState<User[]>([]);
    const [staffLoading, setStaffLoading] = useState(false);
    const [staffLoadError, setStaffLoadError] = useState<string | undefined>();
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        setSelectedAssignees([...initialAssigned]);
        setStaffLoadError(undefined);

        if (staffCacheRef.current) {
            setAssigneePool(staffCacheRef.current);
            setStaffLoading(false);
            return;
        }

        const controller = new AbortController();
        setStaffLoading(true);

        void fetchStaffRoster(controller.signal)
            .then((staff) => {
                staffCacheRef.current = staff;
                setAssigneePool(staff);
            })
            .catch((error: unknown) => {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return;
                }
                if (error instanceof OrderItemApiError) {
                    setStaffLoadError(error.message);
                    return;
                }
                setStaffLoadError('Could not load staff roster.');
            })
            .finally(() => {
                setStaffLoading(false);
            });

        return () => controller.abort();
    }, [isOpen, initialAssigned]);

    const availableUsers = useMemo(
        () =>
            assigneePool.filter(
                (u) => !selectedAssignees.some((s) => s.id === u.id),
            ),
        [assigneePool, selectedAssignees],
    );

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (staffLoading || isSaving || staffLoadError) return;

        setIsSaving(true);
        try {
            await onSave({ assigned: selectedAssignees });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[350px]">
                <DialogHeader>
                    <DialogTitle>Update Assignees</DialogTitle>
                </DialogHeader>

                <Divider />
                <form onSubmit={handleSubmit} className="space-y-4">
                    {staffLoading ? (
                        <p className="text-sm text-muted-foreground">
                            Loading staff…
                        </p>
                    ) : (
                        <FilterUserGroupSection
                            title="Assignees"
                            selectedUsers={selectedAssignees}
                            onUsersChange={setSelectedAssignees}
                            availableUsers={availableUsers}
                        />
                    )}
                    <InputError
                        message={staffLoadError ?? saveError}
                    />
                    <Divider />
                    <ModalFooterActions
                        onCancel={onClose}
                        confirmLabel={isSaving ? 'Saving…' : 'Save'}
                        confirmDisabled={
                            staffLoading ||
                            isSaving ||
                            !!staffLoadError
                        }
                    />
                </form>
            </DialogContent>
        </Dialog>
    );
}

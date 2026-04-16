import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    ColumnedRowsChild,
    ColumnedRowsParent,
} from '@/components/utils/column-row-layouts';
import DatePickerInput from '@/components/utils/date-picker-input';
import Divider from '@/components/utils/divider';
import { ModalFooterActions } from '@/components/utils/modal-footer-actions';
import { useEffect, useState } from 'react';

export interface BulkEditDueDateModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialDueDateIso?: string;
    onSave: (payload: { dueDateIso: string }) => void;
}

export default function BulkEditDueDateModal({
    isOpen,
    onClose,
    initialDueDateIso,
    onSave,
}: BulkEditDueDateModalProps) {
    const [dueDateIso, setDueDateIso] = useState('');

    useEffect(() => {
        if (!isOpen) return;
        setDueDateIso(initialDueDateIso ?? '');
    }, [isOpen, initialDueDateIso]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!dueDateIso.trim()) return;
        onSave({ dueDateIso });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update Due Date</DialogTitle>
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
                    </ColumnedRowsParent>
                    <Divider />
                    <ModalFooterActions onCancel={onClose} confirmLabel="Save" />
                </form>
            </DialogContent>
        </Dialog>
    );
}

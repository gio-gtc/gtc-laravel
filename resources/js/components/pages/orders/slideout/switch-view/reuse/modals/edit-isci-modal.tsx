import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    ColumnedRowsChild,
    ColumnedRowsParent,
} from '@/components/utils/column-row-layouts';
import Divider from '@/components/utils/divider';
import { useState } from 'react';

export interface EditIsciModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialIsci: string;
    onSave: (payload: { isci: string }) => void;
}

export default function EditIsciModal({
    isOpen,
    onClose,
    initialIsci,
    onSave,
}: EditIsciModalProps) {
    const [isci, setIsci] = useState(initialIsci);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!isci.trim()) return;
        onSave({ isci: isci.trim() });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit ISCI</DialogTitle>
                </DialogHeader>

                <Divider />
                <form onSubmit={handleSubmit} className="space-y-4">
                    <ColumnedRowsParent>
                        <ColumnedRowsChild
                            labelFor="edit-isci"
                            labelContent="ISCI"
                            childrenContainerClasses="modal-child-container"
                            required
                        >
                            <Input
                                id="edit-isci"
                                value={isci}
                                onChange={(e) => setIsci(e.target.value)}
                                required
                                autoComplete="off"
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
                        <Button type="submit">Save</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { type Invoice } from '@/types';
import { useState } from 'react';

interface DeleteInvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    invoice: Invoice | null;
}

export default function DeleteInvoiceModal({
    isOpen,
    onClose,
    onConfirm,
    invoice,
}: DeleteInvoiceModalProps) {
    const [deleteReason, setDeleteReason] = useState('');

    const handleClose = () => {
        setDeleteReason('');
        onClose();
    };

    const handleConfirm = () => {
        onConfirm(deleteReason);
        setDeleteReason('');
    };

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) {
                    handleClose();
                }
            }}
        >
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">
                        Delete Invoice
                    </DialogTitle>
                </DialogHeader>
                <Separator />
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label className="text-base font-semibold">
                            Reason for Deletion
                        </Label>
                        <p className="text-sm text-muted-foreground">
                            Please provide a reason for deleting this invoice.
                        </p>
                        <Textarea
                            id="delete_reason"
                            className="min-h-[100px]"
                            value={deleteReason}
                            onChange={(e) => setDeleteReason(e.target.value)}
                            placeholder="Client paid in combination with other invoice."
                            rows={4}
                        />
                    </div>
                </div>
                <DialogFooter className="sm:justify-end">
                    <Button variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        disabled={deleteReason.trim() === ''}
                        onClick={handleConfirm}
                    >
                        Delete Invoice
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { type Invoice } from '@/types';
import { useState } from 'react';

type InvoiceModalAction = 'delete' | 'restore';

interface DeleteInvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    invoice: Invoice | null;
    action: InvoiceModalAction;
}

const ACTION_COPY: Record<
    InvoiceModalAction,
    {
        title: string;
        label: string;
        description: string;
        placeholder: string;
        confirmButton: string;
    }
> = {
    delete: {
        title: 'Delete Invoice',
        label: 'Reason for Deletion',
        description: 'Please provide a reason for deleting this invoice.',
        placeholder: 'Client paid in combination with other invoice.',
        confirmButton: 'Delete Invoice',
    },
    restore: {
        title: 'Restore Invoice',
        label: 'Reason for Restoration',
        description: 'Please provide a reason for restoring this invoice.',
        placeholder: 'Invoice reinstated per client request.',
        confirmButton: 'Restore Invoice',
    },
};

export default function DeleteInvoiceModal({
    isOpen,
    onClose,
    onConfirm,
    invoice,
    action,
}: DeleteInvoiceModalProps) {
    const [reason, setReason] = useState('');
    const copy = ACTION_COPY[action];

    const handleClose = () => {
        setReason('');
        onClose();
    };

    const handleConfirm = () => {
        onConfirm(reason);
        setReason('');
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
                    <DialogTitle>{copy.title}</DialogTitle>
                </DialogHeader>
                <Separator />
                <div>
                    <div className="space-y-2">
                        <Label className="xs-gray-700-weight-600">
                            {copy.label}
                        </Label>
                        <p className="xs-gray-600-weight-400">
                            {copy.description}
                        </p>
                        <Textarea
                            id="reason"
                            className="text-xs md:text-xs"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder={copy.placeholder}
                            rows={4}
                        />
                    </div>
                </div>
                <Separator />
                <DialogFooter className="sm:justify-end">
                    <Button variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button
                        variant={action === 'delete' ? 'destructive' : 'default'}
                        disabled={reason.trim() === ''}
                        onClick={handleConfirm}
                    >
                        {copy.confirmButton}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

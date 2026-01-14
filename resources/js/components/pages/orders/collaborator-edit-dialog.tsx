import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { type User } from '@/types';
import { useState } from 'react';
import UserMultiSelect from './user-multi-select';

interface CollaboratorEditDialogProps {
    orderId: string;
    order: {
        id: string;
        artist: string;
        name: string;
        venue: string;
        dueDate: string;
        client: User;
        collaborators: User[];
        status: string;
        isGroupHeader?: boolean;
    } | null;
    isOpen: boolean;
    onClose: () => void;
}

function CollaboratorEditDialog({
    orderId,
    order,
    isOpen,
    onClose,
}: CollaboratorEditDialogProps) {
    const [selectedUsers, setSelectedUsers] = useState<User[]>(
        order?.collaborators || [],
    );

    const handleSave = () => {
        // TODO: Implement actual save logic with API call
        console.log('Saving collaborators for order:', orderId, selectedUsers);
        onClose();
    };

    if (!order) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit Collaborators</DialogTitle>
                    <div className="text-sm text-muted-foreground">
                        {order.name} - {order.venue}
                    </div>
                </DialogHeader>
                <div className="py-4">
                    <UserMultiSelect
                        selectedUsers={selectedUsers}
                        onSelectionChange={setSelectedUsers}
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default CollaboratorEditDialog;

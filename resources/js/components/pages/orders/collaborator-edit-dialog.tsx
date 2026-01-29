import { venueCollaboratorData } from '@/components/mockdata';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useUsersWithFallback } from '@/hooks/use-users-with-fallback';
import { type Venue, type User } from '@/types';
import { useEffect, useMemo, useState } from 'react';
import UserMultiSelect from './user-multi-select';

interface CollaboratorEditDialogProps {
    venueId: number;
    venue: Venue | null;
    isOpen: boolean;
    onClose: () => void;
}

function CollaboratorEditDialog({
    venueId,
    venue,
    isOpen,
    onClose,
}: CollaboratorEditDialogProps) {
    const usersWithFallback = useUsersWithFallback();

    // Get current collaborators from join table
    const currentCollaborators = useMemo(() => {
        if (!venue) return [];
        const collaboratorIds = venueCollaboratorData
            .filter((vc) => vc.venue_id === venue.id)
            .map((vc) => vc.mockUser_id);
        return usersWithFallback.filter((user) =>
            collaboratorIds.includes(user.id),
        );
    }, [venue, usersWithFallback]);

    const [selectedUsers, setSelectedUsers] = useState<User[]>(
        currentCollaborators,
    );

    // Update selected users when venue changes
    useEffect(() => {
        setSelectedUsers(currentCollaborators);
    }, [currentCollaborators]);

    const handleSave = () => {
        // TODO: Implement actual save logic with API call
        // This would update venueCollaboratorData join table
        console.log(
            'Saving collaborators for venue:',
            venueId,
            selectedUsers.map((u) => u.id),
        );
        onClose();
    };

    if (!venue) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit Collaborators</DialogTitle>
                    <div className="text-sm text-muted-foreground">
                        {venue.name}
                    </div>
                </DialogHeader>
                <div className="py-4">
                    <UserMultiSelect
                        selectedUsers={selectedUsers}
                        onSelectionChange={setSelectedUsers}
                        availableUsers={usersWithFallback}
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

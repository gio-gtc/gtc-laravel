import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    getUniqueAssignedUsersForTourVenue,
    type OrdersVenueLineCatalog,
} from '@/components/utils/venue-items';
import { useOrdersCatalog } from '@/contexts/orders-catalog-context';
import { useUsersWithFallback } from '@/hooks/use-users-with-fallback';
import { type User } from '@/types';
import { useEffect, useMemo, useState } from 'react';
import UserMultiSelect from '@/components/utils/user-multi-select';

interface CollaboratorEditDialogProps {
    tourVenueId: number;
    /** Venue or tour-venue label for display */
    venueName: string;
    isOpen: boolean;
    onClose: () => void;
}

function CollaboratorEditDialog({
    tourVenueId,
    venueName,
    isOpen,
    onClose,
}: CollaboratorEditDialogProps) {
    const catalog = useOrdersCatalog();
    const usersWithFallback = useUsersWithFallback();

    const venueLineCatalog = useMemo((): OrdersVenueLineCatalog => {
        return {
            venue_items: catalog.venue_items,
            venue_item_assigned: catalog.venue_item_assigned,
            venue_item_status: catalog.venue_item_status,
        };
    }, [
        catalog.venue_items,
        catalog.venue_item_assigned,
        catalog.venue_item_status,
    ]);

    const currentAssignees = useMemo(
        () =>
            getUniqueAssignedUsersForTourVenue(
                tourVenueId,
                usersWithFallback,
                venueLineCatalog,
            ),
        [tourVenueId, usersWithFallback, venueLineCatalog],
    );

    const [selectedUsers, setSelectedUsers] =
        useState<User[]>(currentAssignees);

    useEffect(() => {
        setSelectedUsers(currentAssignees);
    }, [currentAssignees]);

    const handleSave = () => {
        // TODO: API — persist assignees (venueItemAssigned / server model)
        console.log(
            'Saving assignees for tour venue:',
            tourVenueId,
            selectedUsers.map((u) => u.id),
        );
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit assignees</DialogTitle>
                    <div className="text-sm text-muted-foreground">
                        {venueName}
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

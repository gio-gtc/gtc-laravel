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
import DatePickerInput from '@/components/utils/date-picker-input';
import Divider from '@/components/utils/divider';
import { type Tour, type TourVenue, type Venue } from '@/types';
import { type VenueSearchOption } from '@/types/orders-api';
import { useEffect, useState } from 'react';
import VenueAutocomplete from './venue-autocomplete';

export type AddOrderModalTour = {
    id: number;
    name: string;
};

interface VenueItem {
    orderVenue: TourVenue;
    venue: Venue | null;
}

interface AddOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** Tour context for add mode (from API table selection). */
    tour?: AddOrderModalTour | null;
    /** Legacy slideout edit mode. */
    orderId?: number;
    order?: Tour | null;
    mode?: 'add' | 'edit';
    venueItem?: VenueItem | null;
}

export default function AddOrderModal({
    isOpen,
    onClose,
    tour = null,
    orderId = 0,
    order = null,
    mode = 'add',
    venueItem = null,
}: AddOrderModalProps) {
    const [selectedVenue, setSelectedVenue] =
        useState<VenueSearchOption | null>(null);
    const [showStartDate, setShowStartDate] = useState<string | null>(null);
    const [showEndDate, setShowEndDate] = useState<string | null>(null);
    const [dueDate, setDueDate] = useState<string>();
    const [localDeliverables, setLocalDeliverables] = useState<string>('');

    const isEditMode = mode === 'edit' && venueItem != null;
    const displayName = tour?.name ?? order?.name ?? '';

    useEffect(() => {
        if (!isOpen) return;

        if (isEditMode && venueItem) {
            setSelectedVenue(venueItem.venue);
            setShowStartDate(
                venueItem.orderVenue.start_date.split('T')[0] ?? null,
            );
            setShowEndDate(venueItem.orderVenue.end_date.split('T')[0] ?? null);
            setDueDate(
                order?.due_date?.split?.('T')[0] ??
                    new Date().toISOString().split('T')[0],
            );
            setLocalDeliverables('');
        } else {
            setDueDate(new Date().toISOString().split('T')[0]);
        }
    }, [isOpen, order, isEditMode, venueItem]);

    useEffect(() => {
        if (!isOpen) {
            setSelectedVenue(null);
            setShowStartDate(null);
            setShowEndDate(null);
            setLocalDeliverables('');
        }
    }, [isOpen]);

    const handleSave = () => {
        if (isEditMode) {
            onClose();
            return;
        }

        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[95vw] overflow-y-auto sm:max-w-[890px]">
                <DialogHeader>
                    <DialogTitle>
                        {displayName && (
                            <span className="lg-gray-700-weight-600 block pb-1">
                                {displayName}
                            </span>
                        )}

                        {isEditMode ? 'Edit Order Info' : 'Add Order'}
                    </DialogTitle>
                </DialogHeader>

                <Divider />
                <ColumnedRowsParent>
                    <ColumnedRowsChild
                        labelFor="venue-name"
                        labelContent="Venue Name"
                        required={!isEditMode}
                    >
                        {isEditMode ? (
                            <Input
                                id="venue-name"
                                type="text"
                                value={
                                    selectedVenue?.name ??
                                    venueItem?.venue?.name ??
                                    ''
                                }
                                readOnly
                                disabled
                                className="bg-muted"
                            />
                        ) : (
                            <VenueAutocomplete
                                value={selectedVenue}
                                onChange={setSelectedVenue}
                                required
                            />
                        )}
                    </ColumnedRowsChild>

                    <ColumnedRowsChild
                        labelFor="show-dates"
                        labelContent="Show Dates"
                        childrenContainerClasses="flex gap-2 items-center"
                        required
                    >
                        <DatePickerInput
                            id="show-date-start"
                            value={showStartDate || ''}
                            onChange={(value) => setShowStartDate(value)}
                            required
                        />
                        -
                        <DatePickerInput
                            id="show-date-end"
                            value={showEndDate || ''}
                            onChange={(value) => setShowEndDate(value)}
                            required
                        />
                    </ColumnedRowsChild>

                    <ColumnedRowsChild
                        labelFor="due-date"
                        labelContent="Due Date"
                        required={!isEditMode}
                    >
                        <DatePickerInput
                            id="due-date"
                            value={dueDate || ''}
                            onChange={(value) => setDueDate(value)}
                            required={!isEditMode}
                            disabled={isEditMode}
                        />
                    </ColumnedRowsChild>

                    <ColumnedRowsChild
                        labelFor="local-deliverables"
                        labelContent="Local Deliverables"
                    >
                        <Input
                            id="local-deliverables"
                            type="text"
                            value={localDeliverables}
                            onChange={(e) =>
                                setLocalDeliverables(e.target.value)
                            }
                            placeholder="email@example.com"
                            disabled={isEditMode}
                            readOnly={isEditMode}
                            className={isEditMode ? 'bg-muted' : ''}
                        />
                    </ColumnedRowsChild>
                </ColumnedRowsParent>

                <Divider />
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>
                        {isEditMode ? 'Save' : 'Add Order'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

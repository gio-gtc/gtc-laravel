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
import { useEffect, useState } from 'react';
import VenueAutocomplete from './venue-autocomplete';

interface VenueItem {
    orderVenue: TourVenue;
    venue: Venue | null;
}

interface AddVenueModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: number;
    order: Tour | null;
    mode?: 'add' | 'edit';
    venueItem?: VenueItem | null;
}

export default function AddVenueModal({
    isOpen,
    onClose,
    orderId,
    order,
    mode = 'add',
    venueItem = null,
}: AddVenueModalProps) {
    const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
    const [showStartDate, setShowStartDate] = useState<string | null>(null);
    const [showEndDate, setShowEndDate] = useState<string | null>(null);
    const [dueDate, setDueDate] = useState<string>();
    const [localDeliverables, setLocalDeliverables] = useState<string>('');

    const isEditMode = mode === 'edit' && venueItem != null;

    // Initialize form when modal opens
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

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setSelectedVenue(null);
            setShowStartDate(null);
            setShowEndDate(null);
            setLocalDeliverables('');
        }
    }, [isOpen]);

    const handleSave = () => {
        if (!showStartDate || !showEndDate) {
            alert('Please select show dates');
            return;
        }

        if (isEditMode && venueItem) {
            // TODO: Implement actual save logic with API call
            console.log('Updating venue show dates:', {
                tour_venue_id: venueItem.orderVenue.id,
                startDate: showStartDate,
                endDate: showEndDate,
            });
        } else {
            if (!selectedVenue) {
                alert('Please select a venue');
                return;
            }
            if (!dueDate) {
                alert('Please select a due date');
                return;
            }
            // TODO: Implement actual save logic with API call
            console.log('Adding venue to order:', {
                orderId,
                venueId: selectedVenue.id,
                venueName: selectedVenue.name,
                startDate: showStartDate,
                endDate: showEndDate,
                dueDate,
                localDeliverables,
            });
        }

        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[890px]">
                <DialogHeader>
                    <DialogTitle>
                        {order && (
                            <span className="lg-gray-700-weight-600 block pb-1">
                                {order.name}
                            </span>
                        )}

                        {isEditMode ? 'Edit Venue Info' : 'Add Venue'}
                    </DialogTitle>
                </DialogHeader>

                <Divider />
                <ColumnedRowsParent>
                    {/* Venue Name - Autocomplete or read-only */}
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

                    {/* Show Dates - Date Range */}
                    <ColumnedRowsChild
                        labelFor="show-dates"
                        labelContent="Show Dates"
                        childrenContainerClasses="flex gap-2 items-center"
                        required
                    >
                        <DatePickerInput
                            id="show-date-start"
                            className="max-w-[140px]"
                            value={showStartDate || ''}
                            onChange={(value) => setShowStartDate(value)}
                            required
                        />
                        -
                        <DatePickerInput
                            id="show-date-end"
                            className="max-w-[140px]"
                            value={showEndDate || ''}
                            onChange={(value) => setShowEndDate(value)}
                            required
                        />
                    </ColumnedRowsChild>

                    {/* Due Date */}
                    <ColumnedRowsChild
                        labelFor="due-date"
                        labelContent="Due Date"
                        required={!isEditMode}
                    >
                        <DatePickerInput
                            id="due-date"
                            className="max-w-[140px]"
                            value={dueDate || ''}
                            onChange={(value) => setDueDate(value)}
                            required={!isEditMode}
                            disabled={isEditMode}
                        />
                    </ColumnedRowsChild>

                    {/* Local Deliverables */}
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
                            placeholder="email@company.com"
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
                        {isEditMode ? 'Save' : 'Add Venue'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

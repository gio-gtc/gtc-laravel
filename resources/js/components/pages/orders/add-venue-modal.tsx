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
import DateRangePicker from '@/components/utils/date-range-picker';
import Divider from '@/components/utils/divider';
import { type Tour, type Venue } from '@/types';
import { Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import VenueAutocomplete from './venue-autocomplete';

interface AddVenueModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: number;
    order: Tour | null;
}

function formatDateInput(value: string | undefined | null): string {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export default function AddVenueModal({
    isOpen,
    onClose,
    orderId,
    order,
}: AddVenueModalProps) {
    const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
    const [showStartDate, setShowStartDate] = useState<string | null>(null);
    const [showEndDate, setShowEndDate] = useState<string | null>(null);
    const [dueDate, setDueDate] = useState<string>();
    const [localDeliverables, setLocalDeliverables] = useState<string>('');

    // Initialize due date with order's due_date when modal opens or order changes
    useEffect(() => {
        setDueDate(new Date().toISOString().split('T')[0]);
    }, [isOpen, order]);

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setSelectedVenue(null);
            setShowStartDate(null);
            setShowEndDate(null);
            setLocalDeliverables('');
            // Due date will be reset by the above effect when modal opens
        }
    }, [isOpen]);

    const handleDateRangeChange = (range: {
        startDate: string | null;
        endDate: string | null;
    }) => {
        setShowStartDate(range.startDate);
        setShowEndDate(range.endDate);
    };

    const handleSave = () => {
        // Validate required fields
        if (!selectedVenue) {
            alert('Please select a venue');
            return;
        }
        if (!showStartDate || !showEndDate) {
            alert('Please select show dates');
            return;
        }
        if (!dueDate) {
            alert('Please select a due date');
            return;
        }

        // TODO: Implement actual save logic with API call
        // This would create a new TourVenue entry in tourVenueData table
        console.log('Adding venue to order:', {
            orderId,
            venueId: selectedVenue.id,
            venueName: selectedVenue.name,
            startDate: showStartDate,
            endDate: showEndDate,
            dueDate,
            localDeliverables,
        });

        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Add Venue</DialogTitle>
                </DialogHeader>

                <Divider />
                <ColumnedRowsParent>
                    {/* Venue Name - Autocomplete */}
                    <ColumnedRowsChild
                        labelFor="venue-name"
                        labelContent="Venue Name"
                        required
                    >
                        <VenueAutocomplete
                            value={selectedVenue}
                            onChange={setSelectedVenue}
                            required
                        />
                    </ColumnedRowsChild>

                    {/* Show Dates - Date Range */}
                    <ColumnedRowsChild
                        labelFor="show-dates"
                        labelContent="Show Dates"
                        required
                    >
                        <DateRangePicker
                            startDate={showStartDate}
                            endDate={showEndDate}
                            onDateRangeChange={handleDateRangeChange}
                            buttonVariant="outline"
                            buttonSize="default"
                            buttonClassName="w-full justify-start"
                            placeholder="Select date range"
                            dialogTitle="Select Show Dates"
                        />
                    </ColumnedRowsChild>

                    {/* Due Date */}
                    <ColumnedRowsChild
                        labelFor="due-date"
                        labelContent="Due Date"
                        required
                    >
                        <div className="relative">
                            <Input
                                id="due-date"
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    const el = document.getElementById(
                                        'due-date',
                                    ) as HTMLInputElement | null;
                                    el?.showPicker?.();
                                    el?.focus();
                                    el?.click();
                                }}
                                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <Calendar className="h-4 w-4" />
                            </button>
                        </div>
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
                            placeholder="Enter local deliverables..."
                        />
                    </ColumnedRowsChild>
                </ColumnedRowsParent>

                <Divider />
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>Add Venue</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

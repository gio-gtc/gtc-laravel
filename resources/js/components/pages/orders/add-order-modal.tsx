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
import DatePickerInput from '@/components/utils/date-picker-input';
import Divider from '@/components/utils/divider';
import { isCollaboratorUser } from '@/lib/orders/orders-filter-users';
import { store as ordersStore } from '@/routes/orders';
import {
    type SharedData,
    type Tour,
    type TourVenue,
    type Venue,
} from '@/types';
import {
    type ClientSearchOption,
    type VenueSearchOption,
} from '@/types/orders-api';
import { useForm, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import ClientAutocomplete from './client-autocomplete';
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

const todayIso = () => new Date().toISOString().split('T')[0];

export default function AddOrderModal({
    isOpen,
    onClose,
    tour = null,
    order = null,
    mode = 'add',
    venueItem = null,
}: AddOrderModalProps) {
    const { auth } = usePage<SharedData>().props;
    const isStaff = auth.user != null && isCollaboratorUser(auth.user);

    const [selectedVenue, setSelectedVenue] =
        useState<VenueSearchOption | null>(null);
    const [selectedClient, setSelectedClient] =
        useState<ClientSearchOption | null>(null);

    const isEditMode = mode === 'edit' && venueItem != null;
    const displayName = tour?.name ?? order?.name ?? '';

    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        clearErrors,
        transform,
    } = useForm({
        tour_id: tour?.id ?? 0,
        venue_id: 0,
        due_date: todayIso(),
        show_date: '',
        local_deliverable_email: '',
        ordered_by_id: 0,
    });

    useEffect(() => {
        if (!isOpen) return;

        if (isEditMode && venueItem) {
            setSelectedVenue(venueItem.venue);
            setData({
                tour_id: tour?.id ?? 0,
                venue_id: venueItem.venue?.id ?? 0,
                due_date: order?.due_date?.split?.('T')[0] ?? todayIso(),
                show_date: venueItem.orderVenue.start_date.split('T')[0] ?? '',
                local_deliverable_email: '',
                ordered_by_id: 0,
            });
            setSelectedClient(null);
        } else {
            reset();
            setData({
                tour_id: tour?.id ?? 0,
                venue_id: 0,
                due_date: todayIso(),
                show_date: '',
                local_deliverable_email: '',
                ordered_by_id: 0,
            });
            setSelectedVenue(null);
            setSelectedClient(null);
        }
        clearErrors();
    }, [
        isOpen,
        tour?.id,
        order,
        isEditMode,
        venueItem,
        reset,
        setData,
        clearErrors,
    ]);

    useEffect(() => {
        if (!isOpen) {
            setSelectedVenue(null);
            setSelectedClient(null);
        }
    }, [isOpen]);

    useEffect(() => {
        if (tour?.id) {
            setData('tour_id', tour.id);
        }
    }, [tour?.id, setData]);

    useEffect(() => {
        setData('venue_id', selectedVenue?.id ?? 0);
    }, [selectedVenue, setData]);

    const canSubmit = useMemo(() => {
        if (isEditMode) return true;
        if (!tour?.id || data.tour_id <= 0) return false;
        if (!selectedVenue?.id) return false;
        if (!data.due_date || !data.show_date) return false;
        if (isStaff && !selectedClient?.id) return false;
        return true;
    }, [
        isEditMode,
        tour?.id,
        data.tour_id,
        data.due_date,
        data.show_date,
        selectedVenue?.id,
        isStaff,
        selectedClient?.id,
    ]);

    const handleSave = () => {
        if (isEditMode) {
            onClose();
            return;
        }

        if (!canSubmit) return;

        transform(() => {
            return {
                tour_id: data.tour_id,
                venue_id: selectedVenue?.id ?? data.venue_id,
                due_date: data.due_date,
                show_date: data.show_date,
                local_deliverable_email: data.local_deliverable_email,
                ...(isStaff && selectedClient?.id
                    ? { ordered_by_id: selectedClient.id }
                    : {}),
            };
        });

        post(ordersStore.url(), {
            preserveScroll: true,
            onSuccess: () => {
                onClose();
            },
        });
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
                            <>
                                <VenueAutocomplete
                                    value={selectedVenue}
                                    onChange={setSelectedVenue}
                                    required
                                />
                                <InputError message={errors.venue_id} />
                            </>
                        )}
                    </ColumnedRowsChild>

                    {isStaff && !isEditMode && (
                        <ColumnedRowsChild
                            labelFor="ordered-by"
                            labelContent="Ordered By"
                            required
                        >
                            <ClientAutocomplete
                                value={selectedClient}
                                onChange={setSelectedClient}
                                required
                            />
                            <InputError message={errors.ordered_by_id} />
                        </ColumnedRowsChild>
                    )}

                    <ColumnedRowsChild
                        labelFor="show-date"
                        labelContent="Show Date"
                        required={!isEditMode}
                    >
                        <DatePickerInput
                            id="show-date"
                            value={data.show_date}
                            onChange={(value) => setData('show_date', value)}
                            required={!isEditMode}
                            disabled={isEditMode}
                        />
                        <InputError message={errors.show_date} />
                    </ColumnedRowsChild>

                    <ColumnedRowsChild
                        labelFor="due-date"
                        labelContent="Due Date"
                        required={!isEditMode}
                    >
                        <DatePickerInput
                            id="due-date"
                            value={data.due_date}
                            onChange={(value) => setData('due_date', value)}
                            required={!isEditMode}
                            disabled={isEditMode}
                        />
                        <InputError message={errors.due_date} />
                    </ColumnedRowsChild>

                    <ColumnedRowsChild
                        labelFor="local-deliverables"
                        labelContent="Local Deliverables"
                    >
                        <Input
                            id="local-deliverables"
                            type="email"
                            value={data.local_deliverable_email}
                            onChange={(e) =>
                                setData(
                                    'local_deliverable_email',
                                    e.target.value,
                                )
                            }
                            placeholder="email@example.com"
                            disabled={isEditMode}
                            readOnly={isEditMode}
                            className={isEditMode ? 'bg-muted' : ''}
                        />
                        <InputError message={errors.local_deliverable_email} />
                    </ColumnedRowsChild>
                </ColumnedRowsParent>

                <Divider />
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={processing}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={processing || (!isEditMode && !canSubmit)}
                    >
                        {processing
                            ? 'Saving…'
                            : isEditMode
                              ? 'Save'
                              : 'Add Order'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

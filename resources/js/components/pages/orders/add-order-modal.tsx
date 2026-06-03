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
import ShowDatesInputList from '@/components/utils/show-dates-input-list';
import {
    expandVenueShowDates,
    hasValidShowDates,
    normalizeShowDates,
} from '@/lib/format/show-dates';
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

interface OrderItemSchema {
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
    orderItem?: OrderItemSchema | null;
}

const todayIso = () => new Date().toISOString().split('T')[0];

function showDatesFormErrors(
    errors: Record<string, string | undefined>,
): string | undefined {
    const direct = errors.show_dates;
    if (direct) return direct;

    const indexed = Object.entries(errors)
        .filter(([key]) => key.startsWith('show_dates.'))
        .map(([, message]) => message)
        .filter(Boolean);

    return indexed.length > 0 ? indexed.join(' ') : undefined;
}

export default function AddOrderModal({
    isOpen,
    onClose,
    tour = null,
    order = null,
    mode = 'add',
    orderItem = null,
}: AddOrderModalProps) {
    const { auth } = usePage<SharedData>().props;
    const isStaff = auth.user != null && isCollaboratorUser(auth.user);

    const [selectedVenue, setSelectedVenue] =
        useState<VenueSearchOption | null>(null);
    const [selectedClient, setSelectedClient] =
        useState<ClientSearchOption | null>(null);

    const isEditMode = mode === 'edit' && orderItem != null;
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
        show_dates: [''],
        local_deliverable_email: '',
        ordered_by_id: 0,
    });

    useEffect(() => {
        if (!isOpen) return;

        if (isEditMode && orderItem) {
            setSelectedVenue(orderItem.venue);
            const prefilledShowDates = normalizeShowDates(
                expandVenueShowDates(
                    orderItem.orderVenue.start_date,
                    orderItem.orderVenue.end_date,
                ),
            );
            setData({
                tour_id: tour?.id ?? 0,
                venue_id: orderItem.venue?.id ?? 0,
                due_date: order?.due_date?.split?.('T')[0] ?? todayIso(),
                show_dates:
                    prefilledShowDates.length > 0 ? prefilledShowDates : [''],
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
                show_dates: [''],
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
        orderItem,
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
        if (!data.due_date || !hasValidShowDates(data.show_dates)) return false;
        if (isStaff && !selectedClient?.id) return false;
        return true;
    }, [
        isEditMode,
        tour?.id,
        data.tour_id,
        data.due_date,
        data.show_dates,
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
                show_dates: normalizeShowDates(data.show_dates),
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
                                    orderItem?.venue?.name ??
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
                        labelFor="show-date-0"
                        labelContent="Show Dates"
                        required={!isEditMode}
                        multiInput
                    >
                        <ShowDatesInputList
                            dates={data.show_dates}
                            onChange={(show_dates) =>
                                setData('show_dates', show_dates)
                            }
                            idPrefix="show-date"
                        />
                        <InputError message={showDatesFormErrors(errors)} />
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

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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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
import { ORDER_HEADER_DESCRIPTION_FIELDS } from '@/lib/orders/order-header-descriptions';
import {
    buildOrderPatchPayload,
    descriptionFormFromApiOrder,
    showDateRowsFromApiOrder,
} from '@/lib/orders/order-patch-payload';
import { isCollaboratorUser } from '@/lib/orders/orders-filter-users';
import { patchOrder } from '@/lib/orders/orders-api-client';
import { useTourOptions } from '@/hooks/use-orders-tours';
import { store as ordersStore } from '@/routes/orders';
import {
    type SharedData,
    type Tour,
    type TourVenue,
    type Venue,
} from '@/types';
import type {
    ApiOrder,
    ClientSearchOption,
    OrderHeaderDescriptionKey,
    ShowDateEditRow,
    VenueSearchOption,
} from '@/types/orders-api';
import { useForm, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
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

const emptyDescriptionForm = (): Record<
    OrderHeaderDescriptionKey,
    string
> => ({
    ticket_outlets: '',
    on_same_date: '',
    cardholder_times: '',
    logos: '',
    special_instructions: '',
});

interface AddOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    tour?: AddOrderModalTour | null;
    order?: Tour | null;
    apiOrder?: ApiOrder | null;
    mode?: 'add' | 'edit';
    orderItem?: OrderItemSchema | null;
    onOrderSaved?: (order: ApiOrder) => void;
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
    apiOrder = null,
    mode = 'add',
    orderItem = null,
    onOrderSaved,
}: AddOrderModalProps) {
    const { auth } = usePage<SharedData>().props;
    const isStaff = auth.user != null && isCollaboratorUser(auth.user);
    const {
        options: tourOptions,
        isLoading: tourOptionsLoading,
        error: tourOptionsError,
        loadTourOptions,
    } = useTourOptions();

    const [selectedVenue, setSelectedVenue] =
        useState<VenueSearchOption | null>(null);
    const [selectedClient, setSelectedClient] =
        useState<ClientSearchOption | null>(null);
    const [headerForm, setHeaderForm] = useState(emptyDescriptionForm);
    const [showDateRows, setShowDateRows] = useState<ShowDateEditRow[]>([
        { show_date: '' },
    ]);
    const [saving, setSaving] = useState(false);

    const isEditMode = mode === 'edit' && orderItem != null;
    const needsTourSelect = !isEditMode && !tour?.id;

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

    const selectedTourName = useMemo(() => {
        if (tour?.name) {
            return tour.name;
        }
        if (data.tour_id > 0) {
            return (
                tourOptions.find((option) => option.id === data.tour_id)?.name ??
                ''
            );
        }
        return '';
    }, [tour?.name, data.tour_id, tourOptions]);
    const displayName = selectedTourName || order?.name || '';

    useEffect(() => {
        if (!isOpen || !needsTourSelect) {
            return;
        }
        loadTourOptions();
    }, [isOpen, needsTourSelect, loadTourOptions]);

    useEffect(() => {
        if (!isOpen) return;

        if (isEditMode && orderItem) {
            setSelectedVenue(orderItem.venue);

            if (apiOrder) {
                setShowDateRows(showDateRowsFromApiOrder(apiOrder.show_dates));
                setHeaderForm(descriptionFormFromApiOrder(apiOrder));
                setData({
                    tour_id: apiOrder.tour_id,
                    venue_id: orderItem.venue?.id ?? 0,
                    due_date:
                        apiOrder.due_date?.split?.('T')[0] ??
                        order?.due_date?.split?.('T')[0] ??
                        todayIso(),
                    show_dates: [''],
                    local_deliverable_email:
                        apiOrder.local_deliverable_email ?? '',
                    ordered_by_id: apiOrder.ordered_by_id ?? 0,
                });
            } else {
                const legacyDates = normalizeShowDates(
                    expandVenueShowDates(
                        orderItem.orderVenue.start_date,
                        orderItem.orderVenue.end_date,
                    ),
                );
                setShowDateRows(
                    legacyDates.length > 0
                        ? legacyDates.map((show_date) => ({ show_date }))
                        : [{ show_date: '' }],
                );
                setHeaderForm(emptyDescriptionForm());
                setData({
                    tour_id: tour?.id ?? 0,
                    venue_id: orderItem.venue?.id ?? 0,
                    due_date: order?.due_date?.split?.('T')[0] ?? todayIso(),
                    show_dates: [''],
                    local_deliverable_email: '',
                    ordered_by_id: 0,
                });
            }
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
            setHeaderForm(emptyDescriptionForm());
            setShowDateRows([{ show_date: '' }]);
        }
        clearErrors();
    }, [
        isOpen,
        tour?.id,
        order,
        apiOrder,
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

    const editShowDateStrings = useMemo(
        () => showDateRows.map((r) => r.show_date),
        [showDateRows],
    );

    const canSubmit = useMemo(() => {
        if (isEditMode) {
            return (
                apiOrder != null &&
                hasValidShowDates(editShowDateStrings)
            );
        }
        if (data.tour_id <= 0) return false;
        if (!selectedVenue?.id) return false;
        if (!data.due_date || !hasValidShowDates(data.show_dates)) return false;
        if (isStaff && !selectedClient?.id) return false;
        return true;
    }, [
        isEditMode,
        apiOrder,
        editShowDateStrings,
        tour?.id,
        data.tour_id,
        data.due_date,
        data.show_dates,
        selectedVenue?.id,
        isStaff,
        selectedClient?.id,
    ]);

    const isSaving = processing || saving;

    const handleShowDatesChange = (dates: string[]) => {
        if (isEditMode) {
            setShowDateRows(
                dates.map((show_date, index) => ({
                    id: showDateRows[index]?.id,
                    show_date,
                })),
            );
            return;
        }
        setData('show_dates', dates);
    };

    const handleSave = async () => {
        if (isEditMode) {
            if (!apiOrder?.id || !canSubmit) {
                return;
            }

            setSaving(true);
            try {
                const payload = buildOrderPatchPayload(
                    headerForm,
                    showDateRows,
                );
                const updated = await patchOrder(apiOrder.id, payload);
                onOrderSaved?.(updated ?? apiOrder);
                toast.success('Order info saved.');
                onClose();
            } catch {
                toast.error('Could not save order info.');
            } finally {
                setSaving(false);
            }
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

    const showDatesForList = isEditMode ? editShowDateStrings : data.show_dates;

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
                    {needsTourSelect && (
                        <ColumnedRowsChild
                            labelFor="tour-id"
                            labelContent="Tour"
                            required
                        >
                            <Select
                                value={
                                    data.tour_id > 0
                                        ? String(data.tour_id)
                                        : undefined
                                }
                                onValueChange={(value) =>
                                    setData('tour_id', Number(value))
                                }
                                disabled={tourOptionsLoading}
                                required
                            >
                                <SelectTrigger id="tour-id">
                                    <SelectValue
                                        placeholder={
                                            tourOptionsLoading
                                                ? 'Loading tours…'
                                                : 'Select tour'
                                        }
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {tourOptions.map((option) => (
                                        <SelectItem
                                            key={option.id}
                                            value={String(option.id)}
                                        >
                                            {option.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError
                                message={
                                    tourOptionsError ?? errors.tour_id
                                }
                            />
                        </ColumnedRowsChild>
                    )}

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
                            dates={showDatesForList}
                            onChange={handleShowDatesChange}
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

                    {isEditMode &&
                        ORDER_HEADER_DESCRIPTION_FIELDS.map(
                            ({ key, label, multiline }) => (
                                <ColumnedRowsChild
                                    key={key}
                                    labelFor={`order-header-${key}`}
                                    labelContent={label}
                                >
                                    {multiline ? (
                                        <Textarea
                                            id={`order-header-${key}`}
                                            value={headerForm[key]}
                                            className="min-h-28"
                                            onChange={(e) =>
                                                setHeaderForm((prev) => ({
                                                    ...prev,
                                                    [key]: e.target.value,
                                                }))
                                            }
                                        />
                                    ) : (
                                        <Input
                                            id={`order-header-${key}`}
                                            type="text"
                                            value={headerForm[key]}
                                            onChange={(e) =>
                                                setHeaderForm((prev) => ({
                                                    ...prev,
                                                    [key]: e.target.value,
                                                }))
                                            }
                                        />
                                    )}
                                </ColumnedRowsChild>
                            ),
                        )}
                </ColumnedRowsParent>

                <Divider />
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isSaving}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => void handleSave()}
                        disabled={isSaving || !canSubmit}
                    >
                        {isSaving
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

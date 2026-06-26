import InputError from '@/components/input-error';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { InputWithLeadingIcon } from '@/components/ui/input-with-leading-icon';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
    ColumnedRowsChild,
    ColumnedRowsParent,
} from '@/components/utils/column-row-layouts';
import DatePickerInput from '@/components/utils/date-picker-input';
import Divider from '@/components/utils/divider';
import DollarInput from '@/components/utils/dollar-input';
import { ModalFooterActions } from '@/components/utils/modal-footer-actions';
import { useTourOptions } from '@/hooks/use-orders-tours';
import { store as toursStore } from '@/routes/tours';
import { type SharedData } from '@/types';
import {
    type TourFormDepartment,
    type TourFormPageProps,
    type TourFormUser,
    type FlashPayload,
} from '@/types/inertia-pages';
import { useForm, usePage } from '@inertiajs/react';
import type { Page } from '@inertiajs/core';
import { Mail } from 'lucide-react';
import { toast } from 'react-toastify';

interface TourModalProps {
    isOpen: boolean;
    onClose: () => void;
}

/** Internal Radix value only — maps to `voice_over: null` in form state. */
const VOICE_OVER_UNSET = '__voice_over_unset__';

const initialTourForm = {
    name: '',
    start_date: '',
    expire_on_sale_now_cuts: '',
    voice_over: null as string | null,
    hold_all_invoices: false,
    live_on_ordering_system: false,
    require_client_approval: false,
    client_approval_email: '',
    tour_sponsor: '',
    special_instructions: '',
    tv_first_cut: '',
    tv_second_cut: '',
    radio_single_duration: '',
    radio_dual_duration: '',
    key_art: '',
    gtc_department: '',
    gtc_representative: '',
};

function formatUserDisplayName(user: TourFormUser): string {
    return `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim();
}

function departmentLabel(department: TourFormDepartment): string {
    return department.name?.trim() || `Department ${department.id}`;
}

export default function TourModal({ isOpen, onClose }: TourModalProps) {
    const {
        departments = [],
        gtcReps = [],
        voiceOvers = [],
    } = usePage<SharedData & TourFormPageProps>().props;

    const { data, setData, post, processing, errors, reset } =
        useForm(initialTourForm);
    const { invalidateTourOptions } = useTourOptions();

    const handleClose = () => {
        reset();
        onClose();
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(toursStore.url(), {
            preserveScroll: true,
            onSuccess: (page: Page) => {
                const flash = page.props.flash as FlashPayload | undefined;
                const errorFlash =
                    typeof flash?.error === 'string' &&
                    flash.error.trim() !== ''
                        ? flash.error.trim()
                        : null;

                if (errorFlash !== null) {
                    // Session flash error toast is surfaced by app-layout; stay open.
                    return;
                }

                invalidateTourOptions();
                reset();
                onClose();
            },
            onError: () => {
                toast.error(
                    'Please fix the highlighted fields and try again.',
                    { toastId: 'tour-modal-validation-error' },
                );
            },
        });
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
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[800px]">
                <DialogHeader>
                    <DialogTitle>Add Tour</DialogTitle>
                </DialogHeader>
                <Divider />
                <form onSubmit={handleSubmit} className="space-y-6">
                    <ColumnedRowsParent>
                        <ColumnedRowsChild
                            labelFor="name"
                            labelContent="Tour Name"
                            required
                        >
                            <Input
                                id="name"
                                name="name"
                                placeholder="Tour Name"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                required
                            />
                            <InputError message={errors.name} />
                        </ColumnedRowsChild>

                        <ColumnedRowsChild
                            labelFor="start_date"
                            labelContent="Start Date"
                            required
                        >
                            <DatePickerInput
                                id="start_date"
                                className="max-w-[150px]"
                                value={data.start_date}
                                onChange={(value) =>
                                    setData('start_date', value)
                                }
                                required
                            />
                            <InputError message={errors.start_date} />
                        </ColumnedRowsChild>

                        <ColumnedRowsChild
                            labelFor="expire_on_sale_now_cuts"
                            labelContent="Expire On Sale Now Cuts"
                        >
                            <DatePickerInput
                                id="expire_on_sale_now_cuts"
                                className="max-w-[150px]"
                                value={data.expire_on_sale_now_cuts}
                                onChange={(value) =>
                                    setData('expire_on_sale_now_cuts', value)
                                }
                            />
                            <InputError
                                message={errors.expire_on_sale_now_cuts}
                            />
                        </ColumnedRowsChild>
                    </ColumnedRowsParent>

                    <div className="flex flex-1 flex-col gap-2 sm:flex-row">
                        <Label className="sm:flex-1">Tour Options</Label>
                        <div className="flex flex-2 flex-col gap-3">
                            <div className="flex flex-col gap-1">
                                <span className="xs-gray-700-weight-500">
                                    Voice Over
                                </span>
                                <Select
                                    value={
                                        data.voice_over ?? VOICE_OVER_UNSET
                                    }
                                    onValueChange={(value) =>
                                        setData(
                                            'voice_over',
                                            value === VOICE_OVER_UNSET
                                                ? null
                                                : value,
                                        )
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Voice Over" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={VOICE_OVER_UNSET}>
                                            --- Select Option ---
                                        </SelectItem>
                                        {voiceOvers.map((user) => (
                                            <SelectItem
                                                key={user.id}
                                                value={String(user.id)}
                                            >
                                                {formatUserDisplayName(user)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.voice_over} />
                            </div>
                            <div className="flex gap-1">
                                <Switch
                                    id="hold_all_invoices"
                                    checked={data.hold_all_invoices}
                                    onCheckedChange={(checked) =>
                                        setData('hold_all_invoices', checked)
                                    }
                                />
                                <Label
                                    htmlFor="hold_all_invoices"
                                    className="sm-gray-700-weight-500"
                                >
                                    Hold All Invoices
                                </Label>
                                <InputError
                                    message={errors.hold_all_invoices}
                                />
                            </div>

                            <div className="flex gap-1">
                                <Switch
                                    id="live_on_ordering_system"
                                    checked={data.live_on_ordering_system}
                                    onCheckedChange={(checked) =>
                                        setData(
                                            'live_on_ordering_system',
                                            checked,
                                        )
                                    }
                                />
                                <Label
                                    htmlFor="live_on_ordering_system"
                                    className="sm-gray-700-weight-500"
                                >
                                    Live On Ordering System
                                </Label>
                                <InputError
                                    message={errors.live_on_ordering_system}
                                />
                            </div>

                            <div className="flex gap-1">
                                <Switch
                                    id="require_client_approval"
                                    checked={data.require_client_approval}
                                    onCheckedChange={(checked) =>
                                        setData(
                                            'require_client_approval',
                                            checked,
                                        )
                                    }
                                />
                                <Label
                                    htmlFor="require_client_approval"
                                    className="sm-gray-700-weight-500"
                                >
                                    Require Client Approval
                                </Label>
                                <InputError
                                    message={errors.require_client_approval}
                                />
                            </div>
                        </div>
                    </div>

                    {data.require_client_approval && (
                        <ColumnedRowsParent>
                            <ColumnedRowsChild
                                labelFor="client_approval_email"
                                labelContent="Client Approval Email"
                                required
                            >
                                <InputWithLeadingIcon
                                    icon={<Mail />}
                                    id="client_approval_email"
                                    name="client_approval_email"
                                    type="email"
                                    placeholder="Client Approval Email"
                                    value={data.client_approval_email}
                                    onChange={(e) =>
                                        setData(
                                            'client_approval_email',
                                            e.target.value,
                                        )
                                    }
                                    required
                                />
                                <InputError
                                    message={errors.client_approval_email}
                                />
                            </ColumnedRowsChild>
                        </ColumnedRowsParent>
                    )}

                    <ColumnedRowsParent>
                        <ColumnedRowsChild
                            labelFor="tour_sponsor"
                            labelContent="Tour Sponsor"
                        >
                            <Input
                                id="tour_sponsor"
                                name="tour_sponsor"
                                placeholder="Tour Sponsor"
                                value={data.tour_sponsor}
                                onChange={(e) =>
                                    setData('tour_sponsor', e.target.value)
                                }
                            />
                            <InputError message={errors.tour_sponsor} />
                        </ColumnedRowsChild>

                        <ColumnedRowsChild
                            labelFor="special_instructions"
                            labelContent="Special Instructions"
                        >
                            <Textarea
                                id="special_instructions"
                                name="special_instructions"
                                placeholder="Special Instructions"
                                className="min-h-28"
                                value={data.special_instructions}
                                onChange={(e) =>
                                    setData(
                                        'special_instructions',
                                        e.target.value,
                                    )
                                }
                            />
                            <InputError message={errors.special_instructions} />
                        </ColumnedRowsChild>
                    </ColumnedRowsParent>

                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                        <Label className="sm:flex-1">Price</Label>

                        <div className="relative flex flex-2 flex-col gap-2">
                            <div className="flex max-w-[300px] flex-col justify-between gap-2">
                                <PriceInput
                                    title="TV First Cut"
                                    id="tv_first_cut"
                                    value={data.tv_first_cut}
                                    onChangeValue={(value) =>
                                        setData('tv_first_cut', value)
                                    }
                                    error={errors.tv_first_cut}
                                />

                                <PriceInput
                                    title="TV Second Cut"
                                    id="tv_second_cut"
                                    value={data.tv_second_cut}
                                    onChangeValue={(value) =>
                                        setData('tv_second_cut', value)
                                    }
                                    error={errors.tv_second_cut}
                                />

                                <PriceInput
                                    title="Radio Single Duration"
                                    id="radio_single_duration"
                                    value={data.radio_single_duration}
                                    onChangeValue={(value) =>
                                        setData('radio_single_duration', value)
                                    }
                                    error={errors.radio_single_duration}
                                />

                                <PriceInput
                                    title="Radio Dual Duration"
                                    id="radio_dual_duration"
                                    value={data.radio_dual_duration}
                                    onChangeValue={(value) =>
                                        setData('radio_dual_duration', value)
                                    }
                                    error={errors.radio_dual_duration}
                                />

                                <PriceInput
                                    title="Key Art"
                                    id="key_art"
                                    value={data.key_art}
                                    onChangeValue={(value) =>
                                        setData('key_art', value)
                                    }
                                    error={errors.key_art}
                                />
                            </div>
                        </div>
                    </div>

                    <ColumnedRowsParent>
                        <ColumnedRowsChild
                            labelFor="gtc_department"
                            labelContent="GTC Department"
                            required
                        >
                            <Select
                                value={data.gtc_department || undefined}
                                onValueChange={(value) =>
                                    setData('gtc_department', value)
                                }
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="GTC Department" />
                                </SelectTrigger>
                                <SelectContent>
                                    {departments.map((department) => (
                                        <SelectItem
                                            key={department.id}
                                            value={String(department.id)}
                                        >
                                            {departmentLabel(department)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.gtc_department} />
                        </ColumnedRowsChild>

                        <ColumnedRowsChild
                            labelFor="gtc_representative"
                            labelContent="GTC Represenitive"
                            required
                        >
                            <Select
                                value={data.gtc_representative || undefined}
                                onValueChange={(value) =>
                                    setData('gtc_representative', value)
                                }
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="GTC Represenitive" />
                                </SelectTrigger>
                                <SelectContent>
                                    {gtcReps.map((user) => (
                                        <SelectItem
                                            key={user.id}
                                            value={String(user.id)}
                                        >
                                            {formatUserDisplayName(user)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.gtc_representative} />
                        </ColumnedRowsChild>
                    </ColumnedRowsParent>

                    <Divider />
                    <ModalFooterActions
                        onCancel={handleClose}
                        confirmLabel={
                            <>
                                {processing && <Spinner />}
                                Save Tour
                            </>
                        }
                        confirmDisabled={processing}
                        confirmClassName="inline-flex items-center gap-2"
                    />
                </form>
            </DialogContent>
        </Dialog>
    );
}

function PriceInput({
    title,
    id,
    value,
    onChangeValue,
    error,
}: {
    title: string;
    id: string;
    value: string;
    onChangeValue: (value: string) => void;
    error: string | undefined;
}) {
    return (
        <>
            <div className="flex items-center justify-between gap-2">
                <Label htmlFor={id} className="sm-black-weight-400">
                    {title}
                </Label>
                <DollarInput
                    id={id}
                    containerClassNames="max-w-20"
                    value={value}
                    onChangeValue={onChangeValue}
                />
            </div>
            <InputError message={error} />
        </>
    );
}

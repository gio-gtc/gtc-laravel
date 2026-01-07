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
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import Divider from '@/components/utils/divider';
import { Calendar, DollarSign, Mail } from 'lucide-react';
import { useState } from 'react';

interface TourModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function TourModal({
    isOpen,
    onClose,
}: TourModalProps) {
    const [holdAllInvoices, setHoldAllInvoices] = useState(false);
    const [liveOnOrderingSystem, setLiveOnOrderingSystem] = useState(false);
    const [requireClientApproval, setRequireClientApproval] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [expireOnSaleNowCuts, setExpireOnSaleNowCuts] = useState('');

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // TODO: Connect to backend when ready
        console.log('Tour form submitted');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Add Tour</DialogTitle>
                </DialogHeader>

                <Divider />

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Tour Name Section */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                                <Label
                                    htmlFor="tour_name"
                                    className="sm:flex-1"
                                >
                                    Tour Name
                                    <span className="text-destructive">*</span>
                                </Label>
                                <div className="relative flex-1">
                                    <Input
                                        id="tour_name"
                                        name="tour_name"
                                        placeholder="Tour Name"
                                        required
                                        className="border-gray-300"
                                    />
                                </div>
                                <InputError message={undefined} />
                            </div>
                        </div>
                    </div>

                    <Divider />

                    {/* Dates Section */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                                <Label
                                    htmlFor="start_date"
                                    className="sm:flex-1"
                                >
                                    Start Date
                                    <span className="text-destructive">*</span>
                                </Label>
                                <div className="relative flex-1">
                                    <Input
                                        id="start_date"
                                        name="start_date"
                                        type="date"
                                        value={startDate}
                                        onChange={(e) =>
                                            setStartDate(e.target.value)
                                        }
                                        required
                                        className="border-gray-300"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const el =
                                                document.getElementById(
                                                    'start_date',
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
                                <InputError message={undefined} />
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                                <Label
                                    htmlFor="expire_on_sale_now_cuts"
                                    className="sm:flex-1"
                                >
                                    Expire On Sale Now Cuts
                                </Label>
                                <div className="relative flex-1">
                                    <Input
                                        id="expire_on_sale_now_cuts"
                                        name="expire_on_sale_now_cuts"
                                        type="date"
                                        value={expireOnSaleNowCuts}
                                        onChange={(e) =>
                                            setExpireOnSaleNowCuts(
                                                e.target.value,
                                            )
                                        }
                                        className="border-gray-300"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const el =
                                                document.getElementById(
                                                    'expire_on_sale_now_cuts',
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
                                <InputError message={undefined} />
                            </div>
                        </div>
                    </div>

                    <Divider />

                    {/* Tour Options Section */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                                <Label
                                    htmlFor="voice_over"
                                    className="sm:flex-1"
                                >
                                    Voice Over
                                </Label>
                                <div className="relative flex-1">
                                    <Select name="voice_over">
                                        <SelectTrigger className="border-gray-300">
                                            <SelectValue placeholder="Voice Over" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="gilbert_gottfried">
                                                Gilbert Gottfried
                                            </SelectItem>
                                            <SelectItem value="none">None</SelectItem>
                                            <SelectItem value="option_1">
                                                Option 1
                                            </SelectItem>
                                            <SelectItem value="option_2">
                                                Option 2
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <InputError message={undefined} />
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                                <Label className="sm:flex-1">
                                    Hold All Invoices
                                </Label>
                                <div className="flex flex-1 items-center gap-2">
                                    <input
                                        type="hidden"
                                        name="hold_all_invoices"
                                        value={holdAllInvoices ? '1' : '0'}
                                    />
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={holdAllInvoices}
                                        id="hold_all_invoices"
                                        onClick={() =>
                                            setHoldAllInvoices((v) => !v)
                                        }
                                        className={[
                                            'relative inline-flex h-4 w-8 items-center rounded-full transition-colors',
                                            holdAllInvoices
                                                ? 'bg-brand-gtc-red'
                                                : 'bg-muted',
                                            'focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
                                        ].join(' ')}
                                    >
                                        <span
                                            className={[
                                                'inline-block h-3 w-3 transform rounded-full bg-background shadow-lg transition-transform',
                                                holdAllInvoices
                                                    ? 'translate-x-4.5'
                                                    : 'translate-x-1',
                                            ].join(' ')}
                                        />
                                    </button>
                                </div>
                                <InputError message={undefined} />
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                                <Label className="sm:flex-1">
                                    Live On Ordering System
                                </Label>
                                <div className="flex flex-1 items-center gap-2">
                                    <input
                                        type="hidden"
                                        name="live_on_ordering_system"
                                        value={
                                            liveOnOrderingSystem ? '1' : '0'
                                        }
                                    />
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={liveOnOrderingSystem}
                                        id="live_on_ordering_system"
                                        onClick={() =>
                                            setLiveOnOrderingSystem((v) => !v)
                                        }
                                        className={[
                                            'relative inline-flex h-4 w-8 items-center rounded-full transition-colors',
                                            liveOnOrderingSystem
                                                ? 'bg-brand-gtc-red'
                                                : 'bg-muted',
                                            'focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
                                        ].join(' ')}
                                    >
                                        <span
                                            className={[
                                                'inline-block h-3 w-3 transform rounded-full bg-background shadow-lg transition-transform',
                                                liveOnOrderingSystem
                                                    ? 'translate-x-4.5'
                                                    : 'translate-x-1',
                                            ].join(' ')}
                                        />
                                    </button>
                                </div>
                                <InputError message={undefined} />
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                                <Label className="sm:flex-1">
                                    Require Client Approval
                                </Label>
                                <div className="flex flex-1 items-center gap-2">
                                    <input
                                        type="hidden"
                                        name="require_client_approval"
                                        value={
                                            requireClientApproval ? '1' : '0'
                                        }
                                    />
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={requireClientApproval}
                                        id="require_client_approval"
                                        onClick={() =>
                                            setRequireClientApproval((v) => !v)
                                        }
                                        className={[
                                            'relative inline-flex h-4 w-8 items-center rounded-full transition-colors',
                                            requireClientApproval
                                                ? 'bg-brand-gtc-red'
                                                : 'bg-muted',
                                            'focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
                                        ].join(' ')}
                                    >
                                        <span
                                            className={[
                                                'inline-block h-3 w-3 transform rounded-full bg-background shadow-lg transition-transform',
                                                requireClientApproval
                                                    ? 'translate-x-4.5'
                                                    : 'translate-x-1',
                                            ].join(' ')}
                                        />
                                    </button>
                                </div>
                                <InputError message={undefined} />
                            </div>

                            {requireClientApproval && (
                                <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                                    <Label
                                        htmlFor="client_approval_email"
                                        className="sm:flex-1"
                                    >
                                        Client Approval Email
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <div className="relative flex-1">
                                        <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="client_approval_email"
                                            name="client_approval_email"
                                            type="email"
                                            placeholder="Client Approval Email"
                                            required
                                            className="border-gray-300 pl-9"
                                        />
                                    </div>
                                    <InputError message={undefined} />
                                </div>
                            )}
                        </div>
                    </div>

                    <Divider />

                    {/* Tour Sponsor Section */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                                <Label
                                    htmlFor="tour_sponsor"
                                    className="sm:flex-1"
                                >
                                    Tour Sponsor
                                </Label>
                                <div className="relative flex-1">
                                    <Input
                                        id="tour_sponsor"
                                        name="tour_sponsor"
                                        placeholder="Tour Sponsor"
                                        className="border-gray-300"
                                    />
                                </div>
                                <InputError message={undefined} />
                            </div>
                        </div>
                    </div>

                    <Divider />

                    {/* Special Instructions Section */}
                    <div className="space-y-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                            <Label
                                htmlFor="special_instructions"
                                className="sm:flex-1"
                            >
                                Special Instructions
                            </Label>
                            <div className="relative flex-1">
                                <textarea
                                    id="special_instructions"
                                    name="special_instructions"
                                    placeholder="Special Instructions"
                                    className="flex min-h-28 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-base shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm resize-y"
                                />
                            </div>
                            <InputError message={undefined} />
                        </div>
                    </div>

                    <Divider />

                    {/* Pricing Section */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                                <Label
                                    htmlFor="tv_first_cut"
                                    className="sm:flex-1"
                                >
                                    TV First Cut
                                </Label>
                                <div className="relative flex-1">
                                    <DollarSign className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="tv_first_cut"
                                        name="tv_first_cut"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="TV First Cut"
                                        className="border-gray-300 pl-9"
                                    />
                                </div>
                                <InputError message={undefined} />
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                                <Label
                                    htmlFor="tv_second_cut"
                                    className="sm:flex-1"
                                >
                                    TV Second Cut
                                </Label>
                                <div className="relative flex-1">
                                    <DollarSign className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="tv_second_cut"
                                        name="tv_second_cut"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="TV Second Cut"
                                        className="border-gray-300 pl-9"
                                    />
                                </div>
                                <InputError message={undefined} />
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                                <Label
                                    htmlFor="radio_single_duration"
                                    className="sm:flex-1"
                                >
                                    Radio Single Duration
                                </Label>
                                <div className="relative flex-1">
                                    <DollarSign className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="radio_single_duration"
                                        name="radio_single_duration"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="Radio Single Duration"
                                        className="border-gray-300 pl-9"
                                    />
                                </div>
                                <InputError message={undefined} />
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                                <Label
                                    htmlFor="radio_dual_duration"
                                    className="sm:flex-1"
                                >
                                    Radio Dual Duration
                                </Label>
                                <div className="relative flex-1">
                                    <DollarSign className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="radio_dual_duration"
                                        name="radio_dual_duration"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="Radio Dual Duration"
                                        className="border-gray-300 pl-9"
                                    />
                                </div>
                                <InputError message={undefined} />
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                                <Label htmlFor="key_art" className="sm:flex-1">
                                    Key Art
                                </Label>
                                <div className="relative flex-1">
                                    <DollarSign className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="key_art"
                                        name="key_art"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="Key Art"
                                        className="border-gray-300 pl-9"
                                    />
                                </div>
                                <InputError message={undefined} />
                            </div>
                        </div>
                    </div>

                    <Divider />

                    {/* GTC Department and Representative Section */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                                <Label
                                    htmlFor="gtc_department"
                                    className="sm:flex-1"
                                >
                                    GTC Department
                                    <span className="text-destructive">*</span>
                                </Label>
                                <div className="relative flex-1">
                                    <Select name="gtc_department" required>
                                        <SelectTrigger className="border-gray-300">
                                            <SelectValue placeholder="GTC Department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="russel_treacy">
                                                Russel Treacy
                                            </SelectItem>
                                            <SelectItem value="department_1">
                                                Department 1
                                            </SelectItem>
                                            <SelectItem value="department_2">
                                                Department 2
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <InputError message={undefined} />
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                                <Label
                                    htmlFor="gtc_representative"
                                    className="sm:flex-1"
                                >
                                    GTC Represenitive
                                    <span className="text-destructive">*</span>
                                </Label>
                                <div className="relative flex-1">
                                    <Select name="gtc_representative" required>
                                        <SelectTrigger className="border-gray-300">
                                            <SelectValue placeholder="GTC Represenitive" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="jordan_fenn">
                                                Jordan Fenn
                                            </SelectItem>
                                            <SelectItem value="representative_1">
                                                Representative 1
                                            </SelectItem>
                                            <SelectItem value="representative_2">
                                                Representative 2
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <InputError message={undefined} />
                            </div>
                        </div>
                    </div>

                    <Divider />
                    <DialogFooter className="gap-3 sm:gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-brand-gtc-red">
                            Save Tour
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}


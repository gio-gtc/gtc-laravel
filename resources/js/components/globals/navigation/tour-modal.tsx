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
import { Switch } from '@/components/ui/switch';
import Divider from '@/components/utils/divider';
import DollarInput from '@/components/utils/dollar-input';
import { Calendar, Mail } from 'lucide-react';
import { useState } from 'react';

interface TourModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function TourModal({ isOpen, onClose }: TourModalProps) {
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
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                        <Label htmlFor="tour_name" className="sm:flex-1">
                            Tour Name
                            <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative flex-2">
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

                    {/* Dates Section */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                        <Label htmlFor="start_date" className="sm:flex-1">
                            Start Date
                            <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative flex-2">
                            <Input
                                id="start_date"
                                name="start_date"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                required
                                className="border-gray-300"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    const el = document.getElementById(
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

                    {/* Expire On Sale Now Cuts Options Section */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                        <Label
                            htmlFor="expire_on_sale_now_cuts"
                            className="sm:flex-1"
                        >
                            Expire On Sale Now Cuts
                        </Label>
                        <div className="relative flex-2">
                            <Input
                                id="expire_on_sale_now_cuts"
                                name="expire_on_sale_now_cuts"
                                type="date"
                                value={expireOnSaleNowCuts}
                                onChange={(e) =>
                                    setExpireOnSaleNowCuts(e.target.value)
                                }
                                className="border-gray-300"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    const el = document.getElementById(
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

                    {/* Tour Options Section */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                        <Label
                            htmlFor="voice_over"
                            className="sm:flex-1"
                        ></Label>
                    </div>

                    <div className="flex flex-1 flex-col gap-2 sm:flex-row">
                        <Label className="sm:flex-1">Tour Options</Label>
                        <div className="flex flex-2 flex-col gap-3">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-muted-foreground">
                                    Voice Over
                                </span>
                                <Select name="voice_over">
                                    <SelectTrigger className="border-gray-300">
                                        <SelectValue placeholder="Voice Over" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="gilbert_gottfried">
                                            Gilbert Gottfried
                                        </SelectItem>
                                        <SelectItem value="none">
                                            None
                                        </SelectItem>
                                        <SelectItem value="option_1">
                                            Option 1
                                        </SelectItem>
                                        <SelectItem value="option_2">
                                            Option 2
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={undefined} />
                            </div>
                            <div className="flex gap-1">
                                <Switch
                                    id="hold_all_invoices"
                                    checked={holdAllInvoices}
                                    onCheckedChange={setHoldAllInvoices}
                                />
                                <span>Hold All Invoices</span>
                                <InputError message={undefined} />
                            </div>

                            <div className="flex gap-1">
                                <Switch
                                    id="live_on_ordering_system"
                                    checked={liveOnOrderingSystem}
                                    onCheckedChange={setLiveOnOrderingSystem}
                                />
                                <span>Live On Ordering System</span>
                                <InputError message={undefined} />
                            </div>

                            <div className="flex gap-1">
                                <Switch
                                    id="require_client_approval"
                                    checked={requireClientApproval}
                                    onCheckedChange={setRequireClientApproval}
                                />
                                <span>Require Client Approval</span>
                                <InputError message={undefined} />
                            </div>
                        </div>
                    </div>

                    {requireClientApproval && (
                        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                            <Label
                                htmlFor="client_approval_email"
                                className="sm:flex-1"
                            >
                                Client Approval Email
                                <span className="text-destructive">*</span>
                            </Label>
                            <div className="relative flex-2">
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

                    {/* Tour Sponsor Section */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                        <Label htmlFor="tour_sponsor" className="sm:flex-1">
                            Tour Sponsor
                        </Label>
                        <div className="relative flex-2">
                            <Input
                                id="tour_sponsor"
                                name="tour_sponsor"
                                placeholder="Tour Sponsor"
                                className="border-gray-300"
                            />
                        </div>
                        <InputError message={undefined} />
                    </div>

                    {/* Special Instructions Section */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                        <Label
                            htmlFor="special_instructions"
                            className="sm:flex-1"
                        >
                            Special Instructions
                        </Label>
                        <div className="relative flex-2">
                            <textarea
                                id="special_instructions"
                                name="special_instructions"
                                placeholder="Special Instructions"
                                className="flex min-h-28 w-full resize-y rounded-md border border-gray-300 bg-transparent px-3 py-2 text-base shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm"
                            />
                        </div>
                        <InputError message={undefined} />
                    </div>

                    {/* Pricing Section */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                        <h5 className="sm:flex-1">Price</h5>

                        <div className="relative flex flex-2 flex-col gap-2">
                            <div className="flex max-w-[300px] flex-col justify-between gap-2">
                                <PriceInput
                                    title={'TV First Cut'}
                                    id={'tv_first_cut'}
                                    error={undefined}
                                />

                                <PriceInput
                                    title={'TV Second Cut'}
                                    id={'tv_second_cut'}
                                    error={undefined}
                                />

                                <PriceInput
                                    title={'Radio Single Duration'}
                                    id={'radio_single_duration'}
                                    error={undefined}
                                />

                                <PriceInput
                                    title={'Radio Dual Duration'}
                                    id={'radio_dual_duration'}
                                    error={undefined}
                                />

                                <PriceInput
                                    title={'Key Art'}
                                    id={'key_art'}
                                    error={undefined}
                                />
                            </div>
                        </div>
                    </div>

                    {/* GTC Representative Section */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                        <Label htmlFor="gtc_department" className="sm:flex-1">
                            GTC Department
                            <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative flex-2">
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

                    {/* GTC Representative Section */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                        <Label
                            htmlFor="gtc_representative"
                            className="sm:flex-1"
                        >
                            GTC Represenitive
                            <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative flex-2">
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

function PriceInput({
    title,
    id,
    error,
}: {
    title: string;
    id: string;
    error: string | undefined;
}) {
    return (
        <>
            <div className="flex items-center justify-between gap-2">
                <Label htmlFor={id}>{title}</Label>
                <DollarInput id={id} containerClassNames="max-w-20" />
            </div>
            <InputError message={error} />
        </>
    );
}

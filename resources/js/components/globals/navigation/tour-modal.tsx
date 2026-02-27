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
import { Textarea } from '@/components/ui/textarea';
import {
    ColumnedRowsChild,
    ColumnedRowsParent,
} from '@/components/utils/column-row-layouts';
import DatePickerInput from '@/components/utils/date-picker-input';
import Divider from '@/components/utils/divider';
import DollarInput from '@/components/utils/dollar-input';
import { Mail } from 'lucide-react';
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
                    <ColumnedRowsParent>
                        <ColumnedRowsChild
                            labelFor="tour_name"
                            labelContent="Tour Name"
                            required
                        >
                            <Input
                                id="tour_name"
                                name="tour_name"
                                placeholder="Tour Name"
                                required
                            />
                            <InputError message={undefined} />
                        </ColumnedRowsChild>

                        <ColumnedRowsChild
                            labelFor="start_date"
                            labelContent="Start Date"
                            required
                        >
                            <DatePickerInput
                                id="start_date"
                                label=""
                                value={startDate}
                                required
                                onChange={(value) => setStartDate(value)}
                            />
                            <InputError message={undefined} />
                        </ColumnedRowsChild>

                        <ColumnedRowsChild
                            labelFor="expire_on_sale_now_cuts"
                            labelContent="Expire On Sale Now Cuts"
                        >
                            <DatePickerInput
                                id="expire_on_sale_now_cuts"
                                label=""
                                value={expireOnSaleNowCuts}
                                required
                                onChange={(value) =>
                                    setExpireOnSaleNowCuts(value)
                                }
                            />
                            <InputError message={undefined} />
                        </ColumnedRowsChild>
                    </ColumnedRowsParent>

                    {/* Tour Options Section */}
                    <div className="flex flex-1 flex-col gap-2 sm:flex-row">
                        <Label className="sm:flex-1">Tour Options</Label>
                        <div className="flex flex-2 flex-col gap-3">
                            <div className="flex flex-col gap-1">
                                <span className="xs-gray-700-weight-500">
                                    Voice Over
                                </span>
                                <Select name="voice_over">
                                    <SelectTrigger>
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
                                <Label
                                    htmlFor="hold_all_invoices"
                                    className="sm-gray-700-weight-500"
                                >
                                    Hold All Invoices
                                </Label>
                                <InputError message={undefined} />
                            </div>

                            <div className="flex gap-1">
                                <Switch
                                    id="live_on_ordering_system"
                                    checked={liveOnOrderingSystem}
                                    onCheckedChange={setLiveOnOrderingSystem}
                                />
                                <Label
                                    htmlFor="live_on_ordering_system"
                                    className="sm-gray-700-weight-500"
                                >
                                    Live On Ordering System
                                </Label>
                                <InputError message={undefined} />
                            </div>

                            <div className="flex gap-1">
                                <Switch
                                    id="require_client_approval"
                                    checked={requireClientApproval}
                                    onCheckedChange={setRequireClientApproval}
                                />
                                <Label
                                    htmlFor="require_client_approval"
                                    className="sm-gray-700-weight-500"
                                >
                                    Require Client Approval
                                </Label>
                                <InputError message={undefined} />
                            </div>
                        </div>
                    </div>

                    {requireClientApproval && (
                        <ColumnedRowsParent>
                            <ColumnedRowsChild
                                labelFor="client_approval_email"
                                labelContent="Client Approval Email"
                                required
                            >
                                <div className="relative">
                                    <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="client_approval_email"
                                        name="client_approval_email"
                                        type="email"
                                        placeholder="Client Approval Email"
                                        required
                                        className="pl-9"
                                    />
                                </div>
                                <InputError message={undefined} />
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
                            />
                            <InputError message={undefined} />
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
                            />
                            <InputError message={undefined} />
                        </ColumnedRowsChild>
                    </ColumnedRowsParent>

                    {/* Pricing Section */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                        <Label className="sm:flex-1">Price</Label>

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

                    <ColumnedRowsParent>
                        <ColumnedRowsChild
                            labelFor="gtc_department"
                            labelContent="GTC Department"
                            required
                        >
                            <Select name="gtc_department" required>
                                <SelectTrigger>
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
                            <InputError message={undefined} />
                        </ColumnedRowsChild>

                        <ColumnedRowsChild
                            labelFor="gtc_representative"
                            labelContent="GTC Represenitive"
                            required
                        >
                            <Select name="gtc_representative" required>
                                <SelectTrigger>
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
                            <InputError message={undefined} />
                        </ColumnedRowsChild>
                    </ColumnedRowsParent>

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
                <Label htmlFor={id} className="sm-black-weight-400">
                    {title}
                </Label>
                <DollarInput id={id} containerClassNames="max-w-20" />
            </div>
            <InputError message={error} />
        </>
    );
}

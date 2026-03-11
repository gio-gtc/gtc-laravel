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
import {
    ColumnedRowsChild,
    ColumnedRowsParent,
} from '@/components/utils/column-row-layouts';
import Divider from '@/components/utils/divider';
import DollarInput from '@/components/utils/dollar-input';
import InputAdditions from '@/components/utils/input-additions';
import { User } from 'lucide-react';
import { useState } from 'react';

interface OrganizationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function OrganizationModal({
    isOpen,
    onClose,
}: OrganizationModalProps) {
    const [apEmails, setApEmails] = useState<string[]>(['']);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // TODO: Connect to backend when ready
        console.log('Form submitted');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="overflow-y-auto sm:max-w-[800px]">
                <DialogHeader>
                    <DialogTitle>Organization Information</DialogTitle>
                </DialogHeader>

                <Divider />

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Organization Information Section */}
                    <ColumnedRowsParent>
                        <ColumnedRowsChild
                            labelFor="organization_name"
                            labelContent="Organization Name"
                            childrenContainerClasses="modal-child-container"
                            required
                        >
                            <Input
                                id="organization_name"
                                name="organization_name"
                                placeholder="Enter Organization Name"
                                required
                            />
                            <InputError message={undefined} />
                        </ColumnedRowsChild>

                        <ColumnedRowsChild
                            labelFor="organization_type"
                            labelContent="Organization Type"
                            childrenContainerClasses="modal-child-container"
                            required
                        >
                            <Select name="organization_type" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Organization Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="corporation">
                                        Corporation
                                    </SelectItem>
                                    <SelectItem value="llc">LLC</SelectItem>
                                    <SelectItem value="partnership">
                                        Partnership
                                    </SelectItem>
                                    <SelectItem value="sole_proprietorship">
                                        Sole Proprietorship
                                    </SelectItem>
                                    <SelectItem value="nonprofit">
                                        Nonprofit
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={undefined} />
                        </ColumnedRowsChild>
                    </ColumnedRowsParent>

                    <Divider />
                    {/* Address Section */}
                    <ColumnedRowsParent>
                        <ColumnedRowsChild
                            labelFor="street_address"
                            labelContent="Address"
                            childrenContainerClasses="modal-child-container"
                            required
                            multiInput
                        >
                            <Input
                                id="street_address"
                                name="street_address"
                                placeholder="Street Address"
                                required
                            />
                            <div className="flex gap-2">
                                <Input
                                    id="city"
                                    name="city"
                                    placeholder="City"
                                    required
                                    className="flex-[2]"
                                />
                                <Input
                                    id="state"
                                    name="state"
                                    placeholder="State"
                                    required
                                    className="flex-1"
                                />
                                <Input
                                    id="zip"
                                    name="zip"
                                    placeholder="ZIP"
                                    required
                                    className="flex-1"
                                />
                            </div>
                            <Select name="country" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Country" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="us">
                                        United States
                                    </SelectItem>
                                    <SelectItem value="uk">
                                        United Kingdom
                                    </SelectItem>
                                    <SelectItem value="ie">Ireland</SelectItem>
                                    <SelectItem value="ca">Canada</SelectItem>
                                    <SelectItem value="au">
                                        Australia
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={undefined} />
                        </ColumnedRowsChild>
                    </ColumnedRowsParent>

                    <Divider />
                    {/* Financial Details Section */}
                    <ColumnedRowsParent>
                        <ColumnedRowsChild
                            labelFor="credit_limit"
                            labelContent="Credit Limit"
                            subLabelContent="In US Dollars"
                            childrenContainerClasses="modal-child-container"
                            required
                        >
                            <DollarInput
                                id="credit_limit"
                                containerClassNames="flex-1"
                                placeholder="Enter Credit Limit"
                            />
                            <InputError message={undefined} />
                        </ColumnedRowsChild>

                        <ColumnedRowsChild
                            labelFor="credit_terms"
                            labelContent="Credit Terms"
                            subLabelContent="Number of days"
                            childrenContainerClasses="modal-child-container"
                            required
                        >
                            <Input
                                id="credit_terms"
                                name="credit_terms"
                                min="0"
                                type="number"
                                placeholder="Enter Terms"
                                required
                            />
                            <InputError message={undefined} />
                        </ColumnedRowsChild>

                        <ColumnedRowsChild
                            labelFor="preferred_currency"
                            labelContent="Preferred Currency"
                            childrenContainerClasses="modal-child-container"
                            required
                        >
                            <Select name="preferred_currency" required>
                                <SelectTrigger>
                                    <SelectValue
                                        placeholder="Select Currency (default USD)"
                                        defaultValue="usd"
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="usd">USD</SelectItem>
                                    <SelectItem value="eur">EUR</SelectItem>
                                    <SelectItem value="gbp">GBP</SelectItem>
                                    <SelectItem value="cad">CAD</SelectItem>
                                    <SelectItem value="aud">AUD</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={undefined} />
                        </ColumnedRowsChild>
                    </ColumnedRowsParent>

                    <Divider />
                    {/* Accounts Payable Section */}
                    <ColumnedRowsParent>
                        <ColumnedRowsChild
                            labelFor="ap_email"
                            labelContent="Accounts Payable Email"
                            childrenContainerClasses="modal-child-container"
                            required
                            multiInput
                        >
                            <InputAdditions
                                inputList={apEmails}
                                setInputList={setApEmails}
                            />
                            <InputError message={undefined} />
                        </ColumnedRowsChild>

                        <ColumnedRowsChild
                            labelFor="ap_contact"
                            labelContent="Accounts Payable Contact"
                            childrenContainerClasses="modal-child-container"
                        >
                            <div className="relative">
                                <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="ap_contact"
                                    name="ap_contact"
                                    placeholder="Contact Name"
                                    className="pl-9"
                                />
                            </div>
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
                        <Button type="submit">Save</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

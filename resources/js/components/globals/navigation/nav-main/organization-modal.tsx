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
    const [arEmails, setArEmails] = useState<string[]>(['']);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // TODO: Connect to backend when ready
        console.log('Form submitted');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Organization Information</DialogTitle>
                </DialogHeader>

                <Divider />

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Organization Information Section */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                        <Label
                            htmlFor="organization_name"
                            className="sm:flex-1"
                        >
                            Organization Name
                            <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative flex-1">
                            <Input
                                id="organization_name"
                                name="organization_name"
                                placeholder="Enter Organization Name"
                                required
                                className="border-gray-300"
                            />
                        </div>
                        <InputError message={undefined} />
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                        <Label
                            htmlFor="organization_type"
                            className="sm:flex-1"
                        >
                            Organization Type{' '}
                            <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative flex-1">
                            <Select name="organization_type" required>
                                <SelectTrigger className="border-gray-300">
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
                        </div>
                        <InputError message={undefined} />
                    </div>

                    <Divider />
                    {/* Address Section */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                        <Label htmlFor="address" className="sm:flex-1">
                            Address
                            <span className="text-destructive">*</span>
                        </Label>
                        <div className="flex flex-1 flex-col gap-4">
                            <Input
                                id="street_address"
                                name="street_address"
                                placeholder="Street Address"
                                required
                                className="border-gray-300"
                            />
                            <div className="flex gap-2">
                                <Input
                                    id="city"
                                    name="city"
                                    placeholder="City"
                                    required
                                    className="flex-[2] border-gray-300"
                                />
                                <Input
                                    id="state"
                                    name="state"
                                    placeholder="State"
                                    required
                                    className="flex-1 border-gray-300"
                                />
                                <Input
                                    id="zip"
                                    name="zip"
                                    placeholder="ZIP"
                                    required
                                    className="flex-1 border-gray-300"
                                />
                            </div>
                            <Select name="country" required>
                                <SelectTrigger className="border-gray-300">
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
                        </div>
                        <InputError message={undefined} />
                    </div>

                    <Divider />
                    {/* Financial Details Section */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                        <Label htmlFor="credit_limit" className="sm:flex-1">
                            Credit Limit
                            <span className="text-destructive">*</span>
                            <span className="block text-xs font-normal text-muted-foreground">
                                In US Dollars
                            </span>
                        </Label>
                        <DollarInput
                            id={'credit_limit'}
                            containerClassNames="flex-1"
                            placeholder="Enter Credit Limit"
                        />
                        <InputError message={undefined} />
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                        <Label className="sm:flex-1" htmlFor="credit_terms">
                            Credit Terms
                            <span className="text-destructive">*</span>
                            <span className="block text-xs font-normal text-muted-foreground">
                                Number of days
                            </span>
                        </Label>
                        <div className="relative flex-1">
                            <Input
                                id="credit_terms"
                                name="credit_terms"
                                min="0"
                                type="number"
                                placeholder="Enter Terms"
                                required
                                className="border-gray-300"
                            />
                        </div>
                        <InputError message={undefined} />
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                        <Label
                            className="sm:flex-1"
                            htmlFor="preferred_currency"
                        >
                            Preferred Currency
                            <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative flex-1">
                            <Select name="preferred_currency" required>
                                <SelectTrigger className="border-gray-300">
                                    <SelectValue
                                        placeholder="USD"
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
                        </div>
                        <InputError message={undefined} />
                    </div>

                    <Divider />
                    {/* Accounts Payable Section */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                        <Label className="sm:flex-1" htmlFor="ap_email">
                            Accounts Payable Email
                            <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative flex flex-1 flex-col gap-1">
                            <InputAdditions
                                inputList={apEmails}
                                setInputList={setApEmails}
                            />
                        </div>
                        <InputError message={undefined} />
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                        <Label className="sm:flex-1" htmlFor="ap_contact">
                            Accounts Payable Contact
                        </Label>
                        <div className="relative flex-1">
                            <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="ap_contact"
                                name="ap_contact"
                                placeholder="Contact Name"
                                className="border-gray-300 pl-9"
                            />
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
                            Save
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

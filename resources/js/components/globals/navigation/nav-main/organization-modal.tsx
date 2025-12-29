import Divider from '@/components/globals/utils/divider';
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
import {
    Clock,
    DollarSign,
    Globe,
    Mail,
    Phone,
    Plus,
    User,
    X,
} from 'lucide-react';
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

    const addApEmail = () => {
        setApEmails([...apEmails, '']);
    };

    const removeApEmail = (index: number) => {
        if (apEmails.length > 1) {
            setApEmails(apEmails.filter((_, i) => i !== index));
        }
    };

    const addArEmail = () => {
        setArEmails([...arEmails, '']);
    };

    const removeArEmail = (index: number) => {
        if (arEmails.length > 1) {
            setArEmails(arEmails.filter((_, i) => i !== index));
        }
    };

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

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="organization_name">
                                    Organization Name
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="organization_name"
                                    name="organization_name"
                                    placeholder="Enter Organization Name"
                                    required
                                    className="border-gray-300"
                                />
                                <InputError message={undefined} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="organization_type">
                                    Organization Type{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
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
                                <InputError message={undefined} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="vat_tax_id">
                                    VAT, Tax ID, or EIN
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="vat_tax_id"
                                    name="vat_tax_id"
                                    placeholder="XX-XXXXXXXXX"
                                    required
                                    className="border-gray-300"
                                />
                                <InputError message={undefined} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="website">
                                    Website{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <div className="relative">
                                    <Globe className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="website"
                                        name="website"
                                        type="url"
                                        placeholder="https://www.company.com"
                                        required
                                        className="border-gray-300 pl-9"
                                    />
                                </div>
                                <InputError message={undefined} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="phone_number">
                                    Phone Number
                                    <span className="text-destructive">*</span>
                                </Label>
                                <div className="relative">
                                    <Phone className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="phone_number"
                                        name="phone_number"
                                        type="tel"
                                        placeholder="(555) 124-4566"
                                        required
                                        className="border-gray-300 pl-9"
                                    />
                                </div>
                                <InputError message={undefined} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="clock_prefix">
                                    UK/IRE Clock Prefix
                                </Label>
                                <div className="relative">
                                    <Clock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="clock_prefix"
                                        name="clock_prefix"
                                        placeholder="GMT"
                                        className="border-gray-300 pl-9"
                                    />
                                </div>
                                <InputError message={undefined} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="address">
                                Address
                                <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="street_address"
                                name="street_address"
                                placeholder="Street Address"
                                required
                                className="mb-2 border-gray-300"
                            />
                            <div className="grid grid-cols-1 gap-4">
                                <Input
                                    id="city"
                                    name="city"
                                    placeholder="City"
                                    required
                                    className="border-gray-300"
                                />
                                <Input
                                    id="state"
                                    name="state"
                                    placeholder="State"
                                    required
                                    className="border-gray-300"
                                />
                                <Input
                                    id="zip"
                                    name="zip"
                                    placeholder="ZIP"
                                    required
                                    className="border-gray-300"
                                />
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
                                        <SelectItem value="ie">
                                            Ireland
                                        </SelectItem>
                                        <SelectItem value="ca">
                                            Canada
                                        </SelectItem>
                                        <SelectItem value="au">
                                            Australia
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <InputError message={undefined} />
                        </div>
                    </div>

                    {/* Financial Details Section */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="credit_limit">
                                    Credit Limit{' '}
                                    <span className="text-destructive">*</span>
                                    <span className="block text-xs font-normal text-muted-foreground">
                                        In US Dollars
                                    </span>
                                </Label>
                                <div className="relative">
                                    <DollarSign className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="credit_limit"
                                        name="credit_limit"
                                        type="number"
                                        placeholder="Enter Credit Limit"
                                        required
                                        className="border-gray-300 pl-9"
                                    />
                                </div>
                                <InputError message={undefined} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="credit_terms">
                                    Credit Terms{' '}
                                    <span className="text-destructive">*</span>
                                    <span className="block text-xs font-normal text-muted-foreground">
                                        Number of days
                                    </span>
                                </Label>
                                <Input
                                    id="credit_terms"
                                    name="credit_terms"
                                    type="number"
                                    placeholder="Enter Terms"
                                    required
                                    className="border-gray-300"
                                />
                                <InputError message={undefined} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="preferred_currency">
                                    Preferred Currency{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Select name="preferred_currency" required>
                                    <SelectTrigger className="border-gray-300">
                                        <SelectValue placeholder="Select Currency" />
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
                            </div>
                        </div>
                    </div>

                    {/* Accounts Payable Section */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="ap_email">
                                    Accounts Payable Email{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                {apEmails.map((email, index) => (
                                    <div
                                        key={index}
                                        className="flex items-start gap-2"
                                    >
                                        <div className="relative flex-1">
                                            <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                id={`ap_email_${index}`}
                                                name={`ap_email_${index}`}
                                                type="email"
                                                placeholder="email@company.com"
                                                required={index === 0}
                                                className="border-gray-300 pr-9 pl-9"
                                            />
                                            {index === apEmails.length - 1 && (
                                                <button
                                                    type="button"
                                                    onClick={addApEmail}
                                                    className="absolute top-1/2 right-3 -translate-y-1/2 text-destructive hover:text-destructive/80"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                            )}
                                            {apEmails.length > 1 &&
                                                index !==
                                                    apEmails.length - 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeApEmail(index)
                                                        }
                                                        className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                )}
                                        </div>
                                    </div>
                                ))}
                                <InputError message={undefined} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="ap_contact">
                                    Accounts Payable Contact
                                </Label>
                                <div className="relative">
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
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="ap_phone">
                                Accounts Payable Phone Number
                            </Label>
                            <div className="relative">
                                <Phone className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="ap_phone"
                                    name="ap_phone"
                                    type="tel"
                                    placeholder="(555) 124-4566"
                                    className="border-gray-300 pl-9"
                                />
                            </div>
                            <InputError message={undefined} />
                        </div>
                    </div>

                    {/* Accounts Receivable Section */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="ar_email">
                                    Accounts Receivable Email
                                    <span className="text-destructive">*</span>
                                </Label>
                                {arEmails.map((email, index) => (
                                    <div
                                        key={index}
                                        className="flex items-start gap-2"
                                    >
                                        <div className="relative flex-1">
                                            <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                id={`ar_email_${index}`}
                                                name={`ar_email_${index}`}
                                                type="email"
                                                placeholder="email@company.com"
                                                required={index === 0}
                                                className="border-gray-300 pr-9 pl-9"
                                            />
                                            {index === arEmails.length - 1 && (
                                                <button
                                                    type="button"
                                                    onClick={addArEmail}
                                                    className="absolute top-1/2 right-3 -translate-y-1/2 text-destructive hover:text-destructive/80"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                            )}
                                            {arEmails.length > 1 &&
                                                index !==
                                                    arEmails.length - 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeArEmail(index)
                                                        }
                                                        className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                )}
                                        </div>
                                    </div>
                                ))}
                                <InputError message={undefined} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="ar_contact">
                                    Accounts Receivable Contact
                                </Label>
                                <div className="relative">
                                    <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="ar_contact"
                                        name="ar_contact"
                                        placeholder="Contact Name"
                                        className="border-gray-300 pl-9"
                                    />
                                </div>
                                <InputError message={undefined} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="ar_phone">
                                Accounts Receivable Phone Number
                            </Label>
                            <div className="relative">
                                <Phone className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="ar_phone"
                                    name="ar_phone"
                                    type="tel"
                                    placeholder="(555) 124-4566"
                                    className="border-gray-300 pl-9"
                                />
                            </div>
                            <InputError message={undefined} />
                        </div>
                    </div>

                    {/* Bank Information Section */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="bank_account_number">
                                    Bank Account Number{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="bank_account_number"
                                    name="bank_account_number"
                                    placeholder="Enter Account Number"
                                    required
                                    className="border-gray-300"
                                />
                                <InputError message={undefined} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="bank_routing_number">
                                    Bank Routing Number{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="bank_routing_number"
                                    name="bank_routing_number"
                                    placeholder="Enter Routing Number"
                                    required
                                    className="border-gray-300"
                                />
                                <InputError message={undefined} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="bank_preferred_currency">
                                    Preferred Currency{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Select name="bank_preferred_currency" required>
                                    <SelectTrigger className="border-gray-300">
                                        <SelectValue placeholder="Select currency" />
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
                            </div>
                        </div>
                    </div>

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

import { countriesData } from '@/components/mockdata';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ColumnedRowsParent, RowsColumnedChild } from './layout';

interface AddressFormData {
    name: string;
    billing_address: string;
    city: string;
    state: string;
    zip: string;
    country_id: string;
}

interface InvoiceAddressFormProps {
    formData: AddressFormData;
    onChange: (field: keyof AddressFormData, value: string) => void;
}

export default function InvoiceAddressForm({
    formData,
    onChange,
}: InvoiceAddressFormProps) {
    return (
        <ColumnedRowsParent>
            <RowsColumnedChild>
                <Label htmlFor="name" className="pt-2">
                    Company Name
                </Label>
                <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => onChange('name', e.target.value)}
                />
            </RowsColumnedChild>

            <RowsColumnedChild>
                <Label htmlFor="billing_address" className="pt-2">
                    Billing Address
                </Label>
                <textarea
                    id="billing_address"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.billing_address}
                    onChange={(e) =>
                        onChange('billing_address', e.target.value)
                    }
                    rows={3}
                />
            </RowsColumnedChild>

            <RowsColumnedChild>
                <Label htmlFor="city" className="pt-2">
                    City
                </Label>
                <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => onChange('city', e.target.value)}
                />
            </RowsColumnedChild>

            <RowsColumnedChild>
                <Label htmlFor="state" className="pt-2">
                    State/Province
                </Label>
                <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => onChange('state', e.target.value)}
                />
            </RowsColumnedChild>

            <RowsColumnedChild>
                <Label htmlFor="zip" className="pt-2">
                    ZIP/Postal Code
                </Label>
                <Input
                    id="zip"
                    value={formData.zip}
                    onChange={(e) => onChange('zip', e.target.value)}
                />
            </RowsColumnedChild>

            <RowsColumnedChild>
                <Label htmlFor="country_id" className="pt-2">
                    Country
                </Label>
                <Select
                    value={formData.country_id}
                    onValueChange={(value) => onChange('country_id', value)}
                >
                    <SelectTrigger id="country_id">
                        <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                        {countriesData.map((country) => (
                            <SelectItem
                                key={country.id}
                                value={country.id.toString()}
                            >
                                {country.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </RowsColumnedChild>
        </ColumnedRowsParent>
    );
}

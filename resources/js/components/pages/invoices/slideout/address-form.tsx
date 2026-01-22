import { countriesData } from '@/components/mockdata';
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
            <ColumnedRowsChild labelFor="name" labelContent="Company Name">
                <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => onChange('name', e.target.value)}
                />
            </ColumnedRowsChild>

            <ColumnedRowsChild
                labelFor="billing_address"
                labelContent="Billing Address"
            >
                <textarea
                    id="billing_address"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.billing_address}
                    onChange={(e) =>
                        onChange('billing_address', e.target.value)
                    }
                    rows={3}
                />
            </ColumnedRowsChild>

            <ColumnedRowsChild labelFor="city" labelContent="City">
                <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => onChange('city', e.target.value)}
                />
            </ColumnedRowsChild>

            <ColumnedRowsChild labelFor="state" labelContent="State/Province">
                <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => onChange('state', e.target.value)}
                />
            </ColumnedRowsChild>

            <ColumnedRowsChild labelFor="zip" labelContent="ZIP/Postal Code">
                <Input
                    id="zip"
                    value={formData.zip}
                    onChange={(e) => onChange('zip', e.target.value)}
                />
            </ColumnedRowsChild>

            <ColumnedRowsChild labelFor="country_id" labelContent="Country">
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
            </ColumnedRowsChild>
        </ColumnedRowsParent>
    );
}

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
import { type Country } from '@/types';

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
    countries: Country[];
}

export default function InvoiceAddressForm({
    formData,
    onChange,
    countries,
}: InvoiceAddressFormProps) {
    return (
        <ColumnedRowsParent>
            <ColumnedRowsChild
                labelFor="name"
                labelContent="Organisation Name"
                labelLocation="other"
            >
                <Input
                    id="name"
                    variant="invoiceSlideout"
                    value={formData.name}
                    onChange={(e) => onChange('name', e.target.value)}
                />
            </ColumnedRowsChild>

            <ColumnedRowsChild
                labelFor="billing_address"
                labelContent="Billing Address"
                labelLocation="other"
            >
                <Textarea
                    id="billing_address"
                    variant="invoiceSlideout"
                    value={formData.billing_address}
                    onChange={(e) =>
                        onChange('billing_address', e.target.value)
                    }
                    rows={3}
                />
            </ColumnedRowsChild>

            <ColumnedRowsChild
                labelFor="city"
                labelContent="City"
                labelLocation="other"
            >
                <Input
                    id="city"
                    variant="invoiceSlideout"
                    value={formData.city}
                    onChange={(e) => onChange('city', e.target.value)}
                />
            </ColumnedRowsChild>

            <ColumnedRowsChild
                labelFor="state"
                labelContent="State/Province"
                labelLocation="other"
            >
                <Input
                    id="state"
                    variant="invoiceSlideout"
                    value={formData.state}
                    onChange={(e) => onChange('state', e.target.value)}
                />
            </ColumnedRowsChild>

            <ColumnedRowsChild
                labelFor="zip"
                labelContent="ZIP/Postal Code"
                labelLocation="other"
            >
                <Input
                    id="zip"
                    variant="invoiceSlideout"
                    value={formData.zip}
                    onChange={(e) => onChange('zip', e.target.value)}
                />
            </ColumnedRowsChild>

            <ColumnedRowsChild
                labelFor="country_id"
                labelContent="Country"
                labelLocation="other"
            >
                <Select
                    value={formData.country_id}
                    onValueChange={(value) => onChange('country_id', value)}
                >
                    <SelectTrigger id="country_id" variant="invoiceSlideout">
                        <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                        {countries.map((country) => (
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

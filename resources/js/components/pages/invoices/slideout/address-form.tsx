import { countriesData } from '@/components/mockdata';
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
            <ColumnedRowsChild
                labelFor="name"
                labelContent="Company Name"
                labelLocation="other"
            >
                <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => onChange('name', e.target.value)}
                    className="xs-gray-700-weight-600"
                />
            </ColumnedRowsChild>

            <ColumnedRowsChild
                labelFor="billing_address"
                labelContent="Billing Address"
                labelLocation="other"
            >
                <Textarea
                    id="billing_address"
                    value={formData.billing_address}
                    onChange={(e) =>
                        onChange('billing_address', e.target.value)
                    }
                    rows={3}
                    className="xs-gray-700-weight-600"
                />
            </ColumnedRowsChild>

            <ColumnedRowsChild
                labelFor="city"
                labelContent="City"
                labelLocation="other"
            >
                <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => onChange('city', e.target.value)}
                    className="xs-gray-700-weight-600"
                />
            </ColumnedRowsChild>

            <ColumnedRowsChild
                labelFor="state"
                labelContent="State/Province"
                labelLocation="other"
            >
                <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => onChange('state', e.target.value)}
                    className="xs-gray-700-weight-600"
                />
            </ColumnedRowsChild>

            <ColumnedRowsChild
                labelFor="zip"
                labelContent="ZIP/Postal Code"
                labelLocation="other"
            >
                <Input
                    id="zip"
                    value={formData.zip}
                    onChange={(e) => onChange('zip', e.target.value)}
                    className="xs-gray-700-weight-600"
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
                    <SelectTrigger
                        id="country_id"
                        className="xs-gray-700-weight-600"
                    >
                        <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                        {countriesData.map((country) => (
                            <SelectItem
                                key={country.id}
                                value={country.id.toString()}
                                className="xs-gray-700-weight-600"
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

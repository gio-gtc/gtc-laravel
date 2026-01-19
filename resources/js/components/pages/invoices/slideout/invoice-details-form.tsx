import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type User } from '@/types';
import DatePickerInput from './date-picker-input';
import { ColumnedRowsParent, RowsColumnedChild } from './layout';

interface InvoiceDetailsFormData {
    release_date: string;
    payment_due: string;
    clientReference: string;
}

interface InvoiceDetailsFormProps {
    formData: InvoiceDetailsFormData;
    onChange: (field: keyof InvoiceDetailsFormData, value: string) => void;
    orderedByUser: User | undefined;
}

export default function InvoiceDetailsForm({
    formData,
    onChange,
    orderedByUser,
}: InvoiceDetailsFormProps) {
    return (
        <ColumnedRowsParent>
            <RowsColumnedChild>
                <Label htmlFor="release_date">Invoice Release Date</Label>
                <DatePickerInput
                    id="release_date"
                    label=""
                    value={formData.release_date}
                    onChange={(value) => onChange('release_date', value)}
                />
            </RowsColumnedChild>

            <RowsColumnedChild>
                <Label htmlFor="payment_due">Invoice Due Date</Label>
                <DatePickerInput
                    id="payment_due"
                    label=""
                    value={formData.payment_due}
                    onChange={(value) => onChange('payment_due', value)}
                />
            </RowsColumnedChild>

            <RowsColumnedChild>
                <Label htmlFor="clientReference">Client Reference</Label>
                <Input
                    id="clientReference"
                    value={formData.clientReference}
                    onChange={(e) =>
                        onChange('clientReference', e.target.value)
                    }
                />
            </RowsColumnedChild>

            <RowsColumnedChild>
                <Label htmlFor="orderedBy">Ordered By</Label>
                <Input
                    id="orderedBy"
                    value={orderedByUser?.name || ''}
                    readOnly
                    className="bg-muted"
                />
            </RowsColumnedChild>
        </ColumnedRowsParent>
    );
}

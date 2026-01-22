import { Input } from '@/components/ui/input';
import {
    ColumnedRowsChild,
    ColumnedRowsParent,
} from '@/components/utils/column-row-layouts';
import { type User } from '@/types';
import DatePickerInput from './date-picker-input';

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
            <ColumnedRowsChild
                labelFor="release_date"
                labelContent="Invoice Release Date"
            >
                <DatePickerInput
                    id="release_date"
                    label=""
                    value={formData.release_date}
                    onChange={(value) => onChange('release_date', value)}
                />
            </ColumnedRowsChild>

            <ColumnedRowsChild
                labelFor="payment_due"
                labelContent="Invoice Due Date"
            >
                <DatePickerInput
                    id="payment_due"
                    label=""
                    value={formData.payment_due}
                    onChange={(value) => onChange('payment_due', value)}
                />
            </ColumnedRowsChild>

            <ColumnedRowsChild
                labelFor="clientReference"
                labelContent="Client Reference"
            >
                <Input
                    id="clientReference"
                    value={formData.clientReference}
                    onChange={(e) =>
                        onChange('clientReference', e.target.value)
                    }
                />
            </ColumnedRowsChild>

            <ColumnedRowsChild labelFor="orderedBy" labelContent="Ordered By">
                <Input
                    id="orderedBy"
                    value={orderedByUser?.name || ''}
                    readOnly
                    className="bg-muted"
                />
            </ColumnedRowsChild>
        </ColumnedRowsParent>
    );
}

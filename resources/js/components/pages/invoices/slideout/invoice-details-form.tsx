import { Input } from '@/components/ui/input';
import {
    ColumnedRowsChild,
    ColumnedRowsParent,
} from '@/components/utils/column-row-layouts';
import DatePickerInput from '@/components/utils/date-picker-input';
import InputAdditions from '@/components/utils/input-additions';
import { type User } from '@/types';
import { Mail } from 'lucide-react';

interface InvoiceDetailsFormData {
    release_date: string;
    payment_due: string;
    clientReference: string;
    accountPayableEmail: string;
    additionalEmails: string[];
}

interface InvoiceDetailsFormProps {
    formData: InvoiceDetailsFormData;
    onChange: (
        field: keyof InvoiceDetailsFormData,
        value: string | string[],
    ) => void;
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
                labelLocation="other"
            >
                <DatePickerInput
                    id="release_date"
                    label=""
                    value={formData.release_date}
                    onChange={(value) => onChange('release_date', value)}
                    className="max-w-[140px]"
                    inputClassName="xs-gray-700-weight-600"
                />
            </ColumnedRowsChild>

            <ColumnedRowsChild
                labelFor="payment_due"
                labelContent="Invoice Due Date"
                labelLocation="other"
            >
                <DatePickerInput
                    id="payment_due"
                    label=""
                    value={formData.payment_due}
                    onChange={(value) => onChange('payment_due', value)}
                    className="max-w-[140px]"
                    inputClassName="xs-gray-700-weight-600"
                />
            </ColumnedRowsChild>

            <ColumnedRowsChild
                labelFor="clientReference"
                labelContent="Client Reference"
                labelLocation="other"
            >
                <Input
                    id="clientReference"
                    value={formData.clientReference}
                    onChange={(e) =>
                        onChange('clientReference', e.target.value)
                    }
                    className="xs-gray-700-weight-600"
                />
            </ColumnedRowsChild>

            <ColumnedRowsChild
                labelFor="orderedBy"
                labelContent="Ordered By"
                labelLocation="other"
            >
                <Input
                    id="orderedBy"
                    value={orderedByUser?.name || ''}
                    disabled
                    readOnly
                    className="xs-gray-700-weight-600"
                />
            </ColumnedRowsChild>

            <ColumnedRowsChild
                labelFor="accountPayableEmail"
                labelContent="Account Payable Email"
                labelLocation="other"
            >
                <div className="relative">
                    <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        id="accountPayableEmail"
                        type="email"
                        placeholder="email@company.com"
                        value={formData.accountPayableEmail}
                        onChange={(e) =>
                            onChange('accountPayableEmail', e.target.value)
                        }
                        className="xs-gray-700-weight-600 pl-9"
                    />
                </div>
            </ColumnedRowsChild>

            <ColumnedRowsChild
                labelFor="additionalEmails"
                labelContent="Additional Emails"
                labelLocation="other"
                multiInput
            >
                <InputAdditions
                    inputList={formData.additionalEmails}
                    setInputList={(newList) =>
                        onChange('additionalEmails', newList)
                    }
                />
            </ColumnedRowsChild>
        </ColumnedRowsParent>
    );
}

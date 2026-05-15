import { Input } from '@/components/ui/input';
import { DollarSign } from 'lucide-react';
import * as React from 'react';

type DollarInputProps = {
    id: string;
    name?: string;
    placeholder?: string;
    containerClassNames?: string;
    value?: string;
    onChangeValue?: (value: string) => void;
};

export default function DollarInput({
    id,
    name,
    placeholder,
    containerClassNames,
    value,
    onChangeValue,
}: DollarInputProps) {
    const [draft, setDraft] = React.useState('');
    const isControlled =
        typeof value !== 'undefined' && typeof onChangeValue !== 'undefined';

    const displayValue = isControlled ? value : draft;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        const regex = /^\d*\.?\d{0,2}$/;

        if (!regex.test(inputValue)) {
            return;
        }

        if (isControlled) {
            onChangeValue?.(inputValue);
        } else {
            setDraft(inputValue);
        }
    };

    return (
        <div className={`relative ${containerClassNames ?? ''}`}>
            <DollarSign className="absolute top-1/2 left-2 h-3 w-3 -translate-y-1/2 text-gray-400" />
            <Input
                id={id}
                name={name ?? id}
                type="text"
                inputMode="decimal"
                placeholder={placeholder}
                value={displayValue}
                onChange={handleChange}
                className="py-2 pl-6"
            />
        </div>
    );
}

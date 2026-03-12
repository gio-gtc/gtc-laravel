import { Input } from '@/components/ui/input';
import { DollarSign } from 'lucide-react';

// TODO: Dollar Input needs to be connected!
function DollarInput({
    id,
    placeholder,
    containerClassNames,
}: {
    id: string;
    placeholder?: string;
    containerClassNames?: string;
}) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        const regex = /^\d*\.?\d{0,2}$/;

        if (regex.test(inputValue)) {
            console.log(
                `Dollar Input needs to be connected! Value: ${inputValue}`,
            );
            // onChange(inputValue);
        }
    };
    return (
        <div className={`relative ${containerClassNames}`}>
            <DollarSign className="absolute top-1/2 left-2 h-3 w-3 -translate-y-1/2 text-gray-400" />
            <Input
                id={id}
                name={id}
                type="text"
                inputMode="decimal"
                placeholder={placeholder}
                onChange={handleChange}
                className="border-gray-300 py-2 pr-2.5 pl-6"
            />
        </div>
    );
}

export default DollarInput;

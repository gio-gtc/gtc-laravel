import { Input } from '@/components/ui/input';
import { DollarSign } from 'lucide-react';

function DollarInput({
    id,
    placeholder,
    containerClassNames,
}: {
    id: string;
    placeholder?: string;
    containerClassNames?: string;
}) {
    return (
        <div className={`relative ${containerClassNames}`}>
            <DollarSign className="absolute top-1/2 left-2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
            <Input
                id={id}
                name={id}
                type="number"
                min="0"
                step="0.01"
                placeholder={placeholder}
                className="border-gray-300 p-0 pl-6"
            />
        </div>
    );
}

export default DollarInput;

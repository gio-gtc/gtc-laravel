import { cn } from '@/lib/utils';
import { Mail, PlusCircle, XCircle } from 'lucide-react';
import { Input, InputVariants } from '../ui/input';

function InputAdditions({
    inputList,
    setInputList,
    variant = 'default',
}: {
    inputList: string[];
    setInputList: (input: string[]) => void;
    variant?: InputVariants;
}) {
    const addInput = () => {
        setInputList([...inputList, '']);
    };

    const removeInput = (index: number) => {
        if (inputList.length > 1) {
            setInputList(inputList.filter((_, i) => i !== index));
        }
    };

    const inputs = inputList.map((email, index) => (
        <div key={index} className="relative flex-1">
            <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
                id={`ar_email_${index}`}
                name={`ar_email_${index}`}
                type="email"
                placeholder="email@company.com"
                variant={variant}
                required={index === 0}
                className={cn('pr-9 pl-9')}
                value={email}
                onChange={(e) => {
                    const newList = [...inputList];
                    newList[index] = e.target.value;
                    setInputList(newList);
                }}
            />
            {index === inputList.length - 1 && (
                <button
                    type="button"
                    onClick={addInput}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-destructive hover:text-destructive/80"
                >
                    <PlusCircle className="h-4 w-4" />
                </button>
            )}
            {inputList.length > 1 && index !== inputList.length - 1 && (
                <button
                    type="button"
                    onClick={() => removeInput(index)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                    <XCircle className="h-4 w-4" />
                </button>
            )}
        </div>
    ));

    return inputs;
}

export default InputAdditions;

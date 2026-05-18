import { Mail, PlusCircle, XCircle } from 'lucide-react';
import { InputVariants } from '../ui/input';
import { InputWithLeadingIcon } from '../ui/input-with-leading-icon';

function InputAdditions({
    inputList,
    setInputList,
    variant = 'default',
    /** When set, each input submits as repeated array fields (e.g. `ap_emails[]`). */
    repeatArrayFieldName,
}: {
    inputList: string[];
    setInputList: (input: string[]) => void;
    variant?: InputVariants;
    repeatArrayFieldName: string;
}) {
    const addInput = () => {
        setInputList([...inputList, '']);
    };

    const removeInput = (index: number) => {
        if (inputList.length > 1) {
            setInputList(inputList.filter((_, i) => i !== index));
        }
    };

    const inputs = inputList.map((email, index) => {
        const id = `${repeatArrayFieldName}_${index}`;
        const name = `${repeatArrayFieldName}[]`;

        return (
            <InputWithLeadingIcon
                key={index}
                className="flex-1"
                icon={<Mail />}
                inputClassName="pr-9"
                id={id}
                name={name}
                type="email"
                placeholder="email@example.com"
                variant={variant}
                required={index === 0}
                value={email}
                onChange={(e) => {
                    const newList = [...inputList];
                    newList[index] = e.target.value;
                    setInputList(newList);
                }}
            >
                {index === inputList.length - 1 && (
                    <button
                        type="button"
                        onClick={addInput}
                        className="absolute top-1/2 right-3 -translate-y-1/2 text-destructive hover:text-destructive/80"
                    >
                        <PlusCircle className="h-4 w-4 cursor-pointer" />
                    </button>
                )}
                {inputList.length > 1 && index !== inputList.length - 1 && (
                    <button
                        type="button"
                        onClick={() => removeInput(index)}
                        className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                        <XCircle className="h-4 w-4 cursor-pointer" />
                    </button>
                )}
            </InputWithLeadingIcon>
        );
    });

    return inputs;
}

export default InputAdditions;

import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useEffect, useState } from 'react';
import OrderModalLayout from './order-modal-layout';
import PillButton from './pill-button';
import { orderModalStyles, toggleInArray } from './shared';

const CARD_HOLDER_OPTIONS = ['Amex', 'Citi'] as const;
const DURATION_OPTIONS = [':10', ':15', ':30'] as const;
const LANGUAGE_OPTIONS = ['English', 'Spanish', 'French'] as const;

export interface AddSocialVideoFormValues {
    type: string;
    cardHolder: string[];
    duration: string[];
    language: string[];
}

interface AddSocialVideoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd?: (values: AddSocialVideoFormValues) => void;
}

export default function AddSocialVideoModal({
    isOpen,
    onClose,
    onAdd,
}: AddSocialVideoModalProps) {
    const [type, setType] = useState('Generic');
    const [cardHolder, setCardHolder] = useState<string[]>([]);
    const [duration, setDuration] = useState<string[]>([]);
    const [language, setLanguage] = useState<string[]>([]);

    useEffect(() => {
        if (!isOpen) {
            setType('Generic');
            setCardHolder([]);
            setDuration([]);
            setLanguage([]);
        }
    }, [isOpen]);

    const handleAddToOrder = () => {
        onAdd?.({ type, cardHolder, duration, language });
        onClose();
    };

    return (
        <OrderModalLayout
            isOpen={isOpen}
            onClose={onClose}
            title="Add Social Video"
            primaryLabel="Add to Order"
            onPrimaryClick={handleAddToOrder}
            maxWidth="lg"
        >
            <div className="flex flex-col gap-2 text-xs sm:flex-row">
                <div className="flex flex-3 flex-col gap-1.5">
                    <Label htmlFor="type" className={orderModalStyles.label}>
                        Type
                    </Label>
                    <p className={orderModalStyles.helper}>
                        Select the type of Social Video
                    </p>
                    <Select value={type} onValueChange={setType}>
                        <SelectTrigger
                            id="type"
                            className={orderModalStyles.selectTrigger}
                        >
                            <SelectValue placeholder="Select the type of Social Video" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Generic">Generic</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-row justify-center gap-2 text-xs">
                    <div className="flex flex-col gap-2">
                        <Label className={orderModalStyles.label}>
                            Card Holder
                        </Label>
                        <p className="hidden pt-2 sm:block"> </p>
                        <div className="flex flex-col gap-2">
                            {CARD_HOLDER_OPTIONS.map((option) => (
                                <PillButton
                                    key={option}
                                    selected={cardHolder.includes(option)}
                                    onClick={() =>
                                        setCardHolder((prev) =>
                                            toggleInArray(prev, option),
                                        )
                                    }
                                >
                                    {option}
                                </PillButton>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label className={orderModalStyles.label}>
                            Duration
                        </Label>
                        <p className="hidden pt-2 sm:block"> </p>
                        <div className="flex flex-col gap-2">
                            {DURATION_OPTIONS.map((d) => (
                                <PillButton
                                    key={d}
                                    selected={duration.includes(d)}
                                    onClick={() =>
                                        setDuration((prev) =>
                                            toggleInArray(prev, d),
                                        )
                                    }
                                >
                                    {d}
                                </PillButton>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label className={orderModalStyles.label}>
                            Language
                        </Label>
                        <p className="hidden pt-2 sm:block"> </p>
                        <div className="flex flex-col gap-2">
                            {LANGUAGE_OPTIONS.map((lang) => (
                                <PillButton
                                    key={lang}
                                    selected={language.includes(lang)}
                                    onClick={() =>
                                        setLanguage((prev) =>
                                            toggleInArray(prev, lang),
                                        )
                                    }
                                >
                                    {lang}
                                </PillButton>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </OrderModalLayout>
    );
}

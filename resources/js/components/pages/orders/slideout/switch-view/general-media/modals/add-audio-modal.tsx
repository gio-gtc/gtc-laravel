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

const DURATION_OPTIONS = [':15', ':30', ':60'] as const;
const LANGUAGE_OPTIONS = ['English', 'Spanish', 'French'] as const;

export interface AddAudioFormValues {
    type: string;
    cuts: string;
    duration: string[];
    language: string[];
}

interface AddAudioModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd?: (values: AddAudioFormValues) => void;
}

export default function AddAudioModal({
    isOpen,
    onClose,
    onAdd,
}: AddAudioModalProps) {
    const [type, setType] = useState('Generic');
    const [cuts, setCuts] = useState('Cuts');
    const [duration, setDuration] = useState<string[]>([]);
    const [language, setLanguage] = useState<string[]>([]);

    useEffect(() => {
        if (!isOpen) {
            setType('Generic');
            setCuts('Cuts');
            setDuration([]);
            setLanguage([]);
        }
    }, [isOpen]);

    const handleAddToOrder = () => {
        onAdd?.({ type, cuts, duration, language });
        onClose();
    };

    return (
        <OrderModalLayout
            isOpen={isOpen}
            onClose={onClose}
            title="Add Audio"
            primaryLabel="Add to Order"
            onPrimaryClick={handleAddToOrder}
            maxWidth="2xl"
        >
            <div className="flex flex-col gap-2 text-xs sm:flex-row">
                <div className="flex flex-3 flex-col gap-1.5">
                    <Label htmlFor="type" className={orderModalStyles.label}>
                        Type
                    </Label>
                    <p className={orderModalStyles.helper}>
                        Select the type of TV Spot
                    </p>
                    <Select value={type} onValueChange={setType}>
                        <SelectTrigger
                            id="type"
                            className={orderModalStyles.selectTrigger}
                        >
                            <SelectValue placeholder="Select the type of TV Spot" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Generic">Generic</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-3 flex-col gap-1.5">
                    <Label htmlFor="cuts" className={orderModalStyles.label}>
                        Cuts
                    </Label>
                    <p className={orderModalStyles.helper}>
                        Select the type of Cuts
                    </p>
                    <Select value={cuts} onValueChange={setCuts}>
                        <SelectTrigger
                            id="cuts"
                            className={orderModalStyles.selectTrigger}
                        >
                            <SelectValue placeholder="Select the type of Cuts" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Cuts">Cuts</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-2 flex-col gap-2 sm:flex-row">
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

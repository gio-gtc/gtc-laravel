import { MultiSelectCombobox } from '@/components/ui/combobox';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useMemo, useState } from 'react';
import OrderModalLayout from './order-modal-layout';
import PillButton from './pill-button';
import { orderModalStyles, toggleInArray } from './shared';
import { OPTIONS_BY_TYPE_AUDIO } from './spot-type-cuts-options';

const DURATION_OPTIONS = [':15', ':30', ':60'] as const;
const LANGUAGE_OPTIONS = ['English', 'Spanish', 'French'] as const;

/** Same multi-select semantics as Add Broadcast & Streaming (type drives cuts; duration/language are toggles). */
export interface AddAudioFormValues {
    type: string;
    cuts: string[];
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
    const [cuts, setCuts] = useState<string[]>([]);
    const [duration, setDuration] = useState<string[]>([]);
    const [language, setLanguage] = useState<string[]>(['English']);

    const { availableCuts } = useMemo(() => {
        const config = type ? OPTIONS_BY_TYPE_AUDIO[type] : null;
        return {
            availableCuts: config?.cuts ?? [],
        };
    }, [type]);

    const resetForm = () => {
        setCuts([]);
        setDuration([]);
        setLanguage(['English']);
    };

    const resetAllFields = () => {
        setType('Generic');
        resetForm();
    };

    const handleTypeChange = (newType: string) => {
        resetForm();
        setType(newType);
        const config = OPTIONS_BY_TYPE_AUDIO[newType];
        if (config) {
            setCuts((prev) => prev.filter((c) => config.cuts.includes(c)));
        } else {
            setCuts([]);
            setDuration([]);
        }
    };

    const handleClose = () => {
        resetAllFields();
        onClose();
    };

    const handleAddToOrder = () => {
        onAdd?.({ type, cuts, duration, language });
        handleClose();
    };

    return (
        <OrderModalLayout
            isOpen={isOpen}
            onClose={handleClose}
            title="Add Audio"
            primaryLabel="Add to Order"
            onPrimaryClick={handleAddToOrder}
            modalClasses="sm:max-w-[585px]"
        >
            <div className="flex flex-col gap-2 text-xs sm:flex-row">
                <div className="flex flex-3 flex-col gap-1.5">
                    <Label htmlFor="type" className={orderModalStyles.label}>
                        Type
                    </Label>
                    <p className={orderModalStyles.helper}>
                        Select the type of Spot
                    </p>
                    <Select value={type} onValueChange={handleTypeChange}>
                        <SelectTrigger
                            id="type"
                            className={orderModalStyles.selectTrigger}
                        >
                            <SelectValue placeholder="Select the type of Spot" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Generic">Generic</SelectItem>
                            <SelectItem value="AmEx">AmEx</SelectItem>
                            <SelectItem value="Verizon">Verizon</SelectItem>
                            <SelectItem value="Citi">Citi</SelectItem>
                            <SelectItem value="International">
                                International
                            </SelectItem>
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
                    <MultiSelectCombobox
                        id="cuts"
                        options={availableCuts}
                        value={cuts}
                        onValueChange={setCuts}
                        placeholder="Select Cuts"
                        emptyMessage="No cuts found."
                        triggerClassName={orderModalStyles.selectTrigger}
                    />
                </div>

                <div className="flex flex-row justify-around gap-2 text-xs sm:justify-center">
                    <div className="flex flex-col gap-2">
                        <Label className={cn('pb-4', orderModalStyles.label)}>
                            Duration
                        </Label>
                        <div className="flex flex-col gap-2">
                            {DURATION_OPTIONS.map((d) => {
                                const isDisabled =
                                    (d == ':15' && type != 'Generic') ||
                                    type === 'International';

                                return (
                                    <PillButton
                                        key={d}
                                        className="w-full"
                                        selected={duration.includes(d)}
                                        disabled={isDisabled}
                                        onClick={() =>
                                            !isDisabled &&
                                            setDuration((prev) =>
                                                toggleInArray(prev, d),
                                            )
                                        }
                                    >
                                        {d}
                                    </PillButton>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label className={cn('pb-4', orderModalStyles.label)}>
                            Language
                        </Label>
                        <div className="flex flex-col gap-2">
                            {LANGUAGE_OPTIONS.map((lang) => {
                                const isDisabled = type === 'International';
                                return (
                                    <PillButton
                                        key={lang}
                                        className="w-full"
                                        selected={language.includes(lang)}
                                        disabled={isDisabled}
                                        onClick={() =>
                                            !isDisabled &&
                                            setLanguage((prev) =>
                                                toggleInArray(prev, lang),
                                            )
                                        }
                                    >
                                        {lang}
                                    </PillButton>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </OrderModalLayout>
    );
}

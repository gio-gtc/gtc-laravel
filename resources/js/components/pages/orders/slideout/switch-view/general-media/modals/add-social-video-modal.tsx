import { MultiSelectCombobox } from '@/components/ui/combobox';
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
const CUTS_OPTIONS = [
    'Sign Up Now',
    'Pre Sale',
    'On Sale Now',
    'Week of',
    'Day Prior',
    'Day of',
    'Superless',
    'Sample',
] as const;
const DURATION_OPTIONS = [':10', ':15', ':30'] as const;
const LANGUAGE_OPTIONS = ['English', 'Spanish', 'French'] as const;

export interface AddSocialVideoFormValues {
    type: string;
    cuts: string[];
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
    const [type, setType] = useState('');
    const [cuts, setCuts] = useState<string[]>([]);
    const [cardHolder, setCardHolder] = useState<string[]>([]);
    const [duration, setDuration] = useState<string[]>([]);
    const [language, setLanguage] = useState<string[]>([]);

    useEffect(() => {
        if (!isOpen) {
            setType('');
            setCuts([]);
            setCardHolder([]);
            setDuration([]);
            setLanguage([]);
        }
    }, [isOpen]);

    const handleAddToOrder = () => {
        onAdd?.({ type, cuts, cardHolder, duration, language });
        onClose();
    };

    return (
        <OrderModalLayout
            isOpen={isOpen}
            onClose={onClose}
            title="Add Social Video"
            primaryLabel="Add to Order"
            onPrimaryClick={handleAddToOrder}
            modalClasses="sm:max-w-[484px]"
        >
            <div className="flex flex-col gap-2 text-xs sm:flex-row">
                <div className="flex flex-col gap-2">
                    <div className="flex flex-3 flex-col gap-1.5">
                        <Label
                            htmlFor="type"
                            className={orderModalStyles.label}
                        >
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
                                <SelectValue placeholder="Select Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Generic">Generic</SelectItem>
                                <SelectItem value="AmEx">AmEx</SelectItem>
                                <SelectItem value="Verizon">Verizon</SelectItem>
                                <SelectItem value="Citi">Citi</SelectItem>
                                <SelectItem value="International">
                                    International
                                </SelectItem>
                                <SelectItem value="Social-16-9">
                                    Social - 16:9
                                </SelectItem>
                                <SelectItem value="FBIGStory">
                                    FB/IG Story
                                </SelectItem>
                                <SelectItem value="TikTok">TikTok</SelectItem>
                                <SelectItem value="SocialSquare">
                                    Social Square
                                </SelectItem>
                                <SelectItem value="Social-4-5">
                                    Social - 4:5
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-3 flex-col gap-1.5">
                        <Label
                            htmlFor="cuts"
                            className={orderModalStyles.label}
                        >
                            Cuts
                        </Label>
                        <p className={orderModalStyles.helper}>
                            Select the type of Cuts
                        </p>
                        <MultiSelectCombobox
                            id="cuts"
                            options={CUTS_OPTIONS}
                            value={cuts}
                            onValueChange={setCuts}
                            placeholder="Select Cuts"
                            emptyMessage="No cuts found."
                            triggerClassName={orderModalStyles.selectTrigger}
                        />
                    </div>
                </div>

                <div className="flex flex-row justify-between gap-2 text-xs sm:justify-center">
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

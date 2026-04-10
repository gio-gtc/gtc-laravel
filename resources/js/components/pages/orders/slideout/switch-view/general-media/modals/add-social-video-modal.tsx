import { MultiSelectCombobox } from '@/components/ui/combobox';
import { Label } from '@/components/ui/label';
import { defaultVenueItemLanguageLabels } from '@/components/utils/venue-items';
import { cn } from '@/lib/utils';
import type { VenueItemLanguage } from '@/types';
import { useState } from 'react';
import OrderModalLayout from './order-modal-layout';
import PillButton from './pill-button';
import { orderModalStyles, toggleInArray } from './shared';

const TYPE_OPTIONS = [
    'Social - 16:9',
    'FB/IG Story',
    'TikTok',
    'Social Square',
    'Social - 4:5',
] as const;

const CARD_HOLDER_OPTIONS = ['Amex', 'Citi'] as const;
const SOCIAL_CUT_OPTIONS = [
    'Pre Sale',
    'On Sale Now',
    'Evergreen',
    'Sign Up Now',
] as const;
const DURATION_OPTIONS = [':10', ':15', ':30'] as const;

export interface AddSocialVideoFormValues {
    type: string[];
    cuts: string[];
    cardHolder: string[];
    duration: string[];
    language: string[];
}

interface AddSocialVideoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd?: (values: AddSocialVideoFormValues) => void;
    venue_item_language: VenueItemLanguage[];
}

export default function AddSocialVideoModal({
    isOpen,
    onClose,
    onAdd,
    venue_item_language,
}: AddSocialVideoModalProps) {
    const [type, setType] = useState<string[]>([]);
    const [cuts, setCuts] = useState<string[]>([]);
    const [cardHolder, setCardHolder] = useState<string[]>([]);
    const [duration, setDuration] = useState<string[]>([]);
    const [language, setLanguage] = useState<string[]>(() =>
        defaultVenueItemLanguageLabels(venue_item_language),
    );

    const resetForm = () => {
        setType([]);
        setCuts([]);
        setCardHolder([]);
        setDuration([]);
        setLanguage(defaultVenueItemLanguageLabels(venue_item_language));
    };

    const handleOnClose = () => {
        resetForm();
        onClose();
    };

    const handleAddToOrder = () => {
        console.log({ type, cuts, cardHolder, duration, language });
        onAdd?.({ type, cuts, cardHolder, duration, language });
        handleOnClose();
    };

    return (
        <OrderModalLayout
            isOpen={isOpen}
            onClose={handleOnClose}
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
                        <MultiSelectCombobox
                            id="type"
                            options={TYPE_OPTIONS}
                            value={type}
                            onValueChange={setType}
                            placeholder="Select Type"
                            emptyMessage="No cuts found."
                            triggerClassName={orderModalStyles.selectTrigger}
                        />
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
                            options={SOCIAL_CUT_OPTIONS}
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
                        <Label className={cn('pb-4', orderModalStyles.label)}>
                            Card Holder
                        </Label>
                        <div className="flex flex-col gap-2">
                            {CARD_HOLDER_OPTIONS.map((option) => (
                                <PillButton
                                    key={option}
                                    className="w-full"
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
                        <Label className={cn('pb-4', orderModalStyles.label)}>
                            Duration
                        </Label>
                        <div className="flex flex-col gap-2">
                            {DURATION_OPTIONS.map((d) => {
                                const isDisabled = d == ':10';

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
                            {venue_item_language.map((lang) => (
                                <PillButton
                                    key={lang.id}
                                    className="w-full"
                                    selected={language.includes(lang.type)}
                                    onClick={() =>
                                        setLanguage((prev) =>
                                            toggleInArray(prev, lang.type),
                                        )
                                    }
                                >
                                    {lang.type}
                                </PillButton>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </OrderModalLayout>
    );
}

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import Divider from '@/components/utils/divider';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

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

function toggleInArray<T>(arr: T[], value: T): T[] {
    if (arr.includes(value)) return arr.filter((v) => v !== value);
    return [...arr, value];
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
        const values: AddSocialVideoFormValues = {
            type,
            cardHolder,
            duration,
            language,
        };
        onAdd?.(values);
        onClose();
    };

    const pillBase =
        'w-fit rounded-full border px-3 py-1.5 text-sm font-medium transition-colors';

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="gap-6 sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-gray-900">
                        Add Social Video
                    </DialogTitle>
                </DialogHeader>

                <Divider />

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Type */}
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="type" className="text-gray-900">
                            Type
                        </Label>
                        <p className="text-sm text-gray-500">
                            Select the type of Social Video
                        </p>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger
                                id="type"
                                className="rounded-md border-gray-300 bg-white"
                            >
                                <SelectValue placeholder="Select the type of Social Video" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Generic">Generic</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Card Holder */}
                    <div className="flex flex-col gap-2">
                        <Label className="text-gray-900">Card Holder</Label>
                        <div className="flex flex-col gap-2">
                            {CARD_HOLDER_OPTIONS.map((option) => (
                                <Button
                                    key={option}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className={cn(
                                        pillBase,
                                        'border-gray-300 bg-white text-gray-900 hover:bg-gray-50',
                                        cardHolder.includes(option) &&
                                            'border-brand-gtc-red bg-brand-gtc-red text-white hover:bg-brand-gtc-red/90 hover:text-white',
                                    )}
                                    onClick={() =>
                                        setCardHolder((prev) =>
                                            toggleInArray(prev, option),
                                        )
                                    }
                                >
                                    {option}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Duration */}
                    <div className="flex flex-col gap-2">
                        <Label className="text-gray-900">Duration</Label>
                        <div className="flex flex-col gap-2">
                            {DURATION_OPTIONS.map((d) => (
                                <Button
                                    key={d}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className={cn(
                                        pillBase,
                                        'border-gray-300 bg-white text-gray-900 hover:bg-gray-50',
                                        duration.includes(d) &&
                                            'border-brand-gtc-red bg-brand-gtc-red text-white hover:bg-brand-gtc-red/90 hover:text-white',
                                    )}
                                    onClick={() =>
                                        setDuration((prev) =>
                                            toggleInArray(prev, d),
                                        )
                                    }
                                >
                                    {d}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Language */}
                    <div className="flex flex-col gap-2">
                        <Label className="text-gray-900">Language</Label>
                        <div className="flex flex-col gap-2">
                            {LANGUAGE_OPTIONS.map((lang) => (
                                <Button
                                    key={lang}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className={cn(
                                        pillBase,
                                        'border-gray-300 bg-white text-gray-900 hover:bg-gray-50',
                                        language.includes(lang) &&
                                            'border-brand-gtc-red bg-brand-gtc-red text-white hover:bg-brand-gtc-red/90 hover:text-white',
                                    )}
                                    onClick={() =>
                                        setLanguage((prev) =>
                                            toggleInArray(prev, lang),
                                        )
                                    }
                                >
                                    {lang}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>

                <Divider />

                <DialogFooter className="gap-2 sm:justify-end">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
                    >
                        Cancel
                    </Button>
                    <Button
                        className="bg-brand-gtc-red text-white hover:bg-brand-gtc-red/70"
                        onClick={handleAddToOrder}
                    >
                        Add to Order
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

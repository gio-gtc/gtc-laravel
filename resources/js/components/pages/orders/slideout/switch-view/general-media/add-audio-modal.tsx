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

function toggleInArray<T>(arr: T[], value: T): T[] {
    if (arr.includes(value)) return arr.filter((v) => v !== value);
    return [...arr, value];
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
        const values: AddAudioFormValues = {
            type,
            cuts,
            duration,
            language,
        };
        onAdd?.(values);
        onClose();
    };

    const pillBase = 'w-fit rounded-md transition-colors text-xs';

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="gap-3 sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="font-bold text-gray-900">
                        Add Audio
                    </DialogTitle>
                </DialogHeader>

                <Divider />
                <div className="flex flex-col gap-2 text-xs sm:flex-row">
                    {/* Type */}
                    <div className="flex flex-3 flex-col gap-1.5">
                        <Label htmlFor="type" className="text-gray-900">
                            Type
                        </Label>
                        <p className="text-gray-500">
                            Select the type of TV Spot
                        </p>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger
                                id="type"
                                className="rounded-md border-gray-300 bg-white text-xs"
                            >
                                <SelectValue placeholder="Select the type of TV Spot" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Generic">Generic</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Cuts */}
                    <div className="flex flex-3 flex-col gap-1.5">
                        <Label htmlFor="cuts" className="text-gray-900">
                            Cuts
                        </Label>
                        <p className="text-gray-500">Select the type of Cuts</p>
                        <Select value={cuts} onValueChange={setCuts}>
                            <SelectTrigger
                                id="cuts"
                                className="rounded-md border-gray-300 bg-white text-xs"
                            >
                                <SelectValue placeholder="Select the type of Cuts" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Cuts">Cuts</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-2 flex-col gap-2 sm:flex-row">
                        {/* Duration */}
                        <div className="flex flex-col gap-2">
                            <Label className="text-gray-900">Duration</Label>
                            <p className="hidden pt-2 sm:block"> </p>
                            <div className="flex flex-col gap-2">
                                {DURATION_OPTIONS.map((d) => (
                                    <Button
                                        key={d}
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className={cn(
                                            pillBase,
                                            'border-gray-300 bg-white text-gray-900 hover:bg-brand-gtc-red/80',
                                            duration.includes(d) &&
                                                'bg-brand-gtc-red/70 text-white hover:bg-brand-gtc-red/60 hover:text-white',
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
                            <p className="hidden pt-2 sm:block"> </p>
                            <div className="flex flex-col gap-2">
                                {LANGUAGE_OPTIONS.map((lang) => (
                                    <Button
                                        key={lang}
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className={cn(
                                            pillBase,
                                            'border-gray-300 bg-white text-gray-900 hover:bg-brand-gtc-red/80',
                                            language.includes(lang) &&
                                                'bg-brand-gtc-red/70 text-white hover:bg-brand-gtc-red/60 hover:text-white',
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
                </div>

                <Divider />

                <DialogFooter className="gap-2 sm:justify-end">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="border-gray-300 bg-white text-gray-900 hover:bg-gray-50 hover:text-gray-900"
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

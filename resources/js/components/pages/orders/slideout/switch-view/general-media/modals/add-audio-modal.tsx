import { Button } from '@/components/ui/button';
import { MultiSelectCombobox } from '@/components/ui/combobox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { LoadingDots } from '@/components/ui/loading-dots';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    defaultVenueItemLanguageLabels,
    venueItemLanguageIdToLabel,
} from '@/components/utils/venue-items';
import { durationWireFromPill } from '@/lib/orders/broadcast-spec-wire';
import type { SequentialCreateResult } from '@/lib/orders/order-item-adapters/types';
import { hasRadioFormDuplicates } from '@/lib/orders/radio-duplicate-check';
import { cn } from '@/lib/utils';
import {
    languageTypeToId,
    modalDurationPillToSeconds,
} from '@/lib/venue-items/modal-mappers';
import type { OrderItemLanguage, OrderItemsRadioRow } from '@/types';
import { useEffect, useMemo, useState } from 'react';
import {
    durationSecondsToModalPillLabel,
    isNonDefaultModalDuration,
} from './modal-duration';
import OrderModalLayout from './order-modal-layout';
import PillButton from './pill-button';
import { orderModalStyles, toggleInArray } from './shared';
import { OPTIONS_BY_TYPE_AUDIO } from './spot-type-cuts-options';

const DURATION_OPTIONS = [':15', ':30', ':60'] as const;

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
    onAdd?: (
        values: AddAudioFormValues,
    ) => Promise<SequentialCreateResult | void>;
    venue_item_language: OrderItemLanguage[];
    initialDurationSeconds?: number;
    mode?: 'add' | 'edit';
    initialVenueRow?: OrderItemsRadioRow;
    onEditSave?: (
        row: OrderItemsRadioRow,
    ) => Promise<{ failed: boolean } | void>;
    fieldErrors?: Record<string, string[]>;
    existingRadioRows?: OrderItemsRadioRow[];
}

export default function AddAudioModal({
    isOpen,
    onClose,
    onAdd,
    venue_item_language,
    initialDurationSeconds,
    mode = 'add',
    initialVenueRow,
    onEditSave,
    fieldErrors,
    existingRadioRows = [],
}: AddAudioModalProps) {
    const isEdit = mode === 'edit' && initialVenueRow != null;

    const [type, setType] = useState('Generic');
    const [cuts, setCuts] = useState<string[]>([]);
    const [duration, setDuration] = useState<string[]>([]);
    const [language, setLanguage] = useState<string[]>(() =>
        defaultVenueItemLanguageLabels(venue_item_language),
    );

    const [editType, setEditType] = useState('Generic');
    const [editCut, setEditCut] = useState('');
    const [editDuration, setEditDuration] = useState('');
    const [editLanguage, setEditLanguage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [duplicateConfirmOpen, setDuplicateConfirmOpen] = useState(false);

    useEffect(() => {
        if (!isOpen || !isEdit || !initialVenueRow) return;
        /* eslint-disable react-hooks/set-state-in-effect -- prefill edit form when modal opens */
        setEditType(initialVenueRow.spot_type);
        setEditCut(initialVenueRow.cut);
        setEditDuration(
            durationSecondsToModalPillLabel(
                initialVenueRow.duration_seconds,
                'audio',
            ),
        );
        const langLabel = venueItemLanguageIdToLabel(
            initialVenueRow.language_id ?? -1,
            venue_item_language,
        );
        setEditLanguage(
            initialVenueRow.language ??
                (langLabel || venue_item_language[0]?.type || ''),
        );
        /* eslint-enable react-hooks/set-state-in-effect */
    }, [isOpen, isEdit, initialVenueRow, venue_item_language]);

    useEffect(() => {
        if (!isOpen || isEdit) return;
        /* eslint-disable react-hooks/set-state-in-effect -- add-mode duration hint from table */
        if (initialDurationSeconds === undefined) {
            setDuration([]);
            return;
        }
        const s = Math.floor(initialDurationSeconds);
        setDuration([durationSecondsToModalPillLabel(s, 'audio')]);
        /* eslint-enable react-hooks/set-state-in-effect */
    }, [isOpen, isEdit, initialDurationSeconds]);

    const extraDurationLabel =
        !isEdit &&
        initialDurationSeconds !== undefined &&
        isNonDefaultModalDuration(initialDurationSeconds, 'audio')
            ? durationSecondsToModalPillLabel(initialDurationSeconds, 'audio')
            : null;

    const { availableCuts } = useMemo(() => {
        const config = type ? OPTIONS_BY_TYPE_AUDIO[type] : null;
        return {
            availableCuts: config?.cuts ?? [],
        };
    }, [type]);

    const editAvailableCuts = useMemo(() => {
        const config = editType ? OPTIONS_BY_TYPE_AUDIO[editType] : null;
        return config?.cuts ?? [];
    }, [editType]);

    const editDurationSeconds = useMemo(
        () => modalDurationPillToSeconds(editDuration, 'audio'),
        [editDuration],
    );

    const editExtraDurationLabel =
        isEdit &&
        editDuration &&
        isNonDefaultModalDuration(editDurationSeconds, 'audio')
            ? durationSecondsToModalPillLabel(editDurationSeconds, 'audio')
            : null;

    const canSubmitEdit = useMemo(() => {
        return Boolean(editCut && editDuration && editLanguage);
    }, [editCut, editDuration, editLanguage]);

    const canSubmitAdd = useMemo(
        () =>
            Boolean(
                type &&
                    cuts.length > 0 &&
                    duration.length > 0 &&
                    language.length > 0,
            ),
        [type, cuts, duration, language],
    );

    const resetForm = () => {
        setCuts([]);
        setDuration([]);
        setLanguage(defaultVenueItemLanguageLabels(venue_item_language));
    };

    const resetAllFields = () => {
        setType('Generic');
        resetForm();
        setDuplicateConfirmOpen(false);
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

    const handleEditTypeChange = (newType: string) => {
        setEditType(newType);
        const config = OPTIONS_BY_TYPE_AUDIO[newType];
        const cutOpts = config?.cuts ?? [];
        if (cutOpts.length) {
            setEditCut((c) => (cutOpts.includes(c) ? c : (cutOpts[0] ?? '')));
        } else {
            setEditCut('');
        }
    };

    const handleClose = () => {
        resetAllFields();
        onClose();
    };

    const buildAddFormValues = (): AddAudioFormValues => ({
        type,
        cuts,
        duration,
        language,
    });

    const submitAdd = async (formValues: AddAudioFormValues) => {
        if (!onAdd) {
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await onAdd(formValues);
            if (!result?.failed) {
                handleClose();
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddToOrder = async () => {
        if (!canSubmitAdd || !onAdd || isSubmitting) return;

        const formValues = buildAddFormValues();
        if (
            hasRadioFormDuplicates(formValues, existingRadioRows, {
                venue_item_language,
            })
        ) {
            setDuplicateConfirmOpen(true);
            return;
        }

        await submitAdd(formValues);
    };

    const handleConfirmDuplicate = async () => {
        setDuplicateConfirmOpen(false);
        await submitAdd(buildAddFormValues());
    };

    const handleEditSave = async () => {
        if (!canSubmitEdit || !initialVenueRow || isSubmitting || !onEditSave) {
            return;
        }

        const langId = languageTypeToId(venue_item_language, editLanguage);
        if (langId === undefined) return;

        const durationWire = durationWireFromPill(editDuration);
        const next: OrderItemsRadioRow = {
            ...initialVenueRow,
            spot_type: editType as OrderItemsRadioRow['spot_type'],
            cut: editCut as OrderItemsRadioRow['cut'],
            duration_seconds: durationWire,
            language_id: langId,
            language: editLanguage,
        };

        setIsSubmitting(true);
        try {
            const result = await onEditSave(next);
            if (!result?.failed) {
                handleClose();
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <OrderModalLayout
                isOpen={isOpen}
                onClose={handleClose}
                title={isEdit ? 'Edit Audio' : 'Add Audio'}
                primaryLabel={isEdit ? 'Save changes' : 'Add to Order'}
                onPrimaryClick={isEdit ? handleEditSave : handleAddToOrder}
                primaryLoading={isSubmitting}
                primaryDisabled={
                    isEdit
                        ? !canSubmitEdit || isSubmitting
                        : !canSubmitAdd || isSubmitting
                }
                modalClasses="sm:max-w-[585px]"
            >
                {fieldErrors && Object.keys(fieldErrors).length > 0 && (
                    <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                        {Object.entries(fieldErrors).map(
                            ([field, messages]) => (
                                <p key={field}>{messages.join(' ')}</p>
                            ),
                        )}
                    </div>
                )}
                {isEdit ? (
                    <div className="flex flex-col gap-2 text-xs sm:flex-row">
                        <div className="flex flex-3 flex-col gap-1.5">
                            <Label
                                htmlFor="edit-audio-type"
                                className={orderModalStyles.label}
                            >
                                Type
                            </Label>
                            <p className={orderModalStyles.helper}>
                                Select the type of Spot
                            </p>
                            <Select
                                value={editType}
                                onValueChange={handleEditTypeChange}
                            >
                                <SelectTrigger
                                    id="edit-audio-type"
                                    className={orderModalStyles.selectTrigger}
                                >
                                    <SelectValue placeholder="Select the type of Spot" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Generic">
                                        Generic
                                    </SelectItem>
                                    <SelectItem value="AmEx">AmEx</SelectItem>
                                    <SelectItem value="Verizon">
                                        Verizon
                                    </SelectItem>
                                    <SelectItem value="Citi">Citi</SelectItem>
                                    <SelectItem value="International">
                                        International
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-3 flex-col gap-1.5">
                            <Label
                                htmlFor="edit-audio-cuts"
                                className={orderModalStyles.label}
                            >
                                Cuts
                            </Label>
                            <p className={orderModalStyles.helper}>
                                Select the type of Cuts
                            </p>
                            <MultiSelectCombobox
                                id="edit-audio-cuts"
                                mode="single"
                                options={editAvailableCuts}
                                value={editCut ? [editCut] : []}
                                onValueChange={(v) => setEditCut(v[0] ?? '')}
                                placeholder="Select Cuts"
                                emptyMessage="No cuts found."
                                triggerClassName={orderModalStyles.selectTrigger}
                            />
                        </div>

                        <div className="flex flex-row justify-around gap-2 text-xs sm:justify-center">
                            <div className="flex flex-col gap-2">
                                <Label
                                    className={cn(
                                        'pb-4',
                                        orderModalStyles.label,
                                    )}
                                >
                                    Duration
                                </Label>
                                <div className="flex flex-col gap-2">
                                    {DURATION_OPTIONS.map((d) => {
                                        const isDisabled =
                                            (d == ':15' &&
                                                editType != 'Generic') ||
                                            editType === 'International';

                                        return (
                                            <PillButton
                                                key={d}
                                                className="w-full"
                                                selected={editDuration === d}
                                                disabled={isDisabled}
                                                onClick={() =>
                                                    !isDisabled &&
                                                    setEditDuration(d)
                                                }
                                            >
                                                {d}
                                            </PillButton>
                                        );
                                    })}
                                    {editExtraDurationLabel !== null && (
                                        <PillButton
                                            key={editExtraDurationLabel}
                                            className="w-full"
                                            selected={
                                                editDuration ===
                                                editExtraDurationLabel
                                            }
                                            disabled={
                                                editType === 'International'
                                            }
                                            onClick={() =>
                                                editType !== 'International' &&
                                                setEditDuration(
                                                    editExtraDurationLabel,
                                                )
                                            }
                                        >
                                            {editExtraDurationLabel}
                                        </PillButton>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label
                                    className={cn(
                                        'pb-4',
                                        orderModalStyles.label,
                                    )}
                                >
                                    Language
                                </Label>
                                <div className="flex flex-col gap-2">
                                    {venue_item_language.map((lang) => {
                                        const isDisabled =
                                            editType === 'International';
                                        return (
                                            <PillButton
                                                key={lang.id}
                                                className="w-full"
                                                selected={
                                                    editLanguage === lang.type
                                                }
                                                disabled={isDisabled}
                                                onClick={() =>
                                                    !isDisabled &&
                                                    setEditLanguage(lang.type)
                                                }
                                            >
                                                {lang.type}
                                            </PillButton>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2 text-xs sm:flex-row">
                        <div className="flex flex-3 flex-col gap-1.5">
                            <Label
                                htmlFor="type"
                                className={orderModalStyles.label}
                            >
                                Type
                            </Label>
                            <p className={orderModalStyles.helper}>
                                Select the type of Spot
                            </p>
                            <Select
                                value={type}
                                onValueChange={handleTypeChange}
                            >
                                <SelectTrigger
                                    id="type"
                                    className={orderModalStyles.selectTrigger}
                                >
                                    <SelectValue placeholder="Select the type of Spot" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Generic">
                                        Generic
                                    </SelectItem>
                                    <SelectItem value="AmEx">AmEx</SelectItem>
                                    <SelectItem value="Verizon">
                                        Verizon
                                    </SelectItem>
                                    <SelectItem value="Citi">Citi</SelectItem>
                                    <SelectItem value="International">
                                        International
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
                                <Label
                                    className={cn(
                                        'pb-4',
                                        orderModalStyles.label,
                                    )}
                                >
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
                                    {extraDurationLabel !== null && (
                                        <PillButton
                                            key={extraDurationLabel}
                                            className="w-full"
                                            selected={duration.includes(
                                                extraDurationLabel,
                                            )}
                                            disabled={type === 'International'}
                                            onClick={() =>
                                                type !== 'International' &&
                                                setDuration((prev) =>
                                                    toggleInArray(
                                                        prev,
                                                        extraDurationLabel,
                                                    ),
                                                )
                                            }
                                        >
                                            {extraDurationLabel}
                                        </PillButton>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label
                                    className={cn(
                                        'pb-4',
                                        orderModalStyles.label,
                                    )}
                                >
                                    Language
                                </Label>
                                <div className="flex flex-col gap-2">
                                    {venue_item_language.map((lang) => {
                                        const isDisabled =
                                            type === 'International';
                                        return (
                                            <PillButton
                                                key={lang.id}
                                                className="w-full"
                                                selected={language.includes(
                                                    lang.type,
                                                )}
                                                disabled={isDisabled}
                                                onClick={() =>
                                                    !isDisabled &&
                                                    setLanguage((prev) =>
                                                        toggleInArray(
                                                            prev,
                                                            lang.type,
                                                        ),
                                                    )
                                                }
                                            >
                                                {lang.type}
                                            </PillButton>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </OrderModalLayout>

            <Dialog
                open={duplicateConfirmOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        setDuplicateConfirmOpen(false);
                    }
                }}
            >
                <DialogContent className="gap-2.5 sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className={orderModalStyles.dialogTitle}>
                            Duplicate line item
                        </DialogTitle>
                        <DialogDescription className="text-xs text-gray-600">
                            This combination already exists in this order. Are
                            you sure you want to add a duplicate?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:justify-end">
                        <Button
                            variant="outline"
                            onClick={() => setDuplicateConfirmOpen(false)}
                            className={orderModalStyles.cancelButton}
                        >
                            Cancel
                        </Button>
                        <Button
                            className={orderModalStyles.primaryButton}
                            onClick={() => void handleConfirmDuplicate()}
                            disabled={isSubmitting}
                            aria-busy={isSubmitting}
                        >
                            {isSubmitting ? <LoadingDots /> : 'Add Duplicate'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

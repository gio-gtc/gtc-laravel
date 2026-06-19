import { Button } from '@/components/ui/button';
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
    mergeComboboxOptionsWithCustoms,
    MultiSelectWithOther,
} from '@/components/ui/multi-select-with-other';
import { SelectWithOther } from '@/components/ui/select-with-other';
import {
    defaultVenueItemLanguageLabels,
    venueItemLanguageIdToLabel,
} from '@/components/utils/venue-items';
import { durationWireFromPill } from '@/lib/orders/broadcast-spec-wire';
import type { SequentialCreateResult } from '@/lib/orders/order-item-adapters/types';
import {
    isRadioAddFormComplete,
    isRadioEditFormComplete,
} from '@/lib/orders/radio-add-form-complete';
import { hasRadioFormDuplicates } from '@/lib/orders/radio-duplicate-check';
import { isGtcAdminUser } from '@/lib/user-roles';
import { cn } from '@/lib/utils';
import { languageTypeToId } from '@/lib/venue-items/modal-mappers';
import type {
    OrderItemLanguage,
    OrderItemsRadioRow,
    SharedData,
} from '@/types';
import { usePage } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    customDurationInputToPillLabel,
    durationSecondsToModalPillLabel,
    getDefaultDurationSecondsForModal,
    isNonDefaultModalDuration,
} from './modal-duration';
import OrderModalLayout from './order-modal-layout';
import PillButton from './pill-button';
import { orderModalStyles, toggleInArray } from './shared';
import {
    BROADCAST_SPOT_TYPES,
    OPTIONS_BY_TYPE_AUDIO,
} from './spot-type-cuts-options';
import TextPillInput from './text-pill-input';

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

function isDurationPillDisabled(pill: string, spotType: string): boolean {
    if (spotType === 'International') {
        return true;
    }
    return pill === ':15' && spotType !== 'Generic';
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
    const { auth } = usePage<SharedData>().props;
    const allowFieldOther = isGtcAdminUser(auth.roles ?? []);

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

    const [sessionCustomCuts, setSessionCustomCuts] = useState<string[]>([]);
    const [sessionCustomTypes, setSessionCustomTypes] = useState<string[]>([]);
    const [sessionCustomDurations, setSessionCustomDurations] = useState<
        string[]
    >([]);
    const [customDurationDraft, setCustomDurationDraft] = useState('');
    const [editCustomDurationDraft, setEditCustomDurationDraft] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [duplicateConfirmOpen, setDuplicateConfirmOpen] = useState(false);

    const availableCuts = useMemo(() => {
        const config = type ? OPTIONS_BY_TYPE_AUDIO[type] : null;
        return config?.cuts ?? [];
    }, [type]);

    const editAvailableCuts = useMemo(() => {
        const config = editType ? OPTIONS_BY_TYPE_AUDIO[editType] : null;
        return config?.cuts ?? [];
    }, [editType]);

    const addTypeOptions = useMemo(
        () =>
            mergeComboboxOptionsWithCustoms(
                [...BROADCAST_SPOT_TYPES],
                sessionCustomTypes,
            ),
        [sessionCustomTypes],
    );

    const editTypeOptions = useMemo(
        () =>
            mergeComboboxOptionsWithCustoms(
                [...BROADCAST_SPOT_TYPES],
                [
                    ...sessionCustomTypes,
                    ...(editType &&
                    !(BROADCAST_SPOT_TYPES as readonly string[]).includes(
                        editType,
                    )
                        ? [editType]
                        : []),
                ],
            ),
        [editType, sessionCustomTypes],
    );

    const addCutOptions = useMemo(
        () =>
            mergeComboboxOptionsWithCustoms(
                [...availableCuts],
                sessionCustomCuts,
            ),
        [availableCuts, sessionCustomCuts],
    );

    const editCutOptions = useMemo(
        () =>
            mergeComboboxOptionsWithCustoms(
                [...editAvailableCuts],
                editCut &&
                    !(editAvailableCuts as readonly string[]).includes(editCut)
                    ? [editCut]
                    : sessionCustomCuts,
            ),
        [editCut, editAvailableCuts, sessionCustomCuts],
    );

    const defaultDurationPills = useMemo(
        () => getDefaultDurationSecondsForModal('audio').map((s) => `:${s}`),
        [],
    );

    const allDurationPills = useMemo(() => {
        const extras = [
            ...sessionCustomDurations,
            ...duration.filter((d) => !defaultDurationPills.includes(d)),
        ];
        return [...new Set([...defaultDurationPills, ...extras])];
    }, [defaultDurationPills, sessionCustomDurations, duration]);

    const editAudioDurationSeconds = useMemo(() => {
        const parsed = durationWireFromPill(editDuration);
        const n = Number.parseInt(parsed, 10);
        return Number.isFinite(n) ? n : 0;
    }, [editDuration]);

    const editExtraDurationLabel =
        isEdit &&
        editDuration &&
        isNonDefaultModalDuration(editAudioDurationSeconds, 'audio')
            ? durationSecondsToModalPillLabel(editAudioDurationSeconds, 'audio')
            : null;

    const editAllDurationPills = useMemo(() => {
        const extras = editExtraDurationLabel ? [editExtraDurationLabel] : [];
        return [...new Set([...defaultDurationPills, ...extras])];
    }, [defaultDurationPills, editExtraDurationLabel]);

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
        setEditCustomDurationDraft('');
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

    const canSubmitEdit = useMemo(
        () =>
            isRadioEditFormComplete({
                type: editType,
                cut: editCut,
                duration: editDuration,
                language: editLanguage,
            }),
        [editType, editCut, editDuration, editLanguage],
    );

    const canSubmitAdd = useMemo(
        () =>
            isRadioAddFormComplete({
                type,
                cuts,
                duration,
                language,
            }),
        [type, cuts, duration, language],
    );

    const resetForm = () => {
        setCuts([]);
        setDuration([]);
        setLanguage(defaultVenueItemLanguageLabels(venue_item_language));
        setSessionCustomCuts([]);
        setSessionCustomTypes([]);
        setSessionCustomDurations([]);
        setCustomDurationDraft('');
        setEditCustomDurationDraft('');
    };

    const resetAllFields = () => {
        setType('Generic');
        resetForm();
        setDuplicateConfirmOpen(false);
    };

    const handleTypeChange = (newType: string) => {
        setCuts([]);
        setDuration([]);
        setLanguage(defaultVenueItemLanguageLabels(venue_item_language));
        setType(newType);
        const config = OPTIONS_BY_TYPE_AUDIO[newType];
        if (!config) {
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
        setIsSubmitting(false);
        onClose();
    };

    const handleCustomCutAdded = useCallback((value: string) => {
        setSessionCustomCuts((prev) =>
            prev.includes(value) ? prev : [...prev, value],
        );
    }, []);

    const handleCustomTypeAdded = useCallback((value: string) => {
        setSessionCustomTypes((prev) =>
            prev.includes(value) ? prev : [...prev, value],
        );
    }, []);

    const handleAddCustomDurationCommit = useCallback(() => {
        const pill = customDurationInputToPillLabel(
            customDurationDraft,
            'audio',
        );
        if (!pill) {
            return;
        }
        setSessionCustomDurations((prev) =>
            prev.includes(pill) ? prev : [...prev, pill],
        );
        setDuration((prev) => toggleInArray(prev, pill));
        setCustomDurationDraft('');
    }, [customDurationDraft]);

    const handleEditCustomDurationCommit = useCallback(() => {
        const pill = customDurationInputToPillLabel(
            editCustomDurationDraft,
            'audio',
        );
        if (!pill) {
            return;
        }
        setEditCustomDurationDraft('');
        setEditDuration(pill);
    }, [editCustomDurationDraft]);

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
                title={isEdit ? 'Edit Radio' : 'Add Radio'}
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
                            <SelectWithOther
                                id="edit-audio-type"
                                options={editTypeOptions}
                                value={editType}
                                onValueChange={handleEditTypeChange}
                                allowOther={allowFieldOther}
                                onCustomOptionAdded={handleCustomTypeAdded}
                                placeholder="Select the type of Spot"
                                otherInputPlaceholder="Enter spot type"
                                triggerClassName={
                                    orderModalStyles.selectTrigger
                                }
                            />
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
                            <SelectWithOther
                                id="edit-audio-cuts"
                                options={editCutOptions}
                                value={editCut}
                                onValueChange={setEditCut}
                                allowOther={allowFieldOther}
                                onCustomOptionAdded={handleCustomCutAdded}
                                placeholder="Select Cuts"
                                otherInputPlaceholder="Enter custom cut"
                                emptyMessage="No cuts found."
                                triggerClassName={
                                    orderModalStyles.selectTrigger
                                }
                            />
                        </div>

                        <div className="flex flex-row justify-around gap-2 text-xs sm:justify-center">
                            <div className="flex max-w-[75px] flex-col gap-2">
                                <Label
                                    className={cn(
                                        'pb-4',
                                        orderModalStyles.label,
                                    )}
                                >
                                    Duration
                                </Label>
                                <div className="flex flex-col gap-2">
                                    {editAllDurationPills.map((d) => {
                                        const isDisabled =
                                            isDurationPillDisabled(d, editType);

                                        return (
                                            <PillButton
                                                key={d}
                                                className="w-full"
                                                selected={editDuration === d}
                                                disabled={isDisabled}
                                                onClick={() => {
                                                    if (isDisabled) return;
                                                    setEditCustomDurationDraft(
                                                        '',
                                                    );
                                                    setEditDuration(d);
                                                }}
                                            >
                                                {d}
                                            </PillButton>
                                        );
                                    })}
                                    {editExtraDurationLabel !== null &&
                                        !editAllDurationPills.includes(
                                            editExtraDurationLabel,
                                        ) && (
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
                                                onClick={() => {
                                                    if (
                                                        editType ===
                                                        'International'
                                                    ) {
                                                        return;
                                                    }
                                                    setEditCustomDurationDraft(
                                                        '',
                                                    );
                                                    setEditDuration(
                                                        editExtraDurationLabel,
                                                    );
                                                }}
                                            >
                                                {editExtraDurationLabel}
                                            </PillButton>
                                        )}
                                    <TextPillInput
                                        id="edit-audio-custom-duration"
                                        numericOnly
                                        value={editCustomDurationDraft}
                                        onChange={setEditCustomDurationDraft}
                                        onCommit={
                                            handleEditCustomDurationCommit
                                        }
                                        selected={
                                            editCustomDurationDraft.trim() !==
                                                '' &&
                                            customDurationInputToPillLabel(
                                                editCustomDurationDraft,
                                                'audio',
                                            ) === editDuration
                                        }
                                        disabled={editType === 'International'}
                                        className="w-full"
                                    />
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
                            <SelectWithOther
                                id="type"
                                options={addTypeOptions}
                                value={type}
                                onValueChange={handleTypeChange}
                                allowOther={allowFieldOther}
                                onCustomOptionAdded={handleCustomTypeAdded}
                                placeholder="Select the type of Spot"
                                otherInputPlaceholder="Enter spot type"
                                triggerClassName={
                                    orderModalStyles.selectTrigger
                                }
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
                            <MultiSelectWithOther
                                id="cuts"
                                options={addCutOptions}
                                value={cuts}
                                onValueChange={setCuts}
                                onCustomOptionAdded={handleCustomCutAdded}
                                allowOther={allowFieldOther}
                                placeholder="Select Cuts"
                                emptyMessage="No cuts found."
                                otherInputPlaceholder="Enter custom cut"
                                triggerClassName={
                                    orderModalStyles.selectTrigger
                                }
                            />
                        </div>

                        <div className="flex flex-row justify-around gap-2 text-xs sm:justify-center">
                            <div className="flex max-w-[75px] flex-col gap-2">
                                <Label
                                    className={cn(
                                        'pb-4',
                                        orderModalStyles.label,
                                    )}
                                >
                                    Duration
                                </Label>
                                <div className="flex flex-col gap-2">
                                    {allDurationPills.map((d) => {
                                        const isDisabled =
                                            isDurationPillDisabled(d, type);

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
                                    {extraDurationLabel !== null &&
                                        !allDurationPills.includes(
                                            extraDurationLabel,
                                        ) && (
                                            <PillButton
                                                key={extraDurationLabel}
                                                className="w-full"
                                                selected={duration.includes(
                                                    extraDurationLabel,
                                                )}
                                                disabled={
                                                    type === 'International'
                                                }
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
                                    <TextPillInput
                                        id="add-audio-custom-duration"
                                        numericOnly
                                        value={customDurationDraft}
                                        onChange={setCustomDurationDraft}
                                        onCommit={handleAddCustomDurationCommit}
                                        selected={
                                            customDurationDraft.trim() !== '' &&
                                            customDurationInputToPillLabel(
                                                customDurationDraft,
                                                'audio',
                                            ) !== null &&
                                            duration.includes(
                                                customDurationInputToPillLabel(
                                                    customDurationDraft,
                                                    'audio',
                                                )!,
                                            )
                                        }
                                        disabled={type === 'International'}
                                        className="w-full"
                                    />
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

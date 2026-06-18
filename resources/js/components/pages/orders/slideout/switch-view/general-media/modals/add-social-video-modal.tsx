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
import {
    isSocialAddFormComplete,
    isSocialEditFormComplete,
} from '@/lib/orders/social-add-form-complete';
import { hasSocialFormDuplicates } from '@/lib/orders/social-duplicate-check';
import { isGtcAdminUser } from '@/lib/user-roles';
import { cn } from '@/lib/utils';
import { languageTypeToId } from '@/lib/venue-items/modal-mappers';
import type { OrderItemLanguage, OrderItemsSocialRow, SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import DurationPillInput from './duration-pill-input';
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
    SOCIAL_CUT_OPTIONS,
    SOCIAL_VIDEO_TYPE_OPTIONS,
    VENUE_ITEM_SOCIAL_CARD_HOLDERS,
} from './spot-type-cuts-options';

const CARD_HOLDER_BASE_OPTIONS = [...VENUE_ITEM_SOCIAL_CARD_HOLDERS];

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
    onAdd?: (
        values: AddSocialVideoFormValues,
    ) => Promise<{ failed: boolean } | void>;
    venue_item_language: OrderItemLanguage[];
    initialDurationSeconds?: number;
    mode?: 'add' | 'edit';
    initialVenueRow?: OrderItemsSocialRow;
    onEditSave?: (
        row: OrderItemsSocialRow,
    ) => Promise<{ failed: boolean } | void>;
    fieldErrors?: Record<string, string[]>;
    existingSocialRows?: OrderItemsSocialRow[];
}

export default function AddSocialVideoModal({
    isOpen,
    onClose,
    onAdd,
    venue_item_language,
    initialDurationSeconds,
    mode = 'add',
    initialVenueRow,
    onEditSave,
    fieldErrors,
    existingSocialRows = [],
}: AddSocialVideoModalProps) {
    const isEdit = mode === 'edit' && initialVenueRow != null;
    const { auth } = usePage<SharedData>().props;
    const allowFieldOther = isGtcAdminUser(auth.roles ?? []);

    const [type, setType] = useState<string[]>([]);
    const [cuts, setCuts] = useState<string[]>([]);
    const [cardHolder, setCardHolder] = useState<string[]>([]);
    const [duration, setDuration] = useState<string[]>([]);
    const [language, setLanguage] = useState<string[]>(() =>
        defaultVenueItemLanguageLabels(venue_item_language),
    );

    const [editLayout, setEditLayout] = useState('');
    const [editCut, setEditCut] = useState('');
    const [editCardHolder, setEditCardHolder] = useState('');
    const [editDuration, setEditDuration] = useState('');
    const [editLanguage, setEditLanguage] = useState('');

    const [sessionCustomCuts, setSessionCustomCuts] = useState<string[]>([]);
    const [sessionCustomCardHolders, setSessionCustomCardHolders] = useState<
        string[]
    >([]);
    const [sessionCustomDurations, setSessionCustomDurations] = useState<
        string[]
    >([]);
    const [customDurationDraft, setCustomDurationDraft] = useState('');
    const [editCustomDurationDraft, setEditCustomDurationDraft] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [duplicateConfirmOpen, setDuplicateConfirmOpen] = useState(false);

    const languageOptions = useMemo(
        () => venue_item_language.map((l) => l.type),
        [venue_item_language],
    );

    const addCutOptions = useMemo(
        () =>
            mergeComboboxOptionsWithCustoms(
                [...SOCIAL_CUT_OPTIONS],
                sessionCustomCuts,
            ),
        [sessionCustomCuts],
    );

    const editCutOptions = useMemo(
        () =>
            mergeComboboxOptionsWithCustoms(
                [...SOCIAL_CUT_OPTIONS],
                editCut &&
                !(SOCIAL_CUT_OPTIONS as readonly string[]).includes(editCut)
                    ? [editCut]
                    : sessionCustomCuts,
            ),
        [editCut, sessionCustomCuts],
    );

    const addCardHolderOptions = useMemo(
        () =>
            mergeComboboxOptionsWithCustoms(
                CARD_HOLDER_BASE_OPTIONS,
                sessionCustomCardHolders,
            ),
        [sessionCustomCardHolders],
    );

    const editCardHolderOptions = useMemo(() => {
        const customs =
            editCardHolder &&
            !CARD_HOLDER_BASE_OPTIONS.includes(
                editCardHolder as (typeof CARD_HOLDER_BASE_OPTIONS)[number],
            )
                ? [editCardHolder]
                : sessionCustomCardHolders;
        return mergeComboboxOptionsWithCustoms(
            CARD_HOLDER_BASE_OPTIONS,
            customs,
        );
    }, [editCardHolder, sessionCustomCardHolders]);

    const defaultDurationPills = useMemo(
        () =>
            getDefaultDurationSecondsForModal('social').map(
                (s) => `:${s}`,
            ),
        [],
    );

    const allDurationPills = useMemo(() => {
        const extras = [
            ...sessionCustomDurations,
            ...duration.filter((d) => !defaultDurationPills.includes(d)),
        ];
        return [...new Set([...defaultDurationPills, ...extras])];
    }, [defaultDurationPills, sessionCustomDurations, duration]);

    const editSocialDurationSeconds = useMemo(() => {
        const parsed = durationWireFromPill(editDuration);
        const n = Number.parseInt(parsed, 10);
        return Number.isFinite(n) ? n : 0;
    }, [editDuration]);

    const editExtraDurationLabel =
        isEdit &&
        editDuration &&
        isNonDefaultModalDuration(editSocialDurationSeconds, 'social')
            ? durationSecondsToModalPillLabel(
                  editSocialDurationSeconds,
                  'social',
              )
            : null;

    const editAllDurationPills = useMemo(() => {
        const extras = editExtraDurationLabel
            ? [editExtraDurationLabel]
            : [];
        return [...new Set([...defaultDurationPills, ...extras])];
    }, [defaultDurationPills, editExtraDurationLabel]);

    useEffect(() => {
        if (!isOpen || !isEdit || !initialVenueRow) return;
        /* eslint-disable react-hooks/set-state-in-effect -- prefill edit form when modal opens */
        setEditLayout(initialVenueRow.spot_type);
        setEditCut(initialVenueRow.cut);
        setEditDuration(
            durationSecondsToModalPillLabel(
                initialVenueRow.duration_seconds,
                'social',
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
        setEditCardHolder(initialVenueRow.card_holder?.trim() ?? '');
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
        setDuration([durationSecondsToModalPillLabel(s, 'social')]);
        /* eslint-enable react-hooks/set-state-in-effect */
    }, [isOpen, isEdit, initialDurationSeconds]);

    const extraDurationLabel =
        !isEdit &&
        initialDurationSeconds !== undefined &&
        isNonDefaultModalDuration(initialDurationSeconds, 'social')
            ? durationSecondsToModalPillLabel(initialDurationSeconds, 'social')
            : null;

    const canSubmitEdit = useMemo(
        () =>
            isSocialEditFormComplete({
                layout: editLayout,
                cut: editCut,
                cardHolder: editCardHolder,
                duration: editDuration,
                language: editLanguage,
            }),
        [editLayout, editCut, editCardHolder, editDuration, editLanguage],
    );

    const canSubmitAdd = useMemo(
        () =>
            isSocialAddFormComplete({
                type,
                cuts,
                cardHolder,
                duration,
                language,
            }),
        [type, cuts, cardHolder, duration, language],
    );

    const resetForm = () => {
        setType([]);
        setCuts([]);
        setCardHolder([]);
        setDuration([]);
        setLanguage(defaultVenueItemLanguageLabels(venue_item_language));
        setSessionCustomCuts([]);
        setSessionCustomCardHolders([]);
        setSessionCustomDurations([]);
        setCustomDurationDraft('');
        setEditCustomDurationDraft('');
    };

    const handleClose = () => {
        resetForm();
        setIsSubmitting(false);
        setDuplicateConfirmOpen(false);
        onClose();
    };

    const handleCustomCutAdded = useCallback((value: string) => {
        setSessionCustomCuts((prev) =>
            prev.includes(value) ? prev : [...prev, value],
        );
    }, []);

    const handleCustomCardHolderAdded = useCallback((value: string) => {
        setSessionCustomCardHolders((prev) =>
            prev.includes(value) ? prev : [...prev, value],
        );
    }, []);

    const handleAddCustomDurationCommit = useCallback(() => {
        const pill = customDurationInputToPillLabel(
            customDurationDraft,
            'social',
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
            'social',
        );
        if (!pill) {
            return;
        }
        setEditCustomDurationDraft('');
        setEditDuration(pill);
    }, [editCustomDurationDraft]);

    const buildAddFormValues = (): AddSocialVideoFormValues => ({
        type,
        cuts,
        cardHolder,
        duration,
        language,
    });

    const submitAdd = async (formValues: AddSocialVideoFormValues) => {
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
            hasSocialFormDuplicates(formValues, existingSocialRows, {
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
        const next: OrderItemsSocialRow = {
            ...initialVenueRow,
            spot_type: editLayout as OrderItemsSocialRow['spot_type'],
            cut: editCut as OrderItemsSocialRow['cut'],
            duration_seconds: durationWire,
            language_id: langId,
            language: editLanguage,
            card_holder: editCardHolder.trim(),
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
                title={isEdit ? 'Edit Social Video' : 'Add Social Video'}
                primaryLabel={isEdit ? 'Save changes' : 'Add to Order'}
                onPrimaryClick={isEdit ? handleEditSave : handleAddToOrder}
                primaryLoading={isSubmitting}
                primaryDisabled={
                    isEdit
                        ? !canSubmitEdit || isSubmitting
                        : !canSubmitAdd || isSubmitting
                }
                modalClasses="sm:max-w-[484px]"
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
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-3 flex-col gap-1.5">
                                <Label
                                    htmlFor="edit-social-type"
                                    className={orderModalStyles.label}
                                >
                                    Type
                                </Label>
                                <p className={orderModalStyles.helper}>
                                    Select the type of Social Video
                                </p>
                                <SelectWithOther
                                    id="edit-social-type"
                                    options={[...SOCIAL_VIDEO_TYPE_OPTIONS]}
                                    value={editLayout}
                                    onValueChange={setEditLayout}
                                    allowOther={allowFieldOther}
                                    placeholder="Select Type"
                                    otherInputPlaceholder="Enter layout type"
                                    selectTriggerVariant="orderSlideoutpopup"
                                    triggerClassName={
                                        orderModalStyles.selectTrigger
                                    }
                                    otherInputClassName={
                                        orderModalStyles.selectTrigger
                                    }
                                />
                            </div>

                            <div className="flex flex-3 flex-col gap-1.5">
                                <Label
                                    htmlFor="edit-social-cuts"
                                    className={orderModalStyles.label}
                                >
                                    Cuts
                                </Label>
                                <p className={orderModalStyles.helper}>
                                    Select the type of Cuts
                                </p>
                                <SelectWithOther
                                    id="edit-social-cuts"
                                    options={editCutOptions}
                                    value={editCut}
                                    onValueChange={setEditCut}
                                    allowOther={allowFieldOther}
                                    placeholder="Select Cuts"
                                    otherInputPlaceholder="Enter custom cut"
                                    selectTriggerVariant="orderSlideoutpopup"
                                    triggerClassName={
                                        orderModalStyles.selectTrigger
                                    }
                                    otherInputClassName={
                                        orderModalStyles.selectTrigger
                                    }
                                />
                            </div>

                            <div className="flex flex-3 flex-col gap-1.5">
                                <Label
                                    htmlFor="edit-social-card-holder"
                                    className={orderModalStyles.label}
                                >
                                    Card Holder
                                </Label>
                                <p className={orderModalStyles.helper}>
                                    Select card holder
                                </p>
                                <SelectWithOther
                                    id="edit-social-card-holder"
                                    options={editCardHolderOptions}
                                    value={editCardHolder}
                                    onValueChange={setEditCardHolder}
                                    allowOther={allowFieldOther}
                                    placeholder="Select card holder"
                                    otherInputPlaceholder="Enter card holder"
                                    selectTriggerVariant="orderSlideoutpopup"
                                    triggerClassName={
                                        orderModalStyles.selectTrigger
                                    }
                                    otherInputClassName={
                                        orderModalStyles.selectTrigger
                                    }
                                />
                            </div>
                        </div>

                        <div className="flex flex-row justify-around gap-2 text-xs sm:justify-center">
                            <div className="flex flex-col gap-2">
                                <Label
                                    className={cn('pb-4', orderModalStyles.label)}
                                >
                                    Duration
                                </Label>
                                <div className="flex max-w-[55px] flex-col gap-2">
                                    {editAllDurationPills.map((d) => (
                                        <PillButton
                                            key={d}
                                            className="w-full"
                                            selected={editDuration === d}
                                            onClick={() => {
                                                setEditCustomDurationDraft('');
                                                setEditDuration(d);
                                            }}
                                        >
                                            {d}
                                        </PillButton>
                                    ))}
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
                                                onClick={() => {
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
                                    <DurationPillInput
                                        id="edit-social-custom-duration"
                                        value={editCustomDurationDraft}
                                        onChange={setEditCustomDurationDraft}
                                        onCommit={handleEditCustomDurationCommit}
                                        selected={
                                            editCustomDurationDraft.trim() !==
                                                '' &&
                                            customDurationInputToPillLabel(
                                                editCustomDurationDraft,
                                                'social',
                                            ) === editDuration
                                        }
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label
                                    className={cn('pb-4', orderModalStyles.label)}
                                >
                                    Language
                                </Label>
                                <div className="flex flex-col gap-2">
                                    {languageOptions.map((lang) => (
                                        <PillButton
                                            key={lang}
                                            className="w-full"
                                            selected={editLanguage === lang}
                                            onClick={() => setEditLanguage(lang)}
                                        >
                                            {lang}
                                        </PillButton>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
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
                                <MultiSelectWithOther
                                    id="type"
                                    options={[...SOCIAL_VIDEO_TYPE_OPTIONS]}
                                    value={type}
                                    onValueChange={setType}
                                    allowOther={allowFieldOther}
                                    placeholder="Select Type"
                                    emptyMessage="No types found."
                                    otherInputPlaceholder="Enter layout type"
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

                            <div className="flex flex-3 flex-col gap-1.5">
                                <Label
                                    htmlFor="card-holder"
                                    className={orderModalStyles.label}
                                >
                                    Card Holder
                                </Label>
                                <p className={orderModalStyles.helper}>
                                    Select card holder
                                </p>
                                <MultiSelectWithOther
                                    id="card-holder"
                                    options={addCardHolderOptions}
                                    value={cardHolder}
                                    onValueChange={setCardHolder}
                                    onCustomOptionAdded={
                                        handleCustomCardHolderAdded
                                    }
                                    allowOther={allowFieldOther}
                                    placeholder="Select card holder"
                                    emptyMessage="No card holders found."
                                    otherInputPlaceholder="Enter card holder"
                                    triggerClassName={
                                        orderModalStyles.selectTrigger
                                    }
                                />
                            </div>
                        </div>

                        <div className="flex flex-row justify-around gap-2 text-xs sm:justify-center">
                            <div className="flex flex-col gap-2">
                                <Label
                                    className={cn('pb-4', orderModalStyles.label)}
                                >
                                    Duration
                                </Label>
                                <div className="flex max-w-[55px] flex-col gap-2">
                                    {allDurationPills.map((d) => (
                                        <PillButton
                                            key={d}
                                            className="w-full"
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
                                                onClick={() =>
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
                                    <DurationPillInput
                                        id="add-social-custom-duration"
                                        value={customDurationDraft}
                                        onChange={setCustomDurationDraft}
                                        onCommit={handleAddCustomDurationCommit}
                                        selected={
                                            customDurationDraft.trim() !== '' &&
                                            customDurationInputToPillLabel(
                                                customDurationDraft,
                                                'social',
                                            ) !== null &&
                                            duration.includes(
                                                customDurationInputToPillLabel(
                                                    customDurationDraft,
                                                    'social',
                                                )!,
                                            )
                                        }
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label
                                    className={cn('pb-4', orderModalStyles.label)}
                                >
                                    Language
                                </Label>
                                <MultiSelectWithOther
                                    id="language"
                                    options={languageOptions}
                                    value={language}
                                    onValueChange={setLanguage}
                                    allowOther={allowFieldOther}
                                    placeholder="Select language"
                                    emptyMessage="No languages found."
                                    otherInputPlaceholder="Enter language"
                                    triggerClassName={
                                        orderModalStyles.selectTrigger
                                    }
                                />
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

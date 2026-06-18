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
import type {
    OrderItemLanguage,
    OrderItemsSocialRow,
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
    SOCIAL_CUT_OPTIONS,
    SOCIAL_VIDEO_TYPE_OPTIONS,
    VENUE_ITEM_SOCIAL_CARD_HOLDERS,
} from './spot-type-cuts-options';
import TextPillInput from './text-pill-input';

const CARD_HOLDER_BASE_OPTIONS = [...VENUE_ITEM_SOCIAL_CARD_HOLDERS];

function isBaseCardHolder(value: string): boolean {
    return (CARD_HOLDER_BASE_OPTIONS as readonly string[]).includes(value);
}

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
    const [sessionCustomTypes, setSessionCustomTypes] = useState<string[]>([]);
    const [sessionCustomCardHolders, setSessionCustomCardHolders] = useState<
        string[]
    >([]);
    const [sessionCustomDurations, setSessionCustomDurations] = useState<
        string[]
    >([]);
    const [customDurationDraft, setCustomDurationDraft] = useState('');
    const [editCustomDurationDraft, setEditCustomDurationDraft] = useState('');
    const [customCardHolderDraft, setCustomCardHolderDraft] = useState('');
    const [editCustomCardHolderDraft, setEditCustomCardHolderDraft] =
        useState('');
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

    const editTypeOptions = useMemo(
        () =>
            mergeComboboxOptionsWithCustoms(
                [...SOCIAL_VIDEO_TYPE_OPTIONS],
                [
                    ...sessionCustomTypes,
                    ...(editLayout &&
                    !(SOCIAL_VIDEO_TYPE_OPTIONS as readonly string[]).includes(
                        editLayout,
                    )
                        ? [editLayout]
                        : []),
                ],
            ),
        [editLayout, sessionCustomTypes],
    );

    const defaultDurationPills = useMemo(
        () => getDefaultDurationSecondsForModal('social').map((s) => `:${s}`),
        [],
    );

    const allDurationPills = useMemo(() => {
        const extras = [
            ...sessionCustomDurations,
            ...duration.filter((d) => !defaultDurationPills.includes(d)),
        ];
        return [...new Set([...defaultDurationPills, ...extras])];
    }, [defaultDurationPills, sessionCustomDurations, duration]);

    const allCardHolderPills = useMemo(() => {
        const extras = [
            ...sessionCustomCardHolders,
            ...cardHolder.filter((holder) => !isBaseCardHolder(holder)),
        ];
        return [...new Set([...CARD_HOLDER_BASE_OPTIONS, ...extras])];
    }, [sessionCustomCardHolders, cardHolder]);

    const editAllCardHolderPills = useMemo(() => {
        const trimmed = editCardHolder.trim();
        const extras = [
            ...sessionCustomCardHolders,
            ...(trimmed && !isBaseCardHolder(trimmed) ? [trimmed] : []),
        ];
        return [...new Set([...CARD_HOLDER_BASE_OPTIONS, ...extras])];
    }, [sessionCustomCardHolders, editCardHolder]);

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
        const extras = editExtraDurationLabel ? [editExtraDurationLabel] : [];
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
        setEditCustomCardHolderDraft('');
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
        setSessionCustomTypes([]);
        setSessionCustomCardHolders([]);
        setSessionCustomDurations([]);
        setCustomDurationDraft('');
        setEditCustomDurationDraft('');
        setCustomCardHolderDraft('');
        setEditCustomCardHolderDraft('');
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

    const handleCustomTypeAdded = useCallback((value: string) => {
        setSessionCustomTypes((prev) =>
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

    const handleAddCustomCardHolderCommit = useCallback(() => {
        const value = customCardHolderDraft.trim();
        if (!value || !allowFieldOther) {
            return;
        }
        setSessionCustomCardHolders((prev) =>
            prev.includes(value) ? prev : [...prev, value],
        );
        setCardHolder((prev) => toggleInArray(prev, value));
        setCustomCardHolderDraft('');
    }, [allowFieldOther, customCardHolderDraft]);

    const handleEditCustomCardHolderCommit = useCallback(() => {
        const value = editCustomCardHolderDraft.trim();
        if (!value || !allowFieldOther) {
            return;
        }
        setSessionCustomCardHolders((prev) =>
            prev.includes(value) ? prev : [...prev, value],
        );
        setEditCustomCardHolderDraft('');
        setEditCardHolder(value);
    }, [allowFieldOther, editCustomCardHolderDraft]);

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
                                    options={editTypeOptions}
                                    value={editLayout}
                                    onValueChange={setEditLayout}
                                    allowOther={allowFieldOther}
                                    onCustomOptionAdded={handleCustomTypeAdded}
                                    placeholder="Select Type"
                                    otherInputPlaceholder="Enter layout type"
                                    triggerClassName={
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
                                    onCustomOptionAdded={handleCustomCutAdded}
                                    placeholder="Select Cuts"
                                    otherInputPlaceholder="Enter custom cut"
                                    emptyMessage="No cuts found."
                                    triggerClassName={
                                        orderModalStyles.selectTrigger
                                    }
                                />
                            </div>
                        </div>

                        <div className="flex flex-row gap-2 text-xs">
                            <div className="flex flex-col gap-2 sm:max-w-[85px]">
                                <Label
                                    className={cn(
                                        'pb-4',
                                        orderModalStyles.label,
                                    )}
                                >
                                    Card Holder
                                </Label>
                                <div className="flex flex-col gap-2">
                                    {editAllCardHolderPills.map((holder) => (
                                        <PillButton
                                            key={holder}
                                            className="w-full"
                                            selected={editCardHolder === holder}
                                            onClick={() => {
                                                setEditCustomCardHolderDraft(
                                                    '',
                                                );
                                                setEditCardHolder(holder);
                                            }}
                                        >
                                            {holder}
                                        </PillButton>
                                    ))}
                                    {allowFieldOther && (
                                        <TextPillInput
                                            id="edit-social-custom-card-holder"
                                            value={editCustomCardHolderDraft}
                                            onChange={
                                                setEditCustomCardHolderDraft
                                            }
                                            onCommit={
                                                handleEditCustomCardHolderCommit
                                            }
                                            selected={
                                                editCustomCardHolderDraft.trim() !==
                                                    '' &&
                                                editCardHolder ===
                                                    editCustomCardHolderDraft.trim()
                                            }
                                            className="w-full"
                                        />
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
                                    <TextPillInput
                                        id="edit-social-custom-duration"
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
                                                'social',
                                            ) === editDuration
                                        }
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            <div className="flex min-w-[100px] flex-1 flex-col gap-2">
                                <Label
                                    className={cn(
                                        'pb-4',
                                        orderModalStyles.label,
                                    )}
                                >
                                    Language
                                </Label>
                                <div className="flex w-full flex-col gap-2">
                                    {languageOptions.map((lang) => (
                                        <PillButton
                                            key={lang}
                                            className="w-full"
                                            selected={editLanguage === lang}
                                            onClick={() =>
                                                setEditLanguage(lang)
                                            }
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
                        </div>

                        <div className="flex flex-row gap-2 text-xs">
                            <div className="flex flex-col gap-2 sm:max-w-[85px]">
                                <Label
                                    className={cn(
                                        'pb-4',
                                        orderModalStyles.label,
                                    )}
                                >
                                    Card Holder
                                </Label>
                                <div className="flex flex-col gap-2">
                                    {allCardHolderPills.map((holder) => (
                                        <PillButton
                                            key={holder}
                                            className="w-full"
                                            selected={cardHolder.includes(
                                                holder,
                                            )}
                                            onClick={() =>
                                                setCardHolder((prev) =>
                                                    toggleInArray(prev, holder),
                                                )
                                            }
                                        >
                                            {holder}
                                        </PillButton>
                                    ))}
                                    {allowFieldOther && (
                                        <TextPillInput
                                            id="add-social-custom-card-holder"
                                            value={customCardHolderDraft}
                                            onChange={setCustomCardHolderDraft}
                                            onCommit={
                                                handleAddCustomCardHolderCommit
                                            }
                                            selected={
                                                customCardHolderDraft.trim() !==
                                                    '' &&
                                                cardHolder.includes(
                                                    customCardHolderDraft.trim(),
                                                )
                                            }
                                            className="w-full"
                                        />
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
                                    <TextPillInput
                                        id="add-social-custom-duration"
                                        numericOnly
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

                            <div className="flex min-w-[100px] flex-1 flex-col gap-2">
                                <Label
                                    className={cn(
                                        'pb-4',
                                        orderModalStyles.label,
                                    )}
                                >
                                    Language
                                </Label>
                                <div className="flex w-full flex-col gap-2">
                                    {languageOptions.map((lang) => (
                                        <PillButton
                                            key={lang}
                                            className="w-full"
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

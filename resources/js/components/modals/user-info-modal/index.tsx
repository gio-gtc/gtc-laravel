import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import { UserInfoFormFields } from '@/components/modals/user-info-modal/form-fields';
import { UserInfoOutOfOfficeFields } from '@/components/modals/user-info-modal/out-of-office-fields';
import { UserInfoPasswordChangeFields } from '@/components/modals/user-info-modal/password-change-fields';
import {
    buildUserInfoFormDefaults,
    buildUserInfoFormTransformPayload,
    firstContactValidationToastMessage,
    type CreateContactPrefill,
} from '@/components/modals/user-info-modal/utils';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { type PhoneNumberFieldHandle } from '@/components/ui/phone-number-field';
import { type SharedData } from '@/types';
import type { FormDataConvertible } from '@inertiajs/core';
import { Form, usePage } from '@inertiajs/react';
import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type FormEvent,
} from 'react';
import { toast } from 'react-toastify';
import Divider from '../../utils/divider';

type FlashShape = { success?: string | null; error?: string | null };

export type { CreateContactPrefill };

type UserInfoModalMode = 'edit' | 'create';

const MODE_LABELS: Record<
    UserInfoModalMode,
    {
        defaultTitle: string;
        photoLabel: string;
        photoUploadTitle: string;
        submitLabel: string;
        permissionsPlaceholder: string | undefined;
    }
> = {
    create: {
        defaultTitle: 'Create Contact',
        photoLabel: 'Photo',
        photoUploadTitle: 'Upload photo',
        submitLabel: 'Create Contact',
        permissionsPlaceholder: 'Select permissions level',
    },
    edit: {
        defaultTitle: 'Profile',
        photoLabel: 'Your Photo',
        photoUploadTitle: 'Change photo',
        submitLabel: 'Submit',
        permissionsPlaceholder: undefined,
    },
};

const INVITE_FORM = {
    action: '/contacts/invite',
    method: 'post' as const,
};

interface UserInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode?: UserInfoModalMode;
    title?: string;
    createPrefill?: CreateContactPrefill | null;
}

export default function UserInfoModal({
    isOpen,
    onClose,
    mode = 'edit',
    title: providedTitle,
    createPrefill = null,
}: UserInfoModalProps) {
    const { auth, flash } = usePage<SharedData & { flash?: FlashShape }>()
        .props;
    const flashRef = useRef<FlashShape | undefined>(flash);
    useLayoutEffect(() => {
        flashRef.current = flash;
    }, [flash]);

    const editFormProps = ProfileController.update.form();
    const user = { ...auth.user, role: auth.roles[0] };
    const isCreateMode = mode === 'create';
    const isProfileEdit = mode === 'edit';
    const modeLabels = MODE_LABELS[mode];
    const modalTitle = providedTitle ?? modeLabels.defaultTitle;
    const createFormKey = isCreateMode
        ? `create-contact-${isOpen}-${JSON.stringify(createPrefill ?? {})}`
        : undefined;

    const formTargetProps = isCreateMode ? INVITE_FORM : editFormProps;

    const userSyncKey = useMemo(
        () => `${mode}-${user.id}-${user.email}`,
        [mode, user.id, user.email],
    );

    const defaults = useMemo(
        () => buildUserInfoFormDefaults(user, isCreateMode, createPrefill),
        [user, isCreateMode, createPrefill],
    );

    const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setPhotoPreviewUrl((prev) => {
                if (prev) {
                    URL.revokeObjectURL(prev);
                }
                return null;
            });
        }
    }, [isOpen]);

    const phoneFieldRef = useRef<PhoneNumberFieldHandle>(null);
    const phoneSyncKey = `${isOpen}-${userSyncKey}`;

    const validityProbeRef = useRef<HTMLInputElement>(null);
    const [phoneValid, setPhoneValid] = useState(false);
    const [formValid, setFormValid] = useState(false);
    const [createRoleFilled, setCreateRoleFilled] = useState(false);
    /** True when OrganisationAsyncField has a picked organisation_id (hidden input non-empty). Create + profile edit (hidden inputs skip HTML5 required). */
    const [organisationCommitted, setOrganisationCommitted] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setCreateRoleFilled(false);
            setOrganisationCommitted(false);
        }
    }, [isOpen]);

    useLayoutEffect(() => {
        if (!isOpen) {
            return;
        }
        // `input.form` reaches the parent <form>; checkValidity() reflects HTML5
        // required state across every named field rendered inside it.
        setFormValid(validityProbeRef.current?.form?.checkValidity() ?? false);
    }, [isOpen, userSyncKey, phoneValid]);

    const handleFormInput = useCallback((event: FormEvent<HTMLFormElement>) => {
        setFormValid(event.currentTarget.checkValidity());
    }, []);

    /** Hidden organisation_id cannot use HTML5 required; role uses hidden input on create — gate submit explicitly. */
    const cannotSubmit =
        !formValid ||
        !phoneValid ||
        !organisationCommitted ||
        (isCreateMode && !createRoleFilled);

    const handleFormSubmit = useCallback(
        (event: FormEvent<HTMLFormElement>) => {
            if (cannotSubmit) {
                event.preventDefault();
            }
        },
        [cannotSubmit],
    );

    const transformFormData = useCallback(
        (data: Record<string, FormDataConvertible>) => {
            const phoneNumber = phoneFieldRef.current?.getValue() ?? null;
            return buildUserInfoFormTransformPayload(data, {
                isCreateMode,
                phoneNumber,
            });
        },
        [isCreateMode],
    );

    const handleFormSuccess = useCallback(() => {
        const latestFlash = flashRef.current;
        if (latestFlash?.success || latestFlash?.error) {
            if (latestFlash.success) {
                toast.success(latestFlash.success, {
                    toastId: 'user-modal-flash-success',
                });
            } else if (latestFlash.error) {
                toast.error(latestFlash.error, {
                    toastId: 'user-modal-flash-error',
                });
            }
        }
        onClose();
    }, [isCreateMode, onClose]);

    const handleFormError = useCallback(
        (errors: Record<string, string | string[]>) => {
            const msg = firstContactValidationToastMessage(errors);

            if (isCreateMode) {
                toast.error(
                    msg ??
                        'Unable to send the invitation. Please check the form.',
                );
                return;
            }

            toast.error(
                msg ?? 'Unable to update your profile. Please check the form.',
            );
        },
        [isCreateMode],
    );

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) {
                    onClose();
                }
            }}
        >
            <DialogContent className="sm:max-w-[716px]">
                <DialogHeader>
                    <DialogTitle>{modalTitle}</DialogTitle>
                </DialogHeader>
                <Divider />

                {/* Create posts to BFF/API contact invite; edit uses session profile (Laravel auth — not used in BFF-only login). */}
                <Form
                    key={createFormKey}
                    {...formTargetProps}
                    transform={transformFormData}
                    options={{
                        preserveScroll: true,
                    }}
                    onSuccess={handleFormSuccess}
                    onError={handleFormError}
                    onSubmit={handleFormSubmit}
                    onInput={handleFormInput}
                    className="space-y-4"
                >
                    {({ processing, errors }) => (
                        <>
                            <input
                                ref={validityProbeRef}
                                type="hidden"
                                aria-hidden="true"
                            />
                            <UserInfoFormFields
                                user={user}
                                defaults={defaults}
                                errors={errors}
                                photoLabel={modeLabels.photoLabel}
                                photoUploadTitle={modeLabels.photoUploadTitle}
                                photoPreviewUrl={photoPreviewUrl}
                                setPhotoPreviewUrl={setPhotoPreviewUrl}
                                phoneFieldRef={phoneFieldRef}
                                phoneRawDefault={defaults.phone_number}
                                phoneSyncKey={phoneSyncKey}
                                onPhoneValidChange={setPhoneValid}
                                onCreateRoleFilledChange={
                                    isCreateMode
                                        ? setCreateRoleFilled
                                        : undefined
                                }
                                onOrganisationCommittedChange={
                                    setOrganisationCommitted
                                }
                                isProfileEdit={isProfileEdit}
                                modeLabels={modeLabels}
                            />

                            {isProfileEdit && (
                                <>
                                    <UserInfoOutOfOfficeFields
                                        isOpen={isOpen}
                                        syncKey={userSyncKey}
                                        initial={{
                                            out_of_office:
                                                defaults.out_of_office,
                                            out_of_office_start_date:
                                                defaults.out_of_office_start_date,
                                            out_of_office_end_date:
                                                defaults.out_of_office_end_date,
                                        }}
                                        errors={{
                                            out_of_office: errors.out_of_office,
                                            out_of_office_start_date:
                                                errors.out_of_office_start_date,
                                            out_of_office_end_date:
                                                errors.out_of_office_end_date,
                                        }}
                                    />
                                    <UserInfoPasswordChangeFields />
                                </>
                            )}

                            <Divider />
                            <DialogFooter className="gap-3 sm:gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onClose}
                                    disabled={processing}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing || cannotSubmit}
                                >
                                    {modeLabels.submitLabel}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

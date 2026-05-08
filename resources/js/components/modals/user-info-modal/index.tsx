import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import { UserInfoFormFields } from '@/components/modals/user-info-modal/form-fields';
import { UserInfoOutOfOfficeFields } from '@/components/modals/user-info-modal/out-of-office-fields';
import {
    buildUserInfoFormDefaults,
    buildUserInfoFormTransformPayload,
    firstContactValidationToastMessage,
    phoneRawToE164,
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
import {
    tryParsePhoneE164,
    type PhoneInputHandle,
} from '@/components/ui/phone-input';
import { type SharedData, type User } from '@/types';
import type { FormDataConvertible } from '@inertiajs/core';
import { Form, usePage } from '@inertiajs/react';
import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { toast } from 'react-toastify';
import Divider from '../../utils/divider';

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
    user?: User;
    mode?: UserInfoModalMode;
    title?: string;
    createPrefill?: CreateContactPrefill | null;
}

export default function UserInfoModal({
    isOpen,
    onClose,
    user: providedUser,
    mode = 'edit',
    title: providedTitle,
    createPrefill = null,
}: UserInfoModalProps) {
    const { auth } = usePage<SharedData>().props;
    const editFormProps = ProfileController.update.form();

    const user = providedUser ?? auth.user;
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

    const phoneInputRef = useRef<PhoneInputHandle>(null);
    const [phoneE164, setPhoneE164] = useState(() =>
        phoneRawToE164(defaults.phone_number),
    );

    useLayoutEffect(() => {
        if (!isOpen) {
            return;
        }
        setPhoneE164(phoneRawToE164(defaults.phone_number));
    }, [isOpen, userSyncKey, defaults.phone_number]);

    const transformFormData = useCallback(
        (data: Record<string, FormDataConvertible>) => {
            const phoneNumber =
                tryParsePhoneE164(
                    phoneInputRef.current?.getDisplayValue() ?? '',
                    'US',
                ) ?? '';
            return buildUserInfoFormTransformPayload(data, {
                isCreateMode,
                phoneNumber,
            });
        },
        [isCreateMode],
    );

    const handleFormSuccess = useCallback(() => {
        if (isCreateMode) {
            toast.success('Invitation email sent.');
        }
        onClose();
    }, [isCreateMode, onClose]);

    const handleFormError = useCallback(
        (errors: Record<string, string | string[]>) => {
            if (!isCreateMode) {
                return;
            }
            const msg = firstContactValidationToastMessage(errors);
            toast.error(
                msg ?? 'Unable to send the invitation. Please check the form.',
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
                    className="space-y-4"
                >
                    {({ processing, errors }) => (
                        <>
                            <UserInfoFormFields
                                user={user}
                                defaults={defaults}
                                errors={errors}
                                photoLabel={modeLabels.photoLabel}
                                photoUploadTitle={modeLabels.photoUploadTitle}
                                photoPreviewUrl={photoPreviewUrl}
                                setPhotoPreviewUrl={setPhotoPreviewUrl}
                                phoneInputRef={phoneInputRef}
                                phoneE164={phoneE164}
                                setPhoneE164={setPhoneE164}
                                isProfileEdit={isProfileEdit}
                                modeLabels={modeLabels}
                            />

                            {isProfileEdit && (
                                <UserInfoOutOfOfficeFields
                                    isOpen={isOpen}
                                    syncKey={userSyncKey}
                                    initial={{
                                        out_of_office: defaults.out_of_office,
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
                                <Button type="submit" disabled={processing}>
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

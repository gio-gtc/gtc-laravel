import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import DatePickerInput from '@/components/utils/date-picker-input';
import { useInitials } from '@/hooks/use-initials';
import { type SharedData, type User } from '@/types';
import { Form, usePage } from '@inertiajs/react';
import { Camera, HelpCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { UserAvatar } from '../ui/user-avatar';
import Divider from '../utils/divider';

function splitName(fullName: string) {
    const normalized = fullName.trim().replace(/\s+/g, ' ');
    if (!normalized) return { first: '', last: '' };

    const parts = normalized.split(' ');
    if (parts.length === 1) return { first: parts[0], last: '' };

    return {
        first: parts[0],
        last: parts.slice(1).join(' '),
    };
}

interface UserInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    user?: User;
    mode?: 'edit' | 'create';
    title?: string;
}

export default function UserInfoModal({
    isOpen,
    onClose,
    user: providedUser,
    mode = 'edit',
    title: providedTitle,
}: UserInfoModalProps) {
    const { auth } = usePage<SharedData>().props;
    const getInitials = useInitials();

    // Use provided user or fall back to auth.user
    const user = providedUser ?? auth.user;
    const isCreateMode = mode === 'create';
    const modalTitle =
        providedTitle ?? (isCreateMode ? 'Create Contact' : 'Profile');

    const defaults = useMemo(() => {
        if (isCreateMode) {
            return {
                first_name: '',
                last_name: '',
                organization: '',
                job_title: '',
                department: '',
                phone_number: '',
                about_me: '',
                out_of_office: false,
                out_of_office_start_date: '',
                out_of_office_end_date: '',
                permissions_level: '',
            };
        }

        const fallback = splitName(user.name ?? '');

        return {
            first_name:
                (user.first_name as string | undefined) ?? fallback.first,
            last_name: (user.last_name as string | undefined) ?? fallback.last,
            organization: (user.organization as string | undefined) ?? '',
            job_title: (user.job_title as string | undefined) ?? '',
            department: (user.department as string | undefined) ?? '',
            phone_number: (user.phone_number as string | undefined) ?? '',
            about_me: (user.about_me as string | undefined) ?? '',
            out_of_office: Boolean(user.out_of_office),
            out_of_office_start_date:
                (user.out_of_office_start_date as string | undefined) ?? '',
            out_of_office_end_date:
                (user.out_of_office_end_date as string | undefined) ?? '',
            permissions_level:
                (user.permissions_level as string | undefined) ?? 'Admin',
        };
    }, [user, isCreateMode]);

    const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
    const [outOfOfficeEnabled, setOutOfOfficeEnabled] = useState<boolean>(
        defaults.out_of_office,
    );
    const [outOfOfficeStartDate, setOutOfOfficeStartDate] = useState<string>(
        defaults.out_of_office_start_date,
    );
    const [outOfOfficeEndDate, setOutOfOfficeEndDate] = useState<string>(
        defaults.out_of_office_end_date,
    );

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[716px]">
                <DialogHeader>
                    <DialogTitle>{modalTitle}</DialogTitle>
                </DialogHeader>
                <Divider />
                <Form
                    {...ProfileController.update.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    onSuccess={onClose}
                    className="space-y-4"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <div className="space-y-4">
                                    <span className="inline-block text-center">
                                        <Label className="xs-gray-400-weight-400">
                                            {isCreateMode
                                                ? 'Photo'
                                                : 'Your Photo'}
                                        </Label>

                                        <div className="relative w-fit">
                                            <UserAvatar
                                                user={user}
                                                className="size-[88px] rounded-full border border-gray-100 p-0.5"
                                            />

                                            <label
                                                htmlFor="photo"
                                                className="absolute right-0 bottom-0 inline-flex cursor-pointer items-center justify-center rounded-full border bg-background p-1 text-gray-500 shadow-sm hover:bg-muted"
                                                title={
                                                    isCreateMode
                                                        ? 'Upload photo'
                                                        : 'Change photo'
                                                }
                                            >
                                                <Camera className="size-3" />
                                            </label>

                                            <input
                                                id="photo"
                                                name="photo"
                                                type="file"
                                                accept="image/*"
                                                className="sr-only"
                                                onChange={(e) => {
                                                    const file =
                                                        e.currentTarget
                                                            .files?.[0];
                                                    if (!file) return;

                                                    const url =
                                                        URL.createObjectURL(
                                                            file,
                                                        );
                                                    setPhotoPreviewUrl(url);
                                                }}
                                            />
                                        </div>

                                        <InputError message={errors.photo} />
                                    </span>
                                </div>

                                <div className="grid gap-2">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label
                                                className="xs-gray-700-weight-500"
                                                htmlFor="first_name"
                                            >
                                                First Name{' '}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </Label>
                                            <Input
                                                id="first_name"
                                                name="first_name"
                                                defaultValue={
                                                    defaults.first_name
                                                }
                                                autoComplete="given-name"
                                                placeholder="First name"
                                            />
                                            <InputError
                                                message={errors.first_name}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label
                                                className="xs-gray-700-weight-500"
                                                htmlFor="last_name"
                                            >
                                                Last Name{' '}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </Label>
                                            <Input
                                                id="last_name"
                                                name="last_name"
                                                defaultValue={
                                                    defaults.last_name
                                                }
                                                autoComplete="family-name"
                                                placeholder="Last name"
                                            />
                                            <InputError
                                                message={errors.last_name}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label
                                                className="xs-gray-700-weight-500"
                                                htmlFor="organization"
                                            >
                                                Organization{' '}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </Label>
                                            <Input
                                                id="organization"
                                                name="organization"
                                                defaultValue={
                                                    defaults.organization
                                                }
                                                placeholder="Organization"
                                            />
                                            <InputError
                                                message={errors.organization}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label
                                                className="xs-gray-700-weight-500"
                                                htmlFor="job_title"
                                            >
                                                Job Title
                                            </Label>
                                            <Input
                                                id="job_title"
                                                name="job_title"
                                                defaultValue={
                                                    defaults.job_title
                                                }
                                                placeholder="Job title"
                                            />
                                            <InputError
                                                message={errors.job_title}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label
                                                className="xs-gray-700-weight-500"
                                                htmlFor="email"
                                            >
                                                Email{' '}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                defaultValue={
                                                    isCreateMode
                                                        ? ''
                                                        : user.email
                                                }
                                                autoComplete="email"
                                                placeholder="Email"
                                                required
                                            />
                                            <InputError
                                                message={errors.email}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label
                                                className="xs-gray-700-weight-500"
                                                htmlFor="department"
                                            >
                                                Department or Team
                                            </Label>
                                            <Input
                                                id="department"
                                                name="department"
                                                defaultValue={
                                                    defaults.department
                                                }
                                                placeholder="Department or Team"
                                            />
                                            <InputError
                                                message={errors.department}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label
                                                className="xs-gray-700-weight-500"
                                                htmlFor="phone_number"
                                            >
                                                Phone Number{' '}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </Label>
                                            <Input
                                                id="phone_number"
                                                name="phone_number"
                                                defaultValue={
                                                    defaults.phone_number
                                                }
                                                autoComplete="tel"
                                                placeholder="Phone number"
                                            />
                                            <InputError
                                                message={errors.phone_number}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <div className="flex items-center gap-2">
                                                <Label
                                                    htmlFor="permissions_level"
                                                    className="text-xs font-medium text-gray-400"
                                                >
                                                    Permissions Level
                                                </Label>
                                                <HelpCircle className="size-3 text-gray-400" />
                                            </div>
                                            <Input
                                                id="permissions_level"
                                                name="permissions_level"
                                                defaultValue={
                                                    defaults.permissions_level
                                                }
                                                disabled={!isCreateMode}
                                                readOnly={!isCreateMode}
                                                placeholder={
                                                    isCreateMode
                                                        ? 'Select permissions level'
                                                        : undefined
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    className="xs-gray-700-weight-500"
                                    htmlFor="about_me"
                                >
                                    About Me
                                </Label>
                                <Textarea
                                    id="about_me"
                                    name="about_me"
                                    defaultValue={defaults.about_me}
                                    placeholder="Enter a description..."
                                    className="min-h-28"
                                />
                                <InputError message={errors.about_me} />
                            </div>

                            {!isCreateMode && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="hidden"
                                                name="out_of_office"
                                                value={
                                                    outOfOfficeEnabled
                                                        ? '1'
                                                        : '0'
                                                }
                                            />
                                            <button
                                                type="button"
                                                role="switch"
                                                aria-checked={
                                                    outOfOfficeEnabled
                                                }
                                                id="out_of_office"
                                                onClick={() =>
                                                    setOutOfOfficeEnabled(
                                                        (v) => !v,
                                                    )
                                                }
                                                className={[
                                                    'relative inline-flex h-4 w-8 items-center rounded-full transition-colors',
                                                    outOfOfficeEnabled
                                                        ? 'bg-brand-gtc-red'
                                                        : 'bg-muted',
                                                    'focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
                                                ].join(' ')}
                                            >
                                                <span
                                                    className={[
                                                        'inline-block h-3 w-3 transform rounded-full bg-background shadow-lg transition-transform',
                                                        outOfOfficeEnabled
                                                            ? 'translate-x-4.5'
                                                            : 'translate-x-1',
                                                    ].join(' ')}
                                                />
                                            </button>
                                            <Label
                                                htmlFor="out_of_office"
                                                className="sm-gray-700-weight-500 cursor-pointer"
                                            >
                                                Set Out of Office
                                            </Label>
                                        </div>
                                    </div>

                                    {outOfOfficeEnabled === true && (
                                        <div
                                            className={[
                                                'flex flex-wrap items-center gap-2',
                                                !outOfOfficeEnabled
                                                    ? 'pointer-events-none opacity-50'
                                                    : '',
                                            ].join(' ')}
                                        >
                                            <DatePickerInput
                                                id="ooo_start"
                                                name="out_of_office_start_date"
                                                label="First Day"
                                                value={outOfOfficeStartDate}
                                                onChange={(next) => {
                                                    setOutOfOfficeStartDate(
                                                        next,
                                                    );
                                                    if (!next) {
                                                        setOutOfOfficeEndDate(
                                                            '',
                                                        );
                                                    } else if (
                                                        outOfOfficeEndDate &&
                                                        outOfOfficeEndDate <
                                                            next
                                                    ) {
                                                        setOutOfOfficeEndDate(
                                                            next,
                                                        );
                                                    }
                                                }}
                                                forwardOnlyFromToday
                                                dialogTitle="Out of office start date"
                                                className="max-w-[150px]"
                                            />
                                            <DatePickerInput
                                                id="ooo_end"
                                                name="out_of_office_end_date"
                                                label="Last Day"
                                                value={outOfOfficeEndDate}
                                                onChange={setOutOfOfficeEndDate}
                                                minDate={
                                                    outOfOfficeStartDate ||
                                                    undefined
                                                }
                                                forwardOnlyFromToday
                                                dialogTitle="Out of office end date"
                                                className="max-w-[150px]"
                                                disabled={!outOfOfficeStartDate}
                                            />
                                        </div>
                                    )}

                                    <div className="grid gap-1">
                                        <InputError
                                            message={errors.out_of_office}
                                        />
                                        <InputError
                                            message={
                                                errors.out_of_office_start_date
                                            }
                                        />
                                        <InputError
                                            message={
                                                errors.out_of_office_end_date
                                            }
                                        />
                                    </div>
                                </div>
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
                                    {isCreateMode ? 'Create Contact' : 'Submit'}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

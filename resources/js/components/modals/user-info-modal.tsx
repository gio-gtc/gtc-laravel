import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { useInitials } from '@/hooks/use-initials';
import { type SharedData } from '@/types';
import { Form, usePage } from '@inertiajs/react';
import { Calendar, Camera, HelpCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
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

function formatDateLabel(value: string) {
    if (!value) return 'Select date';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Select date';
    return new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
    }).format(date);
}

export default function UserInfoModal({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
}) {
    const { auth } = usePage<SharedData>().props;
    const getInitials = useInitials();

    const defaults = useMemo(() => {
        const fallback = splitName(auth.user.name ?? '');

        return {
            first_name:
                (auth.user.first_name as string | undefined) ?? fallback.first,
            last_name:
                (auth.user.last_name as string | undefined) ?? fallback.last,
            organization: (auth.user.organization as string | undefined) ?? '',
            job_title: (auth.user.job_title as string | undefined) ?? '',
            department: (auth.user.department as string | undefined) ?? '',
            phone_number: (auth.user.phone_number as string | undefined) ?? '',
            about_me: (auth.user.about_me as string | undefined) ?? '',
            out_of_office: Boolean(auth.user.out_of_office),
            out_of_office_start_date:
                (auth.user.out_of_office_start_date as string | undefined) ??
                '',
            out_of_office_end_date:
                (auth.user.out_of_office_end_date as string | undefined) ?? '',
            permissions_level:
                (auth.user.permissions_level as string | undefined) ?? 'Admin',
        };
    }, [auth.user]);

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
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Profile</DialogTitle>
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
                                    <Label className="text-gray-400">
                                        Your Photo
                                    </Label>

                                    <div className="relative w-fit">
                                        <Avatar className="h-24 w-24 overflow-hidden rounded-full">
                                            <AvatarImage
                                                src={
                                                    photoPreviewUrl ??
                                                    auth.user.avatar ??
                                                    undefined
                                                }
                                                alt={auth.user.name}
                                            />
                                            <AvatarFallback className="rounded-full bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                                {getInitials(auth.user.name)}
                                            </AvatarFallback>
                                        </Avatar>

                                        <label
                                            htmlFor="photo"
                                            className="absolute right-0 bottom-0 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border bg-background shadow-sm hover:bg-muted"
                                            title="Change photo"
                                        >
                                            <Camera className="h-4 w-4" />
                                        </label>

                                        <input
                                            id="photo"
                                            name="photo"
                                            type="file"
                                            accept="image/*"
                                            className="sr-only"
                                            onChange={(e) => {
                                                const file =
                                                    e.currentTarget.files?.[0];
                                                if (!file) return;

                                                const url =
                                                    URL.createObjectURL(file);
                                                setPhotoPreviewUrl(url);
                                            }}
                                        />
                                    </div>

                                    <InputError message={errors.photo} />
                                </div>

                                <div className="grid gap-2">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="first_name">
                                                First Name{' '}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </Label>
                                            <Input
                                                className="border-gray-300"
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
                                            <Label htmlFor="last_name">
                                                Last Name{' '}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </Label>
                                            <Input
                                                className="border-gray-300"
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
                                            <Label htmlFor="organization">
                                                Organization{' '}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </Label>
                                            <Input
                                                className="border-gray-300"
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
                                            <Label htmlFor="job_title">
                                                Job Title
                                            </Label>
                                            <Input
                                                className="border-gray-300"
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
                                            <Label htmlFor="email">
                                                Email{' '}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </Label>
                                            <Input
                                                className="border-gray-300"
                                                id="email"
                                                name="email"
                                                type="email"
                                                defaultValue={auth.user.email}
                                                autoComplete="email"
                                                placeholder="Email"
                                                required
                                            />
                                            <InputError
                                                message={errors.email}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="department">
                                                Department or Team
                                            </Label>
                                            <Input
                                                className="border-gray-300"
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
                                            <Label htmlFor="phone_number">
                                                Phone Number{' '}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </Label>
                                            <Input
                                                className="border-gray-300"
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
                                                <Label htmlFor="permissions_level">
                                                    Permissions Level
                                                </Label>
                                                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <Input
                                                className="border-gray-300"
                                                id="permissions_level"
                                                value={
                                                    defaults.permissions_level
                                                }
                                                disabled
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="about_me">About Me</Label>
                                <textarea
                                    id="about_me"
                                    name="about_me"
                                    defaultValue={defaults.about_me}
                                    placeholder="Enter a description..."
                                    className="flex min-h-28 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-base shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm"
                                />
                                <InputError message={errors.about_me} />
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="hidden"
                                            name="out_of_office"
                                            value={
                                                outOfOfficeEnabled ? '1' : '0'
                                            }
                                        />
                                        <button
                                            type="button"
                                            role="switch"
                                            aria-checked={outOfOfficeEnabled}
                                            id="out_of_office"
                                            onClick={() =>
                                                setOutOfOfficeEnabled((v) => !v)
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
                                            className="cursor-pointer"
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
                                        <input
                                            type="hidden"
                                            name="out_of_office_start_date"
                                            value={
                                                outOfOfficeEnabled
                                                    ? outOfOfficeStartDate
                                                    : ''
                                            }
                                        />
                                        <input
                                            type="hidden"
                                            name="out_of_office_end_date"
                                            value={
                                                outOfOfficeEnabled
                                                    ? outOfOfficeEndDate
                                                    : ''
                                            }
                                        />

                                        <span className="flex flex-col">
                                            <label htmlFor="ooo_start">
                                                First Day
                                            </label>
                                            <label
                                                className="sr-only"
                                                htmlFor="ooo_start"
                                            >
                                                Out of office start date
                                            </label>
                                            <input
                                                id="ooo_start"
                                                type="date"
                                                className="sr-only"
                                                value={outOfOfficeStartDate}
                                                onChange={(e) => {
                                                    const next =
                                                        e.currentTarget.value;
                                                    setOutOfOfficeStartDate(
                                                        next,
                                                    );
                                                    if (
                                                        outOfOfficeEndDate &&
                                                        next &&
                                                        outOfOfficeEndDate <
                                                            next
                                                    ) {
                                                        setOutOfOfficeEndDate(
                                                            next,
                                                        );
                                                    }
                                                }}
                                            />

                                            <label
                                                className="sr-only"
                                                htmlFor="ooo_end"
                                            >
                                                Out of office end date
                                            </label>
                                            <input
                                                id="ooo_end"
                                                type="date"
                                                className="sr-only"
                                                value={outOfOfficeEndDate}
                                                onChange={(e) =>
                                                    setOutOfOfficeEndDate(
                                                        e.currentTarget.value,
                                                    )
                                                }
                                                min={
                                                    outOfOfficeStartDate ||
                                                    undefined
                                                }
                                            />

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const el =
                                                        document.getElementById(
                                                            'ooo_start',
                                                        ) as HTMLInputElement | null;
                                                    el?.showPicker?.();
                                                    el?.focus();
                                                    el?.click();
                                                }}
                                                className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-background px-3 py-1 text-sm hover:bg-muted"
                                            >
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                {formatDateLabel(
                                                    outOfOfficeStartDate,
                                                )}
                                            </button>
                                        </span>

                                        <span className="flex flex-col">
                                            <label htmlFor="ooo_start">
                                                Last Day
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const el =
                                                        document.getElementById(
                                                            'ooo_end',
                                                        ) as HTMLInputElement | null;
                                                    el?.showPicker?.();
                                                    el?.focus();
                                                    el?.click();
                                                }}
                                                className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-background px-3 py-1 text-sm hover:bg-muted"
                                            >
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                {formatDateLabel(
                                                    outOfOfficeEndDate,
                                                )}
                                            </button>
                                        </span>
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
                                        message={errors.out_of_office_end_date}
                                    />
                                </div>
                            </div>

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
                                    disabled={processing}
                                    className="bg-brand-gtc-red"
                                >
                                    Submit
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

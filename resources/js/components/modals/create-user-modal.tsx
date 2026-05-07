import InputError from '@/components/input-error';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import Divider from '@/components/utils/divider';
import { ModalFooterActions } from '@/components/utils/modal-footer-actions';
import { useForm } from '@inertiajs/react';
import { toast } from 'react-toastify';

export interface CreateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
}

function firstValidationToastMessage(
    errs: Record<string, string | string[]>,
): string | undefined {
    for (const value of Object.values(errs)) {
        if (Array.isArray(value) && value.length > 0 && value[0]) {
            return value[0];
        }
        if (typeof value === 'string' && value !== '') {
            return value;
        }
    }
    return undefined;
}

export default function CreateUserModal({
    isOpen,
    onClose,
}: CreateUserModalProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        first_name: '',
        last_name: '',
        email: '',
        organisation: '',
    });

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) {
                    reset();
                    onClose();
                }
            }}
        >
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>Create user</DialogTitle>
                </DialogHeader>

                <Divider />
                <form
                    className="space-y-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        post('/admin/users/invite', {
                            preserveScroll: true,
                            onSuccess: () => {
                                toast.success('User invited successfully');
                                reset();
                                onClose();
                            },
                            onError: (errs) => {
                                const msg = firstValidationToastMessage(errs);
                                toast.error(
                                    msg ??
                                        'Could not invite user. Please check the form.',
                                );
                            },
                        });
                    }}
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2 sm:col-span-1">
                            <Label htmlFor="create-user-first-name">
                                First name
                            </Label>
                            <Input
                                id="create-user-first-name"
                                name="first_name"
                                value={data.first_name}
                                autoComplete="given-name"
                                onChange={(e) =>
                                    setData('first_name', e.target.value)
                                }
                                required
                            />
                            <InputError message={errors.first_name} />
                        </div>
                        <div className="grid gap-2 sm:col-span-1">
                            <Label htmlFor="create-user-last-name">
                                Last name
                            </Label>
                            <Input
                                id="create-user-last-name"
                                name="last_name"
                                value={data.last_name}
                                autoComplete="family-name"
                                onChange={(e) =>
                                    setData('last_name', e.target.value)
                                }
                                required
                            />
                            <InputError message={errors.last_name} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="create-user-email">Email</Label>
                        <Input
                            id="create-user-email"
                            type="email"
                            name="email"
                            value={data.email}
                            autoComplete="email"
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="create-user-organisation">
                            Organisation
                        </Label>
                        <Input
                            id="create-user-organisation"
                            name="organisation"
                            value={data.organisation}
                            autoComplete="organisation"
                            onChange={(e) =>
                                setData('organisation', e.target.value)
                            }
                            required
                        />
                        <InputError message={errors.organisation} />
                    </div>

                    <Divider />
                    <ModalFooterActions
                        onCancel={() => {
                            reset();
                            onClose();
                        }}
                        confirmLabel={
                            <>
                                {processing && <Spinner />}
                                Send invitation
                            </>
                        }
                        confirmDisabled={processing}
                        confirmClassName="inline-flex items-center gap-2"
                    />
                </form>
            </DialogContent>
        </Dialog>
    );
}

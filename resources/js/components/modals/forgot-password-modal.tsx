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
import type { Dispatch, SetStateAction } from 'react';
import { toast } from 'react-toastify';

export interface ForgotPasswordModalProps {
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
}

export default function ForgotPasswordModal({
    isOpen,
    setIsOpen,
}: ForgotPasswordModalProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
    });

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                setIsOpen(open);
                if (!open) {
                    reset();
                }
            }}
        >
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle>Forgot your password?</DialogTitle>
                </DialogHeader>

                <Divider />
                <form
                    className="space-y-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        post('/forgot-password', {
                            preserveScroll: true,
                            onSuccess: (page) => {
                                const status = page.props.status;
                                toast.success(
                                    typeof status === 'string' && status
                                        ? status
                                        : 'If an account exists for that email, we sent a reset link.',
                                );
                                setIsOpen(false);
                                reset();
                            },
                            onError: (errs) => {
                                const raw = errs.email;
                                const msg = Array.isArray(raw)
                                    ? raw[0]
                                    : typeof raw === 'string'
                                      ? raw
                                      : undefined;
                                toast.error(
                                    typeof msg === 'string' && msg
                                        ? msg
                                        : 'Something went wrong. Please try again.',
                                );
                            },
                        });
                    }}
                >
                    <div className="grid gap-2">
                        <Label htmlFor="forgot-email">Email address</Label>
                        <Input
                            id="forgot-email"
                            type="email"
                            name="email"
                            value={data.email}
                            autoComplete="email"
                            placeholder="email@example.com"
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />
                        <InputError message={errors.email} />
                    </div>

                    <Divider />
                    <ModalFooterActions
                        onCancel={() => {
                            setIsOpen(false);
                            reset();
                        }}
                        confirmLabel={
                            <>
                                {processing && <Spinner />}
                                Send reset link
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

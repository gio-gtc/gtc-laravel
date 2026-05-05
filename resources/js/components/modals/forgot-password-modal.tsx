import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useForm } from '@inertiajs/react';
import type { Dispatch, SetStateAction } from 'react';

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
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Forgot your password?</DialogTitle>
                    <DialogDescription>
                        Enter your email address and we will send you a link to
                        choose a new password.
                    </DialogDescription>
                </DialogHeader>

                <form
                    className="grid gap-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        post('/forgot-password', {
                            onSuccess: () => {
                                setIsOpen(false);
                                reset();
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

                    <Button
                        type="submit"
                        disabled={processing}
                        className="w-full"
                    >
                        {processing && <Spinner />}
                        Send reset link
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

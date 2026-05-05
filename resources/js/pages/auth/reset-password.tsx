import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthSimpleLayout from '@/layouts/auth/auth-simple-layout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface ResetPasswordProps {
    token: string;
    email: string;
}

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    // 1. Initialize Inertia's useForm with the props passed from the email URL
    const { data, setData, post, processing, errors } = useForm({
        token: token || '',
        email: email || '',
        password: '',
        password_confirmation: '',
    });

    // 2. Submit handler
    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        // Use the literal string to avoid route name collisions
        post('/reset-password');
    };

    return (
        <AuthSimpleLayout
            title="Reset Password"
            description="Please enter and confirm your new password below."
        >
            <Head title="Reset Password" />

            <form onSubmit={submit} className="mt-4 space-y-6">
                {/* Read-only email field so the user knows which account is being reset */}
                <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        readOnly
                        className="cursor-not-allowed bg-muted opacity-70"
                    />
                    {errors.email && (
                        <p className="text-sm text-red-600">{errors.email}</p>
                    )}
                </div>

                {/* New Password Field */}
                <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <Input
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        required
                        autoFocus
                    />
                    {errors.password && (
                        <p className="text-sm text-red-600">
                            {errors.password}
                        </p>
                    )}
                </div>

                {/* Password Confirmation Field */}
                <div className="space-y-2">
                    <Label htmlFor="password_confirmation">
                        Confirm Password
                    </Label>
                    <Input
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        required
                    />
                    {errors.password_confirmation && (
                        <p className="text-sm text-red-600">
                            {errors.password_confirmation}
                        </p>
                    )}
                </div>

                {/* Submit Button */}
                <Button type="submit" className="w-full" disabled={processing}>
                    {processing ? 'Resetting Password...' : 'Reset Password'}
                </Button>
            </form>
        </AuthSimpleLayout>
    );
}

import LoginSignupFlip, {
    type AuthFace,
} from '@/components/auth/login-signup-flip';
import ForgotPasswordModal from '@/components/modals/forgot-password-modal';
import AuthVideoLayout from '@/layouts/auth/auth-video-layout';
import type { SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';

interface LoginProps {
    status?: string | null;
    error?: string | null;
    authFaceHint?: 'signup' | null;
}

const REQUEST_ACCESS_ERROR_KEYS = [
    'first_name',
    'last_name',
    'email',
    'company',
    'job_title',
    'phone',
    'details',
] as const;

function needsSignupFace(errors: Record<string, unknown> | undefined): boolean {
    if (!errors) {
        return false;
    }
    return REQUEST_ACCESS_ERROR_KEYS.some((key) => key in errors);
}

export default function Login({ status, error, authFaceHint }: LoginProps) {
    const errors = usePage<SharedData & { errors?: Record<string, unknown> }>()
        .props.errors;

    const [face, setFace] = useState<AuthFace>(() =>
        authFaceHint === 'signup' || needsSignupFace(errors)
            ? 'signup'
            : 'login',
    );
    const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

    return (
        <AuthVideoLayout
            contentMaxWidthClass={
                face === 'signup' ? 'max-w-[350px] md:max-w-3xl' : undefined
            }
        >
            <Head title={face === 'login' ? 'Log in' : 'Request access'} />

            {status ? (
                <div className="mb-4 rounded-lg border border-white/15 bg-white/10 px-4 py-3 text-center text-sm font-medium text-white backdrop-blur">
                    {status}
                </div>
            ) : null}

            {error ? (
                <div className="mb-4 rounded-lg border border-red-400/40 bg-red-950/40 px-4 py-3 text-center text-sm font-medium text-red-100 backdrop-blur">
                    {error}
                </div>
            ) : null}

            <LoginSignupFlip
                face={face}
                onFaceChange={setFace}
                onOpenForgotPassword={() => setIsForgotModalOpen(true)}
            />

            <ForgotPasswordModal
                isOpen={isForgotModalOpen}
                setIsOpen={setIsForgotModalOpen}
            />
        </AuthVideoLayout>
    );
}

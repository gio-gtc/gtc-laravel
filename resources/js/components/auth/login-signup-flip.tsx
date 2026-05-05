import {
    authFlipFaceShellClass,
    authFlipLoginCardClass,
    authFlipSignupCardClass,
} from '@/components/auth/auth-flip-classes';
import AuthLoginPanel from '@/components/auth/auth-login-panel';
import AuthSignupPanel from '@/components/auth/auth-signup-panel';
import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';

export type AuthFace = 'login' | 'signup';

export interface LoginSignupFlipProps {
    face: AuthFace;
    onFaceChange: (face: AuthFace) => void;
    onOpenForgotPassword: () => void;
}

export default function LoginSignupFlip({
    face,
    onFaceChange,
    onOpenForgotPassword,
}: LoginSignupFlipProps) {
    const loginEmailRef = useRef<HTMLInputElement>(null);
    const signupFirstNameRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const id = requestAnimationFrame(() => {
            if (face === 'login') {
                loginEmailRef.current?.focus();
            } else {
                signupFirstNameRef.current?.focus();
            }
        });
        return () => cancelAnimationFrame(id);
    }, [face]);

    return (
        <div className="[perspective:1000px]">
            <div
                className={cn(
                    'relative min-h-[52rem] [transform-style:preserve-3d] motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out',
                    face === 'signup' && '[transform:rotateY(180deg)]',
                )}
            >
                <div
                    className={cn(
                        authFlipFaceShellClass,
                        '[transform:translateZ(1px)]',
                        face !== 'login' && 'pointer-events-none',
                    )}
                    aria-hidden={face !== 'login'}
                    inert={face !== 'login'}
                >
                    <div className="flex h-full w-full items-center justify-center">
                        <div className={authFlipLoginCardClass}>
                            <AuthLoginPanel
                                emailInputRef={loginEmailRef}
                                onOpenForgotPassword={onOpenForgotPassword}
                                onRequestSignup={() => onFaceChange('signup')}
                            />
                        </div>
                    </div>
                </div>

                <div
                    className={cn(
                        authFlipFaceShellClass,
                        '[transform:rotateY(180deg)_translateZ(1px)] overflow-y-auto',
                        face !== 'signup' && 'pointer-events-none',
                    )}
                    aria-hidden={face !== 'signup'}
                    inert={face !== 'signup'}
                >
                    <div className={authFlipSignupCardClass}>
                        <AuthSignupPanel
                            firstNameInputRef={signupFirstNameRef}
                            onRequestLogin={() => onFaceChange('login')}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

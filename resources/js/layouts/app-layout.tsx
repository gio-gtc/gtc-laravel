import AppLayoutTemplate from '@/layouts/app/app-header-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect, type ReactNode } from 'react';
import { toast } from 'react-toastify';

type FlashShape = { success?: string | null; error?: string | null };

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => {
    const { flash } = usePage<SharedData & { flash?: FlashShape }>().props;

    // Surface server-side flashes (e.g. the email-verified redirect from
    // ProfileController@edit) as toasts on any authenticated page.
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success, { toastId: 'flash-success' });
        }
        if (flash?.error) {
            toast.error(flash.error, { toastId: 'flash-error' });
        }
    }, [flash?.success, flash?.error]);

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            {children}
        </AppLayoutTemplate>
    );
};

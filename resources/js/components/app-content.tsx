import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import * as React from 'react';
import { AppSidebar } from './app-sidebar';

interface AppContentProps extends React.ComponentProps<'main'> {
    variant?: 'header' | 'sidebar';
}

export function AppContent({
    variant = 'header',
    children,
    ...props
}: AppContentProps) {
    // if (variant === 'sidebar') {
    //     return <SidebarInset {...props}>{children}</SidebarInset>;
    // }

    return (
        <div className='flex min-h-screen h-full'>
            <AppSidebar />
            <main
                className="mx-auto flex min-h-screen h-full w-full max-w-7xl flex-1 flex-col gap-4 rounded-xl"
                {...props}
                >
                    {children}
            </main>
        </div>
    );
}

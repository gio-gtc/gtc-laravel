import * as React from 'react';
import { AppSidebar } from './app-sidebar';

interface AppContentProps extends React.ComponentProps<'main'> {
    variant?: 'header' | 'sidebar';
}

export function AppContent({ children, ...props }: AppContentProps) {
    return (
        <div className="flex min-h-screen">
            <AppSidebar />
            <main
                className="mx-auto flex min-h-screen w-full flex-1 flex-col gap-4 rounded-xl px-6.5 py-7"
                {...props}
            >
                {children}
            </main>
        </div>
    );
}

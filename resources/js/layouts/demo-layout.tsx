import { Head } from '@inertiajs/react';
import { type ReactNode } from 'react';

export default function DemoLayout({
    children,
    title,
}: {
    children: ReactNode;
    title?: string;
}) {
    return (
        <>
            {title ? <Head title={title} /> : null}
            <div className="demo-root fixed inset-0 overflow-hidden bg-black">
                {children}
            </div>
        </>
    );
}

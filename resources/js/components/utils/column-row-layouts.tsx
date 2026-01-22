import { Label } from '@/components/ui/label';

export function ColumnedRowsParent({
    children,
}: {
    children: React.ReactNode;
}) {
    return <div className="flex flex-1 flex-col gap-2">{children}</div>;
}

export function ColumnedRowsChild({
    children,
    labelFor,
    labelContent,
}: {
    children: React.ReactNode;
    labelFor?: string;
    labelContent?: string;
}) {
    return (
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
            {labelFor && labelContent ? (
                <Label className="sm:flex-1" htmlFor={labelFor}>
                    {labelContent}
                </Label>
            ) : (
                ''
            )}
            <div className="sm:flex-2">{children}</div>
        </div>
    );
}

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
    required,
}: {
    children: React.ReactNode;
    labelFor?: string;
    labelContent?: string;
    required?: boolean;
}) {
    return (
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
            {labelFor && labelContent ? (
                <Label className="sm:flex-1" htmlFor={labelFor}>
                    {labelContent}{' '}
                    {required && <span className="text-destructive">*</span>}
                </Label>
            ) : (
                ''
            )}
            <div className="sm:flex-2">{children}</div>
        </div>
    );
}

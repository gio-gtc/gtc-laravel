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
    multiInput,
    labelClassName = '',
}: {
    children: React.ReactNode;
    labelFor?: string;
    labelContent?: React.ReactNode;
    required?: boolean;
    /** When true, child container uses flex-col gap-4 for multiple inputs. */
    multiInput?: boolean;
    labelClassName?: string;
}) {
    const childClassName = multiInput
        ? 'flex flex-col gap-2 sm:flex-2'
        : 'sm:flex-2';
    return (
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
            {labelFor && labelContent ? (
                <Label
                    className={`sm-black-weight-500 sm:flex-1 ${labelClassName}`}
                    htmlFor={labelFor}
                >
                    {labelContent}
                    {required && (
                        <span className="ml-0.5 text-destructive">*</span>
                    )}
                </Label>
            ) : (
                ''
            )}
            <div className={childClassName}>{children}</div>
        </div>
    );
}

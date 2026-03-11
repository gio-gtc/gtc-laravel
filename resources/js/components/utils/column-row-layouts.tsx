import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export function ColumnedRowsParent({
    children,
}: {
    children: React.ReactNode;
}) {
    return <div className="flex flex-1 flex-col gap-2">{children}</div>;
}

export function ColumnedRowsChild({
    children,
    childrenContainerClasses = '',
    labelFor,
    labelContent,
    required,
    multiInput,
    labelClassName = '',
    subLabelContent,
    labelLocation = 'modal',
}: {
    children: React.ReactNode;
    childrenContainerClasses?: string;
    labelFor: string;
    labelContent: React.ReactNode;
    required?: boolean;
    /** When true, child container uses flex-col gap-4 for multiple inputs. */
    multiInput?: boolean;
    labelClassName?: string;
    subLabelContent?: string;
    labelLocation?: 'modal' | 'other';
}) {
    const labelLocationClasses =
        labelLocation === 'modal'
            ? 'sm-gray-700-weight-600'
            : 'sm-black-weight-500';

    const childClassName = multiInput
        ? 'flex flex-col gap-2 sm:flex-2'
        : 'sm:flex-2';

    return (
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
            {labelFor && labelContent ? (
                <Label
                    className={`${labelLocationClasses} sm:flex-1 ${labelClassName}`}
                    htmlFor={labelFor}
                >
                    {labelContent}
                    {required && (
                        <span className="ml-0.5 text-destructive">*</span>
                    )}
                    {subLabelContent && (
                        <p className="mt-1 font-normal text-gray-600">
                            {subLabelContent}
                        </p>
                    )}
                </Label>
            ) : (
                ''
            )}
            <div className={cn(childClassName, childrenContainerClasses)}>
                {children}
            </div>
        </div>
    );
}

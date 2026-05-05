import { FieldLabel } from '@/components/ui/field-label';
import { cn } from '@/lib/utils';

export function ColumnedRowsParent({
    className = '',
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <div className={cn('flex flex-1 flex-col gap-2', className)}>
            {children}
        </div>
    );
}

export function ColumnedRowsChild({
    children,
    childrenContainerClasses = '',
    labelFor,
    labelContent,
    required,
    multiInput,
    className = '',
    labelClassName = '',
    subLabelContent,
    labelLocation = 'modal',
}: {
    children: React.ReactNode;
    childrenContainerClasses?: string;
    labelFor: string;
    labelContent: React.ReactNode;
    required?: boolean;
    multiInput?: boolean;
    className?: string;
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
        <div
            className={cn(
                'flex flex-col gap-2 sm:flex-row sm:justify-between',
                className,
            )}
        >
            {labelFor && labelContent ? (
                <div className={cn('sm:flex-1', labelClassName)}>
                    <FieldLabel
                        className={labelLocationClasses}
                        htmlFor={labelFor}
                        required={required}
                    >
                        {labelContent}
                    </FieldLabel>
                    {subLabelContent ? (
                        <p className="mt-1 font-normal text-gray-600">
                            {subLabelContent}
                        </p>
                    ) : null}
                </div>
            ) : (
                ''
            )}
            <div className={cn(childClassName, childrenContainerClasses)}>
                {children}
            </div>
        </div>
    );
}

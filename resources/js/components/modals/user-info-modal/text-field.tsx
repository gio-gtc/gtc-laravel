import InputError from '@/components/input-error';
import { FieldLabel } from '@/components/ui/field-label';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ComponentProps } from 'react';

const labelClass = 'xs-gray-700-weight-500';

type InputProps = Omit<
    ComponentProps<typeof Input>,
    'id' | 'name' | 'defaultValue'
>;

export type UserInfoTextFieldProps = InputProps & {
    id: string;
    name: string;
    label: string;
    defaultValue: string;
    error?: string;
    /** Use {@link FieldLabel} (required indicator) vs plain {@link Label}. */
    labelVariant?: 'field' | 'plain';
    required?: boolean;
};

export function UserInfoTextField({
    id,
    name,
    label,
    defaultValue,
    error,
    labelVariant = 'field',
    required,
    ...inputProps
}: UserInfoTextFieldProps) {
    const labelNode =
        labelVariant === 'field' ? (
            <FieldLabel className={labelClass} htmlFor={id} required={required}>
                {label}
            </FieldLabel>
        ) : (
            <Label className={labelClass} htmlFor={id}>
                {label}
            </Label>
        );

    return (
        <div className="grid gap-2">
            {labelNode}
            <Input
                id={id}
                name={name}
                defaultValue={defaultValue}
                required={required}
                {...inputProps}
            />
            <InputError message={error} />
        </div>
    );
}

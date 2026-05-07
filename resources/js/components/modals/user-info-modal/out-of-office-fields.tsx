import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import DatePickerInput from '@/components/utils/date-picker-input';
import { useEffect, useState } from 'react';

export type UserInfoOutOfOfficeErrors = {
    out_of_office?: string;
    out_of_office_start_date?: string;
    out_of_office_end_date?: string;
};

export type UserInfoOutOfOfficeInitial = {
    out_of_office: boolean;
    out_of_office_start_date: string;
    out_of_office_end_date: string;
};

interface UserInfoOutOfOfficeFieldsProps {
    isOpen: boolean;
    /** When this changes (e.g. user or mode), fields reset from `initial`. */
    syncKey: string;
    initial: UserInfoOutOfOfficeInitial;
    errors: UserInfoOutOfOfficeErrors;
}

export function UserInfoOutOfOfficeFields({
    isOpen,
    syncKey,
    initial,
    errors,
}: UserInfoOutOfOfficeFieldsProps) {
    const [outOfOfficeEnabled, setOutOfOfficeEnabled] = useState(
        initial.out_of_office,
    );
    const [outOfOfficeStartDate, setOutOfOfficeStartDate] = useState(
        initial.out_of_office_start_date,
    );
    const [outOfOfficeEndDate, setOutOfOfficeEndDate] = useState(
        initial.out_of_office_end_date,
    );

    useEffect(() => {
        if (!isOpen) {
            return;
        }
        setOutOfOfficeEnabled(initial.out_of_office);
        setOutOfOfficeStartDate(initial.out_of_office_start_date);
        setOutOfOfficeEndDate(initial.out_of_office_end_date);
    }, [
        isOpen,
        syncKey,
        initial.out_of_office,
        initial.out_of_office_start_date,
        initial.out_of_office_end_date,
    ]);

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <input
                        type="hidden"
                        name="out_of_office"
                        value={outOfOfficeEnabled ? '1' : '0'}
                    />
                    <button
                        type="button"
                        role="switch"
                        aria-checked={outOfOfficeEnabled}
                        id="out_of_office"
                        onClick={() => setOutOfOfficeEnabled((v) => !v)}
                        className={[
                            'relative inline-flex h-4 w-8 items-center rounded-full transition-colors',
                            outOfOfficeEnabled
                                ? 'bg-brand-gtc-red'
                                : 'bg-muted',
                            'focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
                        ].join(' ')}
                    >
                        <span
                            className={[
                                'inline-block h-3 w-3 transform rounded-full bg-background shadow-lg transition-transform',
                                outOfOfficeEnabled
                                    ? 'translate-x-4.5'
                                    : 'translate-x-1',
                            ].join(' ')}
                        />
                    </button>
                    <Label
                        htmlFor="out_of_office"
                        className="sm-gray-700-weight-500 cursor-pointer"
                    >
                        Set Out of Office
                    </Label>
                </div>
            </div>

            {outOfOfficeEnabled === true && (
                <div
                    className={[
                        'flex flex-wrap items-center gap-2',
                        !outOfOfficeEnabled
                            ? 'pointer-events-none opacity-50'
                            : '',
                    ].join(' ')}
                >
                    <DatePickerInput
                        id="ooo_start"
                        name="out_of_office_start_date"
                        label="First Day"
                        value={outOfOfficeStartDate}
                        onChange={(next) => {
                            setOutOfOfficeStartDate(next);
                            if (!next) {
                                setOutOfOfficeEndDate('');
                            } else if (
                                outOfOfficeEndDate &&
                                outOfOfficeEndDate < next
                            ) {
                                setOutOfOfficeEndDate(next);
                            }
                        }}
                        forwardOnlyFromToday
                        dialogTitle="Out of office start date"
                        className="max-w-[150px]"
                    />
                    <DatePickerInput
                        id="ooo_end"
                        name="out_of_office_end_date"
                        label="Last Day"
                        value={outOfOfficeEndDate}
                        onChange={setOutOfOfficeEndDate}
                        minDate={outOfOfficeStartDate || undefined}
                        forwardOnlyFromToday
                        dialogTitle="Out of office end date"
                        className="max-w-[150px]"
                        disabled={!outOfOfficeStartDate}
                    />
                </div>
            )}

            <div className="grid gap-1">
                <InputError message={errors.out_of_office} />
                <InputError message={errors.out_of_office_start_date} />
                <InputError message={errors.out_of_office_end_date} />
            </div>
        </div>
    );
}

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Dispatch, SetStateAction, useState, type ReactNode } from 'react';

interface SwitchViewProps {
    switchedView: ReactNode;
    defaultView?: ReactNode;
    defaultToSwitched?: boolean;
}

export default function SwitchView({
    switchedView,
    defaultView,
    defaultToSwitched = false,
}: SwitchViewProps) {
    const [isSwitched, setIsSwitched] = useState(defaultToSwitched);

    return (
        <div className="space-y-4">
            <div className="flex gap-1 rounded-lg bg-neutral-100 p-1">
                <SwitchButton
                    title="General Media"
                    active={!isSwitched}
                    setIsSwitched={setIsSwitched}
                />
                <SwitchButton
                    title="Local Art"
                    active={isSwitched}
                    setIsSwitched={setIsSwitched}
                />
            </div>
            <div className="slide-out-container">
                {isSwitched ? switchedView : defaultView}
            </div>
        </div>
    );
}

function SwitchButton({
    title,
    active,
    setIsSwitched,
}: {
    title: string;
    active: boolean;
    setIsSwitched: Dispatch<SetStateAction<boolean>>;
}) {
    const activeClasses = active
        ? 'bg-white shadow-xs'
        : 'text-neutral-500 hover:bg-neutral-200/60 hover:text-black';
    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSwitched((prevState) => !prevState)}
            className={cn(
                'flex items-center rounded-md px-3.5 py-1.5 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none',
                activeClasses,
            )}
        >
            {title}
        </Button>
    );
}

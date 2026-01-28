import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Dispatch, SetStateAction, useState } from 'react';
import GeneralMediaView from './general-media';
import LocalArtView from './local-art';

interface SwitchViewProps {
    defaultToSwitched?: boolean;
}

export default function SwitchView({
    defaultToSwitched = false,
}: SwitchViewProps) {
    const [isSwitched, setIsSwitched] = useState(defaultToSwitched);

    return (
        <>
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
            {isSwitched ? <LocalArtView /> : <GeneralMediaView />}
        </>
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

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { type Tour, type TourVenue, type Venue } from '@/types';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import GeneralMediaView from './general-media';
import LocalArtView from './local-art';

interface SwitchViewProps {
    order: Tour | null;
    venueItem: { orderVenue: TourVenue; venue: Venue | null } | null;
    selectedRowIds: ReadonlySet<string | number>;
    onToggleRowSelection: (rowId: string | number) => void;
    onClearSelection: () => void;
    onOpenAttachModal?: (context?: {
        rowId: string | number;
        isci: string;
    }) => void;
}

export default function SwitchView({
    order,
    venueItem,
    selectedRowIds,
    onToggleRowSelection,
    onClearSelection,
    onOpenAttachModal,
}: SwitchViewProps) {
    const [selected, setSelected] = useState<'local' | 'generic'>('generic');

    useEffect(() => {
        onClearSelection();
    }, [selected, onClearSelection]);

    return (
        <>
            <div className="flex gap-1 rounded-lg border bg-neutral-100 p-1">
                <SwitchButton
                    title="General Media"
                    selected={selected}
                    value={'generic'}
                    setSelected={setSelected}
                />
                <SwitchButton
                    title="Local Art"
                    selected={selected}
                    value={'local'}
                    setSelected={setSelected}
                />
            </div>

            {selected === 'local' ? (
                <LocalArtView
                    venueItem={venueItem}
                    selectedRowIds={selectedRowIds}
                    onRowSelectToggle={onToggleRowSelection}
                />
            ) : (
                <GeneralMediaView
                    order={order}
                    venueItem={venueItem}
                    selectedRowIds={selectedRowIds}
                    onRowSelectToggle={onToggleRowSelection}
                    onOpenAttachModal={onOpenAttachModal}
                />
            )}
        </>
    );
}

function SwitchButton({
    title,
    selected,
    value,
    setSelected,
}: {
    title: string;
    selected: 'local' | 'generic';
    value: 'local' | 'generic';
    setSelected: Dispatch<SetStateAction<'local' | 'generic'>>;
}) {
    const selectedClasses =
        selected === value
            ? 'bg-white shadow-xs'
            : 'text-neutral-500 hover:bg-neutral-200/60 hover:text-black';

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelected(value)}
            className={cn(
                'flex items-center rounded-md px-3.5 py-1.5 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none',
                selectedClasses,
            )}
        >
            {title}
        </Button>
    );
}

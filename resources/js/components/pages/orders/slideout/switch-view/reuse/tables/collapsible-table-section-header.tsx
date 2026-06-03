import { Button } from '@/components/ui/button';
import { CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { ChevronDown, Plus } from 'lucide-react';

export interface CollapsibleTableSectionHeaderProps {
    title: string;
    isOpen: boolean;
    onAdd?: () => void;
    className?: string;
}

export function CollapsibleTableSectionHeader({
    title,
    isOpen,
    onAdd,
    className,
}: CollapsibleTableSectionHeaderProps) {
    return (
        <div className={cn('flex items-center gap-2', className)}>
            <CollapsibleTrigger asChild>
                <button
                    type="button"
                    className="flex items-center gap-2 text-left hover:opacity-80"
                >
                    <ChevronDown
                        className={cn(
                            'h-4 w-4 rotate-[-90deg] text-gray-600 transition-transform duration-150',
                            isOpen && 'rotate-0',
                        )}
                    />
                    <span className="md-gray-700-weight-600">{title}</span>
                </button>
            </CollapsibleTrigger>
            {onAdd != null && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-4 cursor-pointer rounded-full border-2 border-gray-400 text-gray-400 hover:bg-gray-400 hover:text-white"
                    onClick={onAdd}
                >
                    <Plus className="size-2.5" strokeWidth={3} />
                </Button>
            )}
        </div>
    );
}

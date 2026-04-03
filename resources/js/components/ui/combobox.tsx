'use client';

import { Badge } from '@/components/ui/badge';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from 'cmdk';
import { CheckIcon, ChevronDown, X } from 'lucide-react';
import * as React from 'react';

export interface MultiSelectComboboxProps {
    options: readonly string[];
    value: string[];
    onValueChange: (value: string[]) => void;
    placeholder?: string;
    emptyMessage?: string;
    removeSearch?: boolean;
    className?: string;
    triggerClassName?: string;
    maxBadges?: number;
    id?: string;
}

export function MultiSelectCombobox({
    options,
    value,
    onValueChange,
    placeholder = 'Select...',
    emptyMessage = 'No results found.',
    removeSearch = true,
    className,
    triggerClassName,
    maxBadges = 1,
    id,
}: MultiSelectComboboxProps) {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState('');

    const toggleOption = (option: string) => {
        const isSelected = value.includes(option);
        onValueChange(
            isSelected ? value.filter((v) => v !== option) : [...value, option],
        );
    };

    const removeOption = (e: React.MouseEvent, option: string) => {
        e.stopPropagation();
        onValueChange(value.filter((v) => v !== option));
    };

    const filteredOptions = React.useMemo(() => {
        if (!search) return [...options];
        const q = search.toLowerCase();
        return options.filter((opt) => opt.toLowerCase().includes(q));
    }, [options, search]);

    return (
        <>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <div
                        id={id}
                        role="combobox"
                        aria-expanded={open}
                        tabIndex={0}
                        className={cn(
                            'flex h-9 w-full min-w-0 cursor-pointer items-center gap-2 overflow-hidden rounded-md border border-input bg-transparent px-2 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
                            triggerClassName,
                        )}
                    >
                        <div className="flex min-w-0 flex-1 flex-col flex-wrap gap-1 overflow-y-auto">
                            {value.length === 0 ? (
                                <span className="text-muted-foreground">
                                    {placeholder}
                                </span>
                            ) : (
                                value.slice(0, maxBadges).map((v) => {
                                    return (
                                        <Badge
                                            key={v}
                                            variant="secondary"
                                            className="shrink-0 gap-0.5 px-1.5 py-0 text-xs font-normal"
                                        >
                                            {v}
                                            <button
                                                type="button"
                                                onClick={(e) =>
                                                    removeOption(e, v)
                                                }
                                                className="ml-0.5 rounded-full p-0.5 hover:bg-muted"
                                                aria-label={`Remove ${v}`}
                                            >
                                                <X className="size-3" />
                                            </button>
                                        </Badge>
                                    );
                                })
                            )}
                        </div>
                        <ChevronDown className="size-4 shrink-0 opacity-50" />
                    </div>
                </PopoverTrigger>
                <PopoverContent
                    className="w-[var(--radix-popover-trigger-width)] p-0"
                    align="start"
                >
                    <Command
                        shouldFilter={false}
                        className={cn('p-2', className)}
                    >
                        {!removeSearch && (
                            <CommandInput
                                placeholder="Search..."
                                value={search}
                                onValueChange={setSearch}
                            />
                        )}
                        <CommandList>
                            <CommandEmpty>{emptyMessage}</CommandEmpty>
                            <CommandGroup>
                                {filteredOptions.map((option) => {
                                    const isSelected = value.includes(option);
                                    return (
                                        <CommandItem
                                            key={option}
                                            value={option}
                                            onSelect={() =>
                                                toggleOption(option)
                                            }
                                            className="relative flex cursor-pointer items-center rounded-md p-1.5 py-0.5 pr-8 hover:bg-gray-200 [&:not(:last-child)]:mb-2"
                                            aria-selected={isSelected}
                                        >
                                            {isSelected && (
                                                <span className="absolute right-1 flex">
                                                    <CheckIcon className="size-4" />
                                                </span>
                                            )}
                                            <span className="w-[500px]">
                                                {option}
                                            </span>
                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {value.length > maxBadges && (
                <span className="shrink-0 text-xs text-muted-foreground">
                    +{value.length - maxBadges} more
                </span>
            )}
        </>
    );
}

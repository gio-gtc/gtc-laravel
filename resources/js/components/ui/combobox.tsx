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

export type ComboboxOption =
    | string
    | {
          value: string;
          label: string;
      };

export function normalizeComboboxOptions(
    options: readonly ComboboxOption[],
): { value: string; label: string }[] {
    return options.map((o) =>
        typeof o === 'string' ? { value: o, label: o } : o,
    );
}

export interface MultiSelectComboboxProps {
    options: readonly ComboboxOption[];
    value: string[];
    onValueChange: (value: string[]) => void;
    /** `single`: at most one option; picking replaces selection, picking again clears. */
    mode?: 'multi' | 'single';
    placeholder?: string;
    emptyMessage?: string;
    removeSearch?: boolean;
    className?: string;
    triggerClassName?: string;
    badgeClassName?: string;
    maxBadges?: number;
    id?: string;
}

export function MultiSelectCombobox({
    options,
    value,
    onValueChange,
    mode = 'multi',
    placeholder = 'Select...',
    emptyMessage = 'No results found.',
    removeSearch = true,
    className,
    triggerClassName,
    badgeClassName,
    maxBadges = 1,
    id,
}: MultiSelectComboboxProps) {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState('');

    const normalizedOptions = React.useMemo(
        () => normalizeComboboxOptions(options),
        [options],
    );

    const labelByValue = React.useMemo(() => {
        const map = new Map<string, string>();
        for (const o of normalizedOptions) {
            map.set(o.value, o.label);
        }
        return map;
    }, [normalizedOptions]);

    const toggleOption = (optionValue: string) => {
        if (mode === 'single') {
            const isSelected = value.includes(optionValue);
            onValueChange(isSelected ? [] : [optionValue]);
            setOpen(false);
            return;
        }
        const isSelected = value.includes(optionValue);
        onValueChange(
            isSelected
                ? value.filter((v) => v !== optionValue)
                : [...value, optionValue],
        );
    };

    const removeOption = (e: React.MouseEvent, optionValue: string) => {
        e.stopPropagation();
        onValueChange(value.filter((v) => v !== optionValue));
    };

    const filteredOptions = React.useMemo(() => {
        if (!search) return normalizedOptions;
        const q = search.toLowerCase();
        return normalizedOptions.filter(
            (opt) =>
                opt.label.toLowerCase().includes(q) ||
                opt.value.toLowerCase().includes(q),
        );
    }, [normalizedOptions, search]);

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
                        <div className="flex min-w-0 flex-1 flex-row flex-wrap gap-1 overflow-y-auto">
                            {value.length === 0 ? (
                                <span className="text-muted-foreground">
                                    {placeholder}
                                </span>
                            ) : (
                                value.slice(0, maxBadges).map((v) => {
                                    const display = labelByValue.get(v) ?? v;

                                    return (
                                        <Badge
                                            key={v}
                                            variant="secondary"
                                            className={cn(
                                                'shrink-0 gap-0.5 px-1.5 py-0 text-xs font-normal',
                                                badgeClassName,
                                            )}
                                        >
                                            {display}
                                            <button
                                                type="button"
                                                onClick={(e) =>
                                                    removeOption(e, v)
                                                }
                                                className="ml-0.5 cursor-pointer rounded-full p-0.5 hover:bg-muted"
                                                aria-label={`Remove ${display}`}
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
                                    const isSelected = value.includes(
                                        option.value,
                                    );

                                    return (
                                        <CommandItem
                                            key={option.value}
                                            value={option.value}
                                            keywords={[
                                                option.value,
                                                option.label,
                                            ]}
                                            onSelect={() =>
                                                toggleOption(option.value)
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
                                                {option.label}
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

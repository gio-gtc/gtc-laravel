'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    normalizeComboboxOptions,
    type ComboboxOption,
    type NormalizedComboboxOption,
} from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
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

export function mergeComboboxOptionsWithCustoms(
    catalog: readonly string[],
    customs: readonly string[],
): string[] {
    const seen = new Set(catalog);
    const merged = [...catalog];
    for (const custom of customs) {
        const trimmed = custom.trim();
        if (trimmed !== '' && !seen.has(trimmed)) {
            seen.add(trimmed);
            merged.push(trimmed);
        }
    }
    return merged;
}

export interface MultiSelectWithOtherProps {
    options: readonly ComboboxOption[];
    value: string[];
    onValueChange: (value: string[]) => void;
    /** When false, catalog options only (same as MultiSelectCombobox). */
    allowOther?: boolean;
    /** Called when admin adds a new custom option to the session list. */
    onCustomOptionAdded?: (option: string) => void;
    mode?: 'multi' | 'single';
    placeholder?: string;
    emptyMessage?: string;
    otherInputPlaceholder?: string;
    removeSearch?: boolean;
    className?: string;
    triggerClassName?: string;
    badgeClassName?: string;
    maxBadges?: number;
    id?: string;
    disabled?: boolean;
}

export function MultiSelectWithOther({
    options,
    value,
    onValueChange,
    allowOther = false,
    onCustomOptionAdded,
    mode = 'multi',
    placeholder = 'Select...',
    emptyMessage = 'No results found.',
    otherInputPlaceholder = 'Enter custom value…',
    removeSearch = true,
    className,
    triggerClassName,
    badgeClassName,
    maxBadges = 1,
    id,
    disabled = false,
}: MultiSelectWithOtherProps) {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState('');
    const [otherDraft, setOtherDraft] = React.useState('');

    const normalizedOptions = React.useMemo(
        () => normalizeComboboxOptions(options),
        [options],
    );

    const labelByValue = React.useMemo(() => {
        const map = new Map<string, string>();
        for (const option of normalizedOptions) {
            map.set(option.value, option.label);
        }
        for (const selected of value) {
            if (!map.has(selected)) {
                map.set(selected, selected);
            }
        }
        return map;
    }, [normalizedOptions, value]);

    const toggleOption = (optionValue: string) => {
        const option = normalizedOptions.find((o) => o.value === optionValue);
        if (option?.disabled) {
            return;
        }

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
        if (!search) {
            return normalizedOptions;
        }
        const q = search.toLowerCase();
        return normalizedOptions.filter(
            (opt) =>
                opt.label.toLowerCase().includes(q) ||
                opt.value.toLowerCase().includes(q),
        );
    }, [normalizedOptions, search]);

    const addCustomOption = () => {
        const trimmed = otherDraft.trim();
        if (trimmed === '') {
            return;
        }

        onCustomOptionAdded?.(trimmed);

        if (mode === 'single') {
            onValueChange([trimmed]);
            setOtherDraft('');
            setOpen(false);
            return;
        }

        if (!value.includes(trimmed)) {
            onValueChange([...value, trimmed]);
        }
        setOtherDraft('');
    };

    const handleOtherKeyDown = (
        event: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            addCustomOption();
        }
    };

    return (
        <>
            <Popover
                open={disabled ? false : open}
                onOpenChange={disabled ? undefined : setOpen}
            >
                <PopoverTrigger asChild disabled={disabled}>
                    <div
                        id={id}
                        role="combobox"
                        aria-expanded={open}
                        aria-disabled={disabled}
                        tabIndex={disabled ? -1 : 0}
                        className={cn(
                            'flex h-9 w-full min-w-0 cursor-pointer items-center gap-2 overflow-hidden rounded-md border border-input bg-transparent px-2 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
                            disabled &&
                                'cursor-not-allowed opacity-60 hover:bg-transparent hover:text-inherit',
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
                                            {!disabled && (
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
                                            )}
                                        </Badge>
                                    );
                                })
                            )}
                        </div>
                        <ChevronDown className="size-4 shrink-0 text-muted-foreground opacity-50" />
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
                                            disabled={option.disabled}
                                            className={cn(
                                                'relative flex items-center rounded-md p-1.5 py-0.5 pr-8 [&:not(:last-child)]:mb-2',
                                                option.disabled
                                                    ? 'cursor-not-allowed text-gray-400 opacity-50'
                                                    : 'cursor-pointer hover:bg-gray-200',
                                            )}
                                            aria-selected={isSelected}
                                            aria-disabled={option.disabled}
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
                        {allowOther ? (
                            <div className="mt-1 flex gap-2 border-t pt-1.5">
                                <Input
                                    value={otherDraft}
                                    onChange={(event) =>
                                        setOtherDraft(event.target.value)
                                    }
                                    onKeyDown={handleOtherKeyDown}
                                    placeholder={otherInputPlaceholder}
                                    variant="orderSlideoutpopup"
                                />
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={addCustomOption}
                                    disabled={otherDraft.trim() === ''}
                                >
                                    Add
                                </Button>
                            </div>
                        ) : null}
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

export type { NormalizedComboboxOption };

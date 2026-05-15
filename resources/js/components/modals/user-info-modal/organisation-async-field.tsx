import InputError from '@/components/input-error';
import { FieldLabel } from '@/components/ui/field-label';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverAnchor,
    PopoverContent,
} from '@/components/ui/popover';
import { getCsrfHeaders } from '@/lib/forms/csrf';
import { cn } from '@/lib/utils';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandList,
} from 'cmdk';
import { CheckIcon } from 'lucide-react';
import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';

type OrgOption = { id: number; name: string };

type OrganisationsSearchResponse = {
    organisations?: OrgOption[];
};

function parseOrganisationId(
    value: number | string | null | undefined,
): number | null {
    if (value === null || value === undefined || value === '') {
        return null;
    }
    const n =
        typeof value === 'number' ? value : Number.parseInt(String(value), 10);
    return Number.isFinite(n) && n > 0 ? n : null;
}

async function fetchOrganisations(
    search: string,
    signal: AbortSignal,
): Promise<OrgOption[]> {
    const params = new URLSearchParams({ search });
    const res = await fetch(`/api/search/organisations?${params}`, {
        method: 'GET',
        headers: getCsrfHeaders(),
        credentials: 'same-origin',
        signal,
    });
    if (!res.ok) {
        return [];
    }
    const data = (await res.json()) as OrganisationsSearchResponse;
    return Array.isArray(data.organisations) ? data.organisations : [];
}

export type OrganisationAsyncFieldProps = {
    /** Bumps when the modal reopens / defaults change so selection resets. */
    syncKey: string | number;
    initialOrganisationId: number | string | null | undefined;
    initialOrganisationName: string | null | undefined;
    error?: string;
    required?: boolean;
    onOrganisationCommittedChange?: (committed: boolean) => void;
};

export function OrganisationAsyncField({
    syncKey,
    initialOrganisationId,
    initialOrganisationName,
    error,
    required,
    onOrganisationCommittedChange,
}: OrganisationAsyncFieldProps) {
    const rootRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [organisations, setOrganisations] = useState<OrgOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(() =>
        parseOrganisationId(initialOrganisationId),
    );
    const [selectedLabel, setSelectedLabel] = useState(
        () => initialOrganisationName?.trim() ?? '',
    );
    const [resolvePending, setResolvePending] = useState(() => {
        const id = parseOrganisationId(initialOrganisationId);
        const hasName = Boolean(initialOrganisationName?.trim());
        return id !== null && !hasName;
    });
    const [popoverContentWidth, setPopoverContentWidth] = useState<number | null>(
        null,
    );

    /** Snapshot at focus-open so closing without a pick can restore a valid org. */
    const snapshotRef = useRef<{ id: number | null; label: string }>({
        id: null,
        label: '',
    });

    const abortRef = useRef<AbortController | null>(null);

    useEffect(() => {
        const id = parseOrganisationId(initialOrganisationId);
        const hasName = Boolean(initialOrganisationName?.trim());

        setSelectedId(id);
        setSelectedLabel(initialOrganisationName?.trim() ?? '');
        setSearchQuery('');
        setOrganisations([]);
        setOpen(false);
        setLoading(false);
        setResolvePending(id !== null && !hasName);
    }, [syncKey, initialOrganisationId, initialOrganisationName]);

    /** API often omits organisation name on session user; resolve label from search results by id. */
    useEffect(() => {
        const id = parseOrganisationId(initialOrganisationId);
        const hasName = Boolean(initialOrganisationName?.trim());
        if (id === null || hasName) {
            return;
        }

        const controller = new AbortController();

        void (async () => {
            try {
                const searches = [String(id), ''];
                for (const search of searches) {
                    if (controller.signal.aborted) {
                        return;
                    }
                    try {
                        const list = await fetchOrganisations(
                            search,
                            controller.signal,
                        );
                        const match = list.find((o) => o.id === id);
                        if (match && !controller.signal.aborted) {
                            setSelectedLabel(match.name);
                            return;
                        }
                    } catch {
                        /* aborted or network */
                    }
                }
            } finally {
                if (!controller.signal.aborted) {
                    setResolvePending(false);
                }
            }
        })();

        return () => controller.abort();
    }, [syncKey, initialOrganisationId, initialOrganisationName]);

    useEffect(() => {
        onOrganisationCommittedChange?.(selectedId !== null);
    }, [selectedId, onOrganisationCommittedChange]);

    useLayoutEffect(() => {
        if (!open) {
            setPopoverContentWidth(null);
            return;
        }

        const el = inputRef.current;
        if (!el) {
            return;
        }

        const measure = () => {
            const width = el.getBoundingClientRect().width;
            setPopoverContentWidth(Number.isFinite(width) ? width : null);
        };

        measure();

        const ro = new ResizeObserver(measure);
        ro.observe(el);
        return () => ro.disconnect();
    }, [open]);

    const runSearch = useCallback(
        async (search: string, signal: AbortSignal) => {
            try {
                const list = await fetchOrganisations(search, signal);
                if (!signal.aborted) {
                    setOrganisations(list);
                }
            } catch {
                if (!signal.aborted) {
                    setOrganisations([]);
                }
            } finally {
                if (!signal.aborted) {
                    setLoading(false);
                }
            }
        },
        [],
    );

    useEffect(() => {
        if (!open || searchQuery.trim() === '') {
            abortRef.current?.abort();
            abortRef.current = null;
            setOrganisations([]);
            setLoading(false);
            return;
        }

        setOrganisations([]);
        setLoading(true);

        const timerId = window.setTimeout(() => {
            abortRef.current?.abort();
            const controller = new AbortController();
            abortRef.current = controller;
            void runSearch(searchQuery.trim(), controller.signal);
        }, 300);

        return () => {
            window.clearTimeout(timerId);
        };
    }, [open, searchQuery, runSearch]);

    const bubbleFormInput = () => {
        rootRef.current
            ?.closest('form')
            ?.dispatchEvent(new Event('input', { bubbles: true }));
    };

    const handleOpenChange = (next: boolean) => {
        if (!next) {
            abortRef.current?.abort();
            abortRef.current = null;
            setOrganisations([]);
            setLoading(false);
            if (
                selectedId === null &&
                snapshotRef.current.id !== null &&
                searchQuery.trim() !== ''
            ) {
                setSelectedId(snapshotRef.current.id);
                setSelectedLabel(snapshotRef.current.label);
                bubbleFormInput();
            }
            setSearchQuery('');
        }
        setOpen(next);
    };

    const handleInputFocus = () => {
        snapshotRef.current = {
            id: selectedId,
            label: selectedLabel,
        };
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        setSearchQuery(v);
        setSelectedId(null);
        setSelectedLabel('');
        bubbleFormInput();
        const nonEmpty = v.trim() !== '';
        setOpen(nonEmpty);
        if (!nonEmpty) {
            setOrganisations([]);
            setLoading(false);
        }
    };

    const handleInputBlur = () => {
        window.setTimeout(() => {
            const active = document.activeElement;
            if (
                active !== inputRef.current &&
                !active?.closest('[data-slot="popover-content"]')
            ) {
                setOrganisations([]);
                setLoading(false);
            }
        }, 0);
    };

    const inputDisplayValue = open ? searchQuery : selectedLabel;

    const emptyMessage = loading ? 'Searching…' : 'No organisations found.';

    const inputPlaceholder =
        resolvePending &&
        !open &&
        searchQuery === '' &&
        selectedLabel === ''
            ? 'Loading organisation…'
            : 'Search organisations…';

    return (
        <div ref={rootRef} className="grid gap-2">
            <input
                type="hidden"
                name="organisation_id"
                value={selectedId ?? ''}
            />
            <FieldLabel
                className="xs-gray-700-weight-500"
                htmlFor="organisation-async-input"
                required={required}
            >
                Organisation
            </FieldLabel>
            <Popover open={open} onOpenChange={handleOpenChange}>
                <PopoverAnchor asChild>
                    <div className="relative w-full">
                        <Input
                            ref={inputRef}
                            id="organisation-async-input"
                            type="text"
                            role="combobox"
                            aria-expanded={open}
                            aria-busy={resolvePending}
                            aria-autocomplete="list"
                            aria-controls={open ? 'organisation-async-listbox' : undefined}
                            aria-invalid={Boolean(error)}
                            aria-required={required}
                            autoComplete="off"
                            data-test="organisation-async-trigger"
                            value={inputDisplayValue}
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                            onChange={handleInputChange}
                            placeholder={inputPlaceholder}
                            className={cn(
                                'cursor-text pr-9',
                                !open &&
                                    Boolean(selectedLabel) &&
                                    'text-foreground',
                            )}
                        />
                    </div>
                </PopoverAnchor>
                <PopoverContent
                    id="organisation-async-listbox"
                    role="listbox"
                    className={cn(
                        'max-w-none min-w-0 p-0',
                        popoverContentWidth != null && 'w-auto',
                    )}
                    style={
                        popoverContentWidth != null
                            ? {
                                  width: popoverContentWidth,
                                  maxWidth: popoverContentWidth,
                              }
                            : undefined
                    }
                    align="start"
                    sideOffset={4}
                    onOpenAutoFocus={(ev) => ev.preventDefault()}
                >
                    <Command shouldFilter={false} className="max-h-72 p-2">
                        <CommandList>
                            <CommandEmpty>{emptyMessage}</CommandEmpty>
                            <CommandGroup>
                                {organisations.map((org) => {
                                    const isSelected = selectedId === org.id;
                                    return (
                                        <CommandItem
                                            key={org.id}
                                            value={`${org.id}-${org.name}`}
                                            role="option"
                                            onSelect={() => {
                                                setSelectedId(org.id);
                                                setSelectedLabel(org.name);
                                                setSearchQuery(org.name);
                                                setOpen(false);
                                                bubbleFormInput();
                                                inputRef.current?.blur();
                                            }}
                                            className="relative flex cursor-pointer items-center rounded-md p-1.5 py-0.5 pr-8 hover:bg-gray-200 [&:not(:last-child)]:mb-2"
                                            aria-selected={isSelected}
                                        >
                                            {isSelected && (
                                                <span className="absolute right-1 flex">
                                                    <CheckIcon className="size-4" />
                                                </span>
                                            )}
                                            <span className="min-w-0 truncate">
                                                {org.name}
                                            </span>
                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            <InputError message={error} />
        </div>
    );
}

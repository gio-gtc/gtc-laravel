import InputError from '@/components/input-error';
import { FieldLabel } from '@/components/ui/field-label';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverAnchor,
    PopoverContent,
} from '@/components/ui/popover';
import Divider from '@/components/utils/divider';
import { getCsrfHeaders } from '@/lib/forms/csrf';
import { cn } from '@/lib/utils';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandList,
} from 'cmdk';
import { CheckIcon, PlusCircle } from 'lucide-react';
import {
    useCallback,
    useEffect,
    useId,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

type OrgOption = { id: number; name: string };

type OrganisationsSearchResponse = {
    organisations?: OrgOption[];
};

const ADD_NEW_VALUE = '__add_new__';

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

export type AppliedOrganisationPayload = { id: number; name: string };

export type OrganisationAsyncFieldProps = {
    /** Bumps when the modal reopens / defaults change so selection resets. */
    syncKey: string | number;
    initialOrganisationId: number | string | null | undefined;
    initialOrganisationName: string | null | undefined;
    error?: string;
    required?: boolean;
    onOrganisationCommittedChange?: (committed: boolean) => void;
    /** When set, last row opens create-organisation flow (e.g. parent modal). */
    onAddNewOrganisation?: () => void;
    addNewOrganisationLabel?: string;
    /** Bump rev after flash-driven create (parent passes payload + incremented rev). */
    appliedOrganisation?: AppliedOrganisationPayload | null;
    appliedOrganisationRev?: number;
};

export function OrganisationAsyncField({
    syncKey,
    initialOrganisationId,
    initialOrganisationName,
    error,
    required,
    onOrganisationCommittedChange,
    onAddNewOrganisation,
    addNewOrganisationLabel = 'Add new organisation',
    appliedOrganisation = null,
    appliedOrganisationRev = 0,
}: OrganisationAsyncFieldProps) {
    const reactId = useId();
    const optionIdPrefix = `org-async-${reactId.replace(/:/g, '')}`;

    const rootRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const inputFocusedRef = useRef(false);

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
    const [popoverContentWidth, setPopoverContentWidth] = useState<
        number | null
    >(null);
    /** Keyboard roving highlight; null means no row highlighted (Enter does nothing). */
    const [highlightedIndex, setHighlightedIndex] = useState<number | null>(
        null,
    );
    /** Deep-link name before id is resolved; cleared once matched or user edits. */
    const [unresolvedPrefillName, setUnresolvedPrefillName] = useState('');
    const [prefillCheckStatus, setPrefillCheckStatus] = useState<
        'idle' | 'checking' | 'matched' | 'unmatched'
    >('idle');
    const [prefillError, setPrefillError] = useState<string | undefined>();

    /** Snapshot at focus-open so closing without a pick can restore a valid org. */
    const snapshotRef = useRef<{ id: number | null; label: string }>({
        id: null,
        label: '',
    });

    const abortRef = useRef<AbortController | null>(null);

    const showAddNewRow = Boolean(onAddNewOrganisation) && !loading;
    const optionCount = useMemo(
        () => organisations.length + (showAddNewRow ? 1 : 0),
        [organisations.length, showAddNewRow],
    );

    useEffect(() => {
        const id = parseOrganisationId(initialOrganisationId);
        const hasName = Boolean(initialOrganisationName?.trim());

        const nameTrimmed = initialOrganisationName?.trim() ?? '';
        setSelectedId(id);
        setSelectedLabel(id !== null ? nameTrimmed : '');
        setUnresolvedPrefillName(id === null && nameTrimmed !== '' ? nameTrimmed : '');
        setPrefillCheckStatus('idle');
        setPrefillError(undefined);
        setSearchQuery('');
        setOrganisations([]);
        setOpen(false);
        setLoading(false);
        setHighlightedIndex(null);
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

    /** Prefill / deep link: pick organisation id when only a name was provided. */
    useEffect(() => {
        const id = parseOrganisationId(initialOrganisationId);
        const name = initialOrganisationName?.trim() ?? '';
        if (id !== null || name === '') {
            return;
        }

        const controller = new AbortController();
        setPrefillCheckStatus('checking');
        setPrefillError(undefined);

        void (async () => {
            try {
                const list = await fetchOrganisations(name, controller.signal);
                if (controller.signal.aborted) {
                    return;
                }
                const lower = name.toLowerCase();
                const match = list.find(
                    (o) => o.name.trim().toLowerCase() === lower,
                );
                if (controller.signal.aborted) {
                    return;
                }
                if (match) {
                    setSelectedId(match.id);
                    setSelectedLabel(match.name);
                    setUnresolvedPrefillName('');
                    setPrefillCheckStatus('matched');
                    setPrefillError(undefined);
                    bubbleFormInput();
                    return;
                }
                setPrefillCheckStatus('unmatched');
                setPrefillError(
                    'No matching organisation found. Search and select one from the list.',
                );
            } catch {
                if (!controller.signal.aborted) {
                    setPrefillCheckStatus('unmatched');
                    setPrefillError(
                        'Could not verify organisation. Search and select one from the list.',
                    );
                }
            }
        })();

        return () => controller.abort();
    }, [syncKey, initialOrganisationId, initialOrganisationName]);

    useEffect(() => {
        onOrganisationCommittedChange?.(selectedId !== null);
    }, [selectedId, onOrganisationCommittedChange]);

    useEffect(() => {
        setHighlightedIndex(null);
    }, [searchQuery]);

    useEffect(() => {
        if (!open) {
            setHighlightedIndex(null);
            return;
        }
        setHighlightedIndex((prev) => {
            if (prev === null || optionCount === 0) {
                return null;
            }
            return Math.min(prev, optionCount - 1);
        });
    }, [open, optionCount, organisations]);

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

    useEffect(() => {
        if (highlightedIndex === null || !open) {
            return;
        }
        const id =
            highlightedIndex < organisations.length
                ? `${optionIdPrefix}-opt-${organisations[highlightedIndex]!.id}`
                : `${optionIdPrefix}-opt-add-new`;
        window.requestAnimationFrame(() => {
            document.getElementById(id)?.scrollIntoView({ block: 'nearest' });
        });
    }, [highlightedIndex, open, organisations, optionIdPrefix]);

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

    /** Profile/create modal: apply organisation from flash after Create Organisation succeeds. */
    useEffect(() => {
        if (appliedOrganisationRev < 1 || !appliedOrganisation) {
            return;
        }
        const id = appliedOrganisation.id;
        const label = appliedOrganisation.name.trim();
        if (!Number.isFinite(id) || id <= 0 || label === '') {
            return;
        }
        abortRef.current?.abort();
        abortRef.current = null;
        setSelectedId(id);
        setSelectedLabel(label);
        setSearchQuery('');
        setOrganisations([]);
        setOpen(false);
        setLoading(false);
        setHighlightedIndex(null);
        setResolvePending(false);
        bubbleFormInput();
    }, [appliedOrganisationRev, appliedOrganisation]);

    const handleOpenChange = (next: boolean) => {
        if (next && !inputFocusedRef.current) {
            return;
        }
        if (!next) {
            abortRef.current?.abort();
            abortRef.current = null;
            setOrganisations([]);
            setLoading(false);
            setHighlightedIndex(null);
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

    const pickOrganisation = useCallback((org: OrgOption) => {
        setSelectedId(org.id);
        setSelectedLabel(org.name);
        setUnresolvedPrefillName('');
        setPrefillCheckStatus('matched');
        setPrefillError(undefined);
        setSearchQuery(org.name);
        setOpen(false);
        setHighlightedIndex(null);
        bubbleFormInput();
        inputRef.current?.blur();
    }, []);

    const runAddNewOrganisation = useCallback(() => {
        onAddNewOrganisation?.();
        setOpen(false);
        setHighlightedIndex(null);
        setSearchQuery('');
        inputRef.current?.blur();
    }, [onAddNewOrganisation]);

    const pickByListIndex = useCallback(
        (index: number) => {
            if (index < 0 || index >= optionCount) {
                return;
            }
            if (index < organisations.length) {
                pickOrganisation(organisations[index]!);
                return;
            }
            runAddNewOrganisation();
        },
        [optionCount, organisations, pickOrganisation, runAddNewOrganisation],
    );

    const handleInputFocus = () => {
        inputFocusedRef.current = true;
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
        setUnresolvedPrefillName('');
        setPrefillCheckStatus('idle');
        setPrefillError(undefined);
        setHighlightedIndex(null);
        bubbleFormInput();
        const nonEmpty = v.trim() !== '';
        setOpen(nonEmpty && inputFocusedRef.current);
        if (!nonEmpty) {
            setOrganisations([]);
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!open || optionCount === 0) {
            if (e.key === 'Escape' && open) {
                e.preventDefault();
                handleOpenChange(false);
            }
            return;
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedIndex((prev) => {
                if (prev === null) {
                    return 0;
                }
                return prev >= optionCount - 1 ? 0 : prev + 1;
            });
            return;
        }

        if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex((prev) => {
                if (prev === null) {
                    return optionCount - 1;
                }
                return prev <= 0 ? optionCount - 1 : prev - 1;
            });
            return;
        }

        if (e.key === 'Enter') {
            if (highlightedIndex === null) {
                return;
            }
            e.preventDefault();
            pickByListIndex(highlightedIndex);
            return;
        }

        if (e.key === 'Escape') {
            e.preventDefault();
            handleOpenChange(false);
        }
    };

    const handleInputBlur = () => {
        window.setTimeout(() => {
            const active = document.activeElement;
            if (
                active !== inputRef.current &&
                !active?.closest('[data-slot="popover-content"]')
            ) {
                inputFocusedRef.current = false;
                setOpen(false);
                setOrganisations([]);
                setLoading(false);
            }
        }, 0);
    };

    const inputDisplayValue = open
        ? searchQuery
        : selectedLabel || unresolvedPrefillName;

    const emptyMessage = loading ? 'Searching…' : 'No organisations found.';

    const inputPlaceholder =
        prefillCheckStatus === 'checking'
            ? 'Checking organisation…'
            : resolvePending && !open && searchQuery === '' && selectedLabel === ''
              ? 'Loading organisation…'
              : 'Search organisations…';

    const displayError = error ?? prefillError;

    const activeDescendantId =
        highlightedIndex !== null &&
        open &&
        optionCount > 0 &&
        highlightedIndex >= 0
            ? highlightedIndex < organisations.length
                ? `${optionIdPrefix}-opt-${organisations[highlightedIndex]?.id}`
                : `${optionIdPrefix}-opt-add-new`
            : undefined;

    /** Shown while loading or when there are no results and no "Add new" row. */
    const emptyVisible = organisations.length === 0 && !showAddNewRow;

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
                            aria-activedescendant={activeDescendantId}
                            aria-busy={resolvePending}
                            aria-autocomplete="list"
                            aria-controls={
                                open ? 'organisation-async-listbox' : undefined
                            }
                            aria-invalid={Boolean(displayError)}
                            aria-required={required}
                            autoComplete="off"
                            data-test="organisation-async-trigger"
                            value={inputDisplayValue}
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
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
                            {emptyVisible ? (
                                <CommandEmpty>{emptyMessage}</CommandEmpty>
                            ) : null}
                            <CommandGroup>
                                {organisations.map((org, index) => {
                                    const isSelected = selectedId === org.id;
                                    const optionId = `${optionIdPrefix}-opt-${org.id}`;
                                    const isKeyboardActive =
                                        highlightedIndex === index;
                                    return (
                                        <CommandItem
                                            key={org.id}
                                            id={optionId}
                                            value={`${org.id}-${org.name}`}
                                            role="option"
                                            onMouseEnter={() =>
                                                setHighlightedIndex(index)
                                            }
                                            onSelect={() => {
                                                pickOrganisation(org);
                                            }}
                                            className={cn(
                                                'relative flex cursor-pointer items-center rounded-md p-1.5 py-0.5 pr-8 hover:bg-gray-200 [&:not(:last-child)]:mb-2',
                                                isKeyboardActive &&
                                                    'bg-accent text-accent-foreground',
                                            )}
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
                                {showAddNewRow ? (
                                    <>
                                        <Divider />
                                        <CommandItem
                                            id={`${optionIdPrefix}-opt-add-new`}
                                            value={ADD_NEW_VALUE}
                                            role="option"
                                            onMouseEnter={() =>
                                                setHighlightedIndex(
                                                    organisations.length,
                                                )
                                            }
                                            onSelect={() => {
                                                runAddNewOrganisation();
                                            }}
                                            className={cn(
                                                'relative mt-1 flex cursor-pointer items-center rounded-lg p-0.5',
                                                highlightedIndex ===
                                                    organisations.length &&
                                                    'bg-accent text-accent-foreground',
                                            )}
                                            aria-selected={false}
                                        >
                                            <span className="flex min-w-0 items-center gap-1 truncate">
                                                <PlusCircle className="h-3 w-3 text-brand-gtc-red" />
                                                {addNewOrganisationLabel}
                                            </span>
                                        </CommandItem>
                                    </>
                                ) : null}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            <InputError message={displayError} />
        </div>
    );
}

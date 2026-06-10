import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverAnchor,
    PopoverContent,
} from '@/components/ui/popover';
import { getCsrfHeaders } from '@/lib/forms/csrf';
import { cn } from '@/lib/utils';
import {
    type VenueSearchOption,
    type VenuesSearchResponse,
} from '@/types/orders-api';
import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';

const MIN_SEARCH_LENGTH = 2;
const LISTBOX_ID = 'venue-autocomplete-listbox';
const optionId = (venueId: number) => `${LISTBOX_ID}-opt-${venueId}`;

interface VenueAutocompleteProps {
    value: VenueSearchOption | null;
    onChange: (venue: VenueSearchOption | null) => void;
    required?: boolean;
}

async function fetchVenues(
    search: string,
    signal: AbortSignal,
): Promise<VenueSearchOption[]> {
    const params = new URLSearchParams({ search });
    const res = await fetch(`/api/search/venues?${params}`, {
        method: 'GET',
        headers: getCsrfHeaders(),
        credentials: 'same-origin',
        signal,
    });
    if (!res.ok) {
        return [];
    }
    const data = (await res.json()) as VenuesSearchResponse;
    return Array.isArray(data.venues) ? data.venues : [];
}

function venueMatchesQuery(venue: VenueSearchOption, query: string): boolean {
    const q = query.trim().toLowerCase();
    if (!q) {
        return true;
    }
    const fields = [venue.name, venue.city, venue.state].map((s) =>
        (s ?? '').toLowerCase(),
    );
    return fields.some((field) => field.includes(q));
}

export default function VenueAutocomplete({
    value,
    onChange,
    required = false,
}: VenueAutocompleteProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const inputFocusedRef = useRef(false);
    const abortRef = useRef<AbortController | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [open, setOpen] = useState(false);
    const [venues, setVenues] = useState<VenueSearchOption[]>([]);
    const [highlightedIndex, setHighlightedIndex] = useState<number | null>(
        null,
    );
    const [popoverContentWidth, setPopoverContentWidth] = useState<
        number | null
    >(null);

    const trimmedQuery = searchQuery.trim();
    const canSearch = trimmedQuery.length >= MIN_SEARCH_LENGTH;
    const showList = open && venues.length > 0;

    const runFetch = useCallback(async (search: string) => {
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        try {
            const list = await fetchVenues(search, controller.signal);
            if (!controller.signal.aborted) {
                setVenues(list);
                setOpen(list.length > 0 && inputFocusedRef.current);
            }
        } catch {
            if (!controller.signal.aborted) {
                setVenues([]);
                setOpen(false);
            }
        }
    }, []);

    useEffect(() => {
        if (!canSearch) {
            return;
        }

        const timerId = window.setTimeout(() => {
            void runFetch(trimmedQuery);
        }, 300);

        return () => {
            window.clearTimeout(timerId);
        };
    }, [canSearch, trimmedQuery, runFetch]);

    useEffect(() => {
        setHighlightedIndex(null);
    }, [searchQuery]);

    useEffect(() => {
        if (!showList) {
            setHighlightedIndex(null);
            return;
        }
        setHighlightedIndex((prev) => {
            if (prev === null || venues.length === 0) {
                return null;
            }
            return Math.min(prev, venues.length - 1);
        });
    }, [showList, venues.length]);

    useEffect(() => {
        if (highlightedIndex === null || !showList) {
            return;
        }
        const venue = venues[highlightedIndex];
        if (!venue) {
            return;
        }
        window.requestAnimationFrame(() => {
            document
                .getElementById(optionId(venue.id))
                ?.scrollIntoView({ block: 'nearest' });
        });
    }, [highlightedIndex, showList, venues]);

    useLayoutEffect(() => {
        if (!showList) {
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
    }, [showList]);

    const handleOpenChange = (next: boolean) => {
        if (next && !inputFocusedRef.current) {
            return;
        }
        if (!next) {
            abortRef.current?.abort();
            abortRef.current = null;
        }
        setOpen(next);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newQuery = e.target.value;
        setSearchQuery(newQuery);
        const trimmed = newQuery.trim();
        if (trimmed.length < MIN_SEARCH_LENGTH) {
            setOpen(false);
            setVenues([]);
            abortRef.current?.abort();
            abortRef.current = null;
        }
        if (value && !venueMatchesQuery(value, newQuery)) {
            onChange(null);
        }
    };

    const handleVenueSelect = (venue: VenueSearchOption) => {
        onChange(venue);
        setSearchQuery(venue.name);
        setOpen(false);
        setVenues([]);
        setHighlightedIndex(null);
        inputRef.current?.blur();
    };

    const handleInputFocus = () => {
        inputFocusedRef.current = true;
        if (canSearch && venues.length > 0) {
            setOpen(true);
        }
    };

    const handleInputBlur = () => {
        inputFocusedRef.current = false;
        window.setTimeout(() => {
            if (!inputFocusedRef.current) {
                setOpen(false);
            }
        }, 200);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showList || venues.length === 0) {
            if (e.key === 'Escape' && showList) {
                e.preventDefault();
                handleOpenChange(false);
            }
            return;
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedIndex((prev) =>
                prev === null ? 0 : prev >= venues.length - 1 ? 0 : prev + 1,
            );
            return;
        }

        if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex((prev) =>
                prev === null
                    ? venues.length - 1
                    : prev <= 0
                      ? venues.length - 1
                      : prev - 1,
            );
            return;
        }

        if (e.key === 'Enter') {
            if (highlightedIndex === null) {
                return;
            }
            e.preventDefault();
            const venue = venues[highlightedIndex];
            if (venue) {
                handleVenueSelect(venue);
            }
            return;
        }

        if (e.key === 'Escape') {
            e.preventDefault();
            handleOpenChange(false);
        }
    };

    const displayValue = value ? value.name : searchQuery;

    const activeDescendantId =
        highlightedIndex !== null && showList
            ? optionId(venues[highlightedIndex]?.id ?? 0)
            : undefined;

    return (
        <Popover open={showList} onOpenChange={handleOpenChange} modal={false}>
            <PopoverAnchor asChild>
                <div className="w-full">
                    <Input
                        ref={inputRef}
                        id="venue-name"
                        type="text"
                        role="combobox"
                        aria-expanded={showList}
                        aria-autocomplete="list"
                        aria-controls={showList ? LISTBOX_ID : undefined}
                        aria-activedescendant={activeDescendantId}
                        value={displayValue}
                        onChange={handleInputChange}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        onKeyDown={handleKeyDown}
                        placeholder="Search venues..."
                        required={required}
                        autoComplete="off"
                    />
                </div>
            </PopoverAnchor>
            <PopoverContent
                id={LISTBOX_ID}
                role="listbox"
                className={cn(
                    'max-h-60 overflow-auto p-0',
                    popoverContentWidth != null && 'w-auto min-w-0',
                )}
                onWheel={(e) => e.stopPropagation()}
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
                {showList ? (
                    <div className="py-1">
                        {venues.map((venue, index) => {
                            const isKeyboardActive = highlightedIndex === index;
                            return (
                                <button
                                    key={venue.id}
                                    id={optionId(venue.id)}
                                    type="button"
                                    role="option"
                                    aria-selected={value?.id === venue.id}
                                    className={cn(
                                        'w-full px-4 py-2 text-left hover:bg-accent focus:bg-accent focus:text-accent-foreground focus:outline-none',
                                        isKeyboardActive &&
                                            'bg-accent text-accent-foreground',
                                    )}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onMouseEnter={() =>
                                        setHighlightedIndex(index)
                                    }
                                    onClick={() => handleVenueSelect(venue)}
                                >
                                    <div className="font-medium">
                                        {venue.name}
                                    </div>
                                    <div className="text-sm">
                                        {[venue.city, venue.state]
                                            .filter(Boolean)
                                            .join(', ')}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                ) : null}
            </PopoverContent>
        </Popover>
    );
}

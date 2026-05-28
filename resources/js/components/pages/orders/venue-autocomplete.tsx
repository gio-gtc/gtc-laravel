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

    const displayValue = value ? value.name : searchQuery;

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
                        value={displayValue}
                        onChange={handleInputChange}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        placeholder="Search venues..."
                        required={required}
                        autoComplete="off"
                    />
                </div>
            </PopoverAnchor>
            <PopoverContent
                className={cn(
                    'max-h-60 overflow-auto p-0',
                    popoverContentWidth != null && 'w-auto min-w-0',
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
                {showList ? (
                    <div className="py-1">
                        {venues.map((venue) => (
                            <button
                                key={venue.id}
                                type="button"
                                className="w-full px-4 py-2 text-left hover:bg-accent focus:bg-accent focus:text-accent-foreground focus:outline-none"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handleVenueSelect(venue)}
                            >
                                <div className="font-medium">{venue.name}</div>
                                <div className="text-sm">
                                    {[venue.city, venue.state]
                                        .filter(Boolean)
                                        .join(', ')}
                                </div>
                            </button>
                        ))}
                    </div>
                ) : null}
            </PopoverContent>
        </Popover>
    );
}

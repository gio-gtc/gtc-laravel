import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverAnchor,
    PopoverContent,
} from '@/components/ui/popover';
import {
    CLIENT_SEARCH_DEBOUNCE_MS,
    clientDisplayLabel,
    clientMatchesQuery,
    clientSecondaryLabel,
    fetchClients,
    MIN_CLIENT_SEARCH_LENGTH,
} from '@/lib/orders/client-search';
import { cn } from '@/lib/utils';
import type { ClientSearchOption } from '@/types/orders-api';
import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';

const LISTBOX_ID = 'client-autocomplete-listbox';
const optionId = (clientId: number) =>
    `${LISTBOX_ID}-opt-${clientId}`;

interface ClientAutocompleteProps {
    value: ClientSearchOption | null;
    onChange: (client: ClientSearchOption | null) => void;
    required?: boolean;
}

export default function ClientAutocomplete({
    value,
    onChange,
    required = false,
}: ClientAutocompleteProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const inputFocusedRef = useRef(false);
    const abortRef = useRef<AbortController | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [open, setOpen] = useState(false);
    const [clients, setClients] = useState<ClientSearchOption[]>([]);
    const [highlightedIndex, setHighlightedIndex] = useState<number | null>(
        null,
    );
    const [popoverContentWidth, setPopoverContentWidth] = useState<
        number | null
    >(null);

    const trimmedQuery = searchQuery.trim();
    const canSearch = trimmedQuery.length >= MIN_CLIENT_SEARCH_LENGTH;
    const showList = open && clients.length > 0;

    const runFetch = useCallback(async (search: string) => {
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        try {
            const list = await fetchClients(search, controller.signal);
            if (!controller.signal.aborted) {
                setClients(list);
                setOpen(list.length > 0 && inputFocusedRef.current);
            }
        } catch {
            if (!controller.signal.aborted) {
                setClients([]);
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
        }, CLIENT_SEARCH_DEBOUNCE_MS);

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
            if (prev === null || clients.length === 0) {
                return null;
            }
            return Math.min(prev, clients.length - 1);
        });
    }, [showList, clients.length]);

    useEffect(() => {
        if (highlightedIndex === null || !showList) {
            return;
        }
        const client = clients[highlightedIndex];
        if (!client) {
            return;
        }
        window.requestAnimationFrame(() => {
            document
                .getElementById(optionId(client.id))
                ?.scrollIntoView({ block: 'nearest' });
        });
    }, [highlightedIndex, showList, clients]);

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
        if (trimmed.length < MIN_CLIENT_SEARCH_LENGTH) {
            setOpen(false);
            setClients([]);
            abortRef.current?.abort();
            abortRef.current = null;
        }
        if (value && !clientMatchesQuery(value, newQuery)) {
            onChange(null);
        }
    };

    const handleClientSelect = (client: ClientSearchOption) => {
        onChange(client);
        setSearchQuery(clientDisplayLabel(client));
        setOpen(false);
        setClients([]);
        setHighlightedIndex(null);
        inputRef.current?.blur();
    };

    const handleInputFocus = () => {
        inputFocusedRef.current = true;
        if (canSearch && clients.length > 0) {
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
        if (!showList || clients.length === 0) {
            if (e.key === 'Escape' && showList) {
                e.preventDefault();
                handleOpenChange(false);
            }
            return;
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedIndex((prev) =>
                prev === null ? 0 : prev >= clients.length - 1 ? 0 : prev + 1,
            );
            return;
        }

        if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex((prev) =>
                prev === null
                    ? clients.length - 1
                    : prev <= 0
                      ? clients.length - 1
                      : prev - 1,
            );
            return;
        }

        if (e.key === 'Enter') {
            if (highlightedIndex === null) {
                return;
            }
            e.preventDefault();
            const client = clients[highlightedIndex];
            if (client) {
                handleClientSelect(client);
            }
            return;
        }

        if (e.key === 'Escape') {
            e.preventDefault();
            handleOpenChange(false);
        }
    };

    const displayValue = value ? clientDisplayLabel(value) : searchQuery;

    const activeDescendantId =
        highlightedIndex !== null && showList
            ? optionId(clients[highlightedIndex]?.id ?? 0)
            : undefined;

    return (
        <Popover open={showList} onOpenChange={handleOpenChange} modal={false}>
            <PopoverAnchor asChild>
                <div className="w-full">
                    <Input
                        ref={inputRef}
                        id="ordered-by"
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
                        placeholder="Search clients..."
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
                        {clients.map((client, index) => {
                            const isKeyboardActive = highlightedIndex === index;
                            return (
                                <button
                                    key={client.id}
                                    id={optionId(client.id)}
                                    type="button"
                                    role="option"
                                    aria-selected={value?.id === client.id}
                                    className={cn(
                                        'w-full px-4 py-2 text-left hover:bg-accent focus:bg-accent focus:text-accent-foreground focus:outline-none',
                                        isKeyboardActive &&
                                            'bg-accent text-accent-foreground',
                                    )}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onMouseEnter={() =>
                                        setHighlightedIndex(index)
                                    }
                                    onClick={() => handleClientSelect(client)}
                                >
                                    <div className="font-medium">
                                        {clientDisplayLabel(client)}
                                    </div>
                                    <div className="text-sm">
                                        {clientSecondaryLabel(client)}
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

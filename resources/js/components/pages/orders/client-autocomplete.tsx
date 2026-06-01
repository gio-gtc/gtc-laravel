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

    const displayValue = value ? clientDisplayLabel(value) : searchQuery;

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
                        value={displayValue}
                        onChange={handleInputChange}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        placeholder="Search clients..."
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
                        {clients.map((client) => (
                            <button
                                key={client.id}
                                type="button"
                                className="w-full px-4 py-2 text-left hover:bg-accent focus:bg-accent focus:text-accent-foreground focus:outline-none"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handleClientSelect(client)}
                            >
                                <div className="font-medium">
                                    {clientDisplayLabel(client)}
                                </div>
                                <div className="text-sm">
                                    {clientSecondaryLabel(client)}
                                </div>
                            </button>
                        ))}
                    </div>
                ) : null}
            </PopoverContent>
        </Popover>
    );
}

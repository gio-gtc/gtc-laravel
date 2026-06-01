import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { resolveClientForOrder } from '@/lib/orders/orders-filter-users';
import { cn } from '@/lib/utils';
import type { ApiOrder, GroupedOrders } from '@/types/orders-api';
import type { User } from '@/types';
import { Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

export type SuggestionType =
    | 'tour'
    | 'region'
    | 'venue'
    | 'client'
    | 'collaborator';

export type SuggestionItem = {
    type: SuggestionType;
    value: string;
    label: string;
};

interface OrdersSearchFilterProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    groupedData: GroupedOrders[];
    clientUsers: User[];
    getOrderAssignees: (order: ApiOrder) => User[];
    expandedWidth?: string;
    transitionDuration?: number;
    className?: string;
}

const TYPE_LABELS: Record<SuggestionType, string> = {
    tour: 'Tour',
    region: 'Region',
    venue: 'Venue',
    client: 'Client',
    collaborator: 'Collaborator',
};

export default function OrdersSearchFilter({
    searchQuery,
    onSearchChange,
    groupedData,
    clientUsers,
    getOrderAssignees,
    expandedWidth = 'w-64',
    transitionDuration = 300,
    className,
}: OrdersSearchFilterProps) {
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [showSearchContent, setShowSearchContent] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const allSuggestions = useMemo<SuggestionItem[]>(() => {
        const seen = new Set<string>();
        const items: SuggestionItem[] = [];

        for (const group of groupedData) {
            const tourName = group.tour.name;
            if (tourName && !seen.has(`tour:${tourName}`)) {
                seen.add(`tour:${tourName}`);
                items.push({
                    type: 'tour',
                    value: tourName,
                    label: `${TYPE_LABELS.tour}: ${tourName}`,
                });
            }

            for (const order of group.orders) {
                if (order.is_demo) {
                    if (!seen.has('venue:Demo')) {
                        seen.add('venue:Demo');
                        items.push({
                            type: 'venue',
                            value: 'Demo',
                            label: `${TYPE_LABELS.venue}: Demo`,
                        });
                    }
                    const assignees = getOrderAssignees(order);
                    for (const collab of assignees) {
                        if (
                            collab.name &&
                            !seen.has(`collaborator:${collab.name}`)
                        ) {
                            seen.add(`collaborator:${collab.name}`);
                            items.push({
                                type: 'collaborator',
                                value: collab.name,
                                label: `${TYPE_LABELS.collaborator}: ${collab.name}`,
                            });
                        }
                    }
                    continue;
                }

                const venue = order.venue;
                if (venue) {
                    const region = `${venue.city ?? ''}, ${venue.state ?? ''}`;
                    if (region.trim() && !seen.has(`region:${region}`)) {
                        seen.add(`region:${region}`);
                        items.push({
                            type: 'region',
                            value: region,
                            label: `${TYPE_LABELS.region}: ${region}`,
                        });
                    }

                    if (venue.name && !seen.has(`venue:${venue.name}`)) {
                        seen.add(`venue:${venue.name}`);
                        items.push({
                            type: 'venue',
                            value: venue.name,
                            label: `${TYPE_LABELS.venue}: ${venue.name}`,
                        });
                    }
                }

                const client = resolveClientForOrder(order, clientUsers);
                if (client?.name && !seen.has(`client:${client.name}`)) {
                    seen.add(`client:${client.name}`);
                    items.push({
                        type: 'client',
                        value: client.name,
                        label: `${TYPE_LABELS.client}: ${client.name}`,
                    });
                }

                const assignees = getOrderAssignees(order);
                for (const collab of assignees) {
                    if (
                        collab.name &&
                        !seen.has(`collaborator:${collab.name}`)
                    ) {
                        seen.add(`collaborator:${collab.name}`);
                        items.push({
                            type: 'collaborator',
                            value: collab.name,
                            label: `${TYPE_LABELS.collaborator}: ${collab.name}`,
                        });
                    }
                }
            }
        }

        return items;
    }, [groupedData, clientUsers, getOrderAssignees]);

    const filteredSuggestions = useMemo(() => {
        if (!searchQuery.trim()) return allSuggestions;
        const query = searchQuery.toLowerCase().trim();
        return allSuggestions.filter((item) =>
            item.value.toLowerCase().includes(query),
        );
    }, [allSuggestions, searchQuery]);

    useEffect(() => {
        if (isSearchExpanded) {
            setShowSearchContent(true);
        } else {
            const timer = setTimeout(() => {
                setShowSearchContent(false);
                setIsDropdownOpen(false);
                setHighlightedIndex(-1);
            }, transitionDuration);
            return () => clearTimeout(timer);
        }
    }, [isSearchExpanded, transitionDuration]);

    useEffect(() => {
        setIsDropdownOpen(
            isSearchExpanded &&
                searchQuery.length >= 1 &&
                filteredSuggestions.length > 0,
        );
        setHighlightedIndex(-1);
    }, [isSearchExpanded, searchQuery, filteredSuggestions.length]);

    const handleClear = () => {
        onSearchChange('');
        setIsSearchExpanded(false);
    };

    const handleSuggestionSelect = (suggestion: SuggestionItem) => {
        onSearchChange(suggestion.value);
        setIsDropdownOpen(false);
        setHighlightedIndex(-1);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isDropdownOpen || filteredSuggestions.length === 0) {
            if (e.key === 'Escape') {
                setIsSearchExpanded(false);
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    prev < filteredSuggestions.length - 1 ? prev + 1 : prev,
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0) {
                    handleSuggestionSelect(
                        filteredSuggestions[highlightedIndex],
                    );
                }
                break;
            case 'Escape':
                e.preventDefault();
                setIsDropdownOpen(false);
                setHighlightedIndex(-1);
                break;
        }
    };

    const transitionStyle = {
        transitionDuration: `${transitionDuration}ms`,
    };

    return (
        <div
            ref={containerRef}
            className={cn(
                'relative flex items-center overflow-visible pr-[2px] transition-[width] ease-in-out',
                isSearchExpanded ? expandedWidth : 'w-9',
                className,
            )}
            style={transitionStyle}
        >
            {showSearchContent ? (
                <>
                    <Search
                        className={cn(
                            'pointer-events-none absolute left-2 z-10 size-3.5 text-muted-foreground transition-opacity ease-in-out',
                            isSearchExpanded ? 'opacity-100' : 'opacity-0',
                        )}
                        style={transitionStyle}
                    />
                    <Input
                        type="text"
                        placeholder="Search tour, region, venue, clients..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={() => {
                            setTimeout(() => {
                                setIsDropdownOpen(false);
                                setHighlightedIndex(-1);
                            }, 200);
                        }}
                        className={cn(
                            'h-6.5 w-full pr-6.5 pl-6.5 transition-opacity ease-in-out',
                            isSearchExpanded ? 'opacity-100' : 'opacity-0',
                        )}
                        style={transitionStyle}
                        autoFocus={isSearchExpanded}
                    />
                    <Button
                        variant="ghost"
                        type="button"
                        className={cn(
                            'absolute right-1 z-10 size-3.5 h-5 transition-opacity ease-in-out',
                            isSearchExpanded ? 'opacity-100' : 'opacity-0',
                        )}
                        style={transitionStyle}
                        onClick={handleClear}
                    >
                        <X className="size-3.5" />
                    </Button>
                    {isDropdownOpen && (
                        <div className="absolute top-full right-0 left-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border bg-popover shadow-md">
                            {filteredSuggestions.map((suggestion, index) => (
                                <button
                                    key={`${suggestion.type}-${suggestion.value}`}
                                    type="button"
                                    className={cn(
                                        'w-full px-4 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground focus:outline-none',
                                        index === highlightedIndex &&
                                            'bg-accent text-accent-foreground',
                                    )}
                                    onClick={() =>
                                        handleSuggestionSelect(suggestion)
                                    }
                                    onMouseEnter={() =>
                                        setHighlightedIndex(index)
                                    }
                                >
                                    <span className="font-medium">
                                        {suggestion.value}
                                    </span>
                                    <span className="ml-2 text-xs text-muted-foreground">
                                        {TYPE_LABELS[suggestion.type]}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <Button
                    variant="outline"
                    type="button"
                    className="h-[32px] w-9 rounded-full"
                    onClick={() => setIsSearchExpanded(true)}
                >
                    <Search className="size-3.5 text-gray-400" />
                </Button>
            )}
        </div>
    );
}

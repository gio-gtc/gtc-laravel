import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { type Tour, type TourVenue, type User, type Venue } from '@/types';

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

type GroupedOrderData = {
    order: Tour;
    venues: Array<{
        orderVenue: TourVenue;
        venue: Venue;
    }>;
};

interface OrdersSearchFilterProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    groupedData: GroupedOrderData[];
    getClientUser: (clientId: number) => User | undefined;
    getVenueCollaborators: (venueId: number) => User[];
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
    getClientUser,
    getVenueCollaborators,
    expandedWidth = 'w-64',
    transitionDuration = 300,
    className,
}: OrdersSearchFilterProps) {
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [showSearchContent, setShowSearchContent] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Build unique suggestions from grouped data
    const allSuggestions = useMemo<SuggestionItem[]>(() => {
        const seen = new Set<string>();
        const items: SuggestionItem[] = [];

        for (const group of groupedData) {
            // Tour names
            const tourName = group.order.name;
            if (tourName && !seen.has(`tour:${tourName}`)) {
                seen.add(`tour:${tourName}`);
                items.push({
                    type: 'tour',
                    value: tourName,
                    label: `${TYPE_LABELS.tour}: ${tourName}`,
                });
            }

            for (const { orderVenue, venue } of group.venues) {
                // Regions (city, state)
                const region = `${venue.city}, ${venue.state}`;
                if (region && !seen.has(`region:${region}`)) {
                    seen.add(`region:${region}`);
                    items.push({
                        type: 'region',
                        value: region,
                        label: `${TYPE_LABELS.region}: ${region}`,
                    });
                }

                // Venue names
                if (venue.name && !seen.has(`venue:${venue.name}`)) {
                    seen.add(`venue:${venue.name}`);
                    items.push({
                        type: 'venue',
                        value: venue.name,
                        label: `${TYPE_LABELS.venue}: ${venue.name}`,
                    });
                }

                // Clients
                const client = getClientUser(orderVenue.client);
                if (client?.name && !seen.has(`client:${client.name}`)) {
                    seen.add(`client:${client.name}`);
                    items.push({
                        type: 'client',
                        value: client.name,
                        label: `${TYPE_LABELS.client}: ${client.name}`,
                    });
                }

                // Collaborators
                const collaborators = getVenueCollaborators(venue.id);
                for (const collab of collaborators) {
                    if (collab.name && !seen.has(`collaborator:${collab.name}`)) {
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
    }, [groupedData, getClientUser, getVenueCollaborators]);

    // Filter suggestions by search query
    const filteredSuggestions = useMemo(() => {
        if (!searchQuery.trim()) return allSuggestions;
        const query = searchQuery.toLowerCase().trim();
        return allSuggestions.filter((item) =>
            item.value.toLowerCase().includes(query),
        );
    }, [allSuggestions, searchQuery]);

    // Handle smooth open/close transitions
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

    // Show dropdown when expanded, has query, and has suggestions
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
                    handleSuggestionSelect(filteredSuggestions[highlightedIndex]);
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
                'relative flex items-center overflow-visible transition-[width] ease-in-out',
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
                        <div
                            ref={dropdownRef}
                            className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-auto rounded-md border bg-popover shadow-md"
                        >
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
                    className="w-9 rounded-full"
                    onClick={() => setIsSearchExpanded(true)}
                >
                    <Search className="size-3.5 text-gray-400" />
                </Button>
            )}
        </div>
    );
}

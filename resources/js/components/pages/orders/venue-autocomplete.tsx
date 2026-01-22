import { venuesData } from '@/components/mockdata';
import { Input } from '@/components/ui/input';
import { type Venue } from '@/types';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';

interface VenueAutocompleteProps {
    value: Venue | null;
    onChange: (venue: Venue | null) => void;
    required?: boolean;
}

export default function VenueAutocomplete({
    value,
    onChange,
    required = false,
}: VenueAutocompleteProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    // Filter venues based on search query
    const filteredVenues = useMemo(() => {
        if (!searchQuery.trim()) {
            return venuesData;
        }
        const query = searchQuery.toLowerCase();
        return venuesData.filter((venue) =>
            venue.name.toLowerCase().includes(query),
        );
    }, [searchQuery]);

    // Update search query when value changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newQuery = e.target.value;
        setSearchQuery(newQuery);
        setIsOpen(true);
        // Clear selection if input doesn't match selected venue
        if (
            value &&
            !value.name.toLowerCase().includes(newQuery.toLowerCase())
        ) {
            onChange(null);
        }
    };

    const handleVenueSelect = (venue: Venue) => {
        onChange(venue);
        setSearchQuery(venue.name);
        setIsOpen(false);
    };

    const handleInputFocus = () => {
        setIsOpen(true);
    };

    const handleInputBlur = () => {
        // Delay closing to allow click events to fire
        setTimeout(() => setIsOpen(false), 200);
    };

    // Initialize search query with selected venue name
    const displayValue = value ? value.name : searchQuery;

    return (
        <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                id="venue-name"
                type="text"
                value={displayValue}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                placeholder="Search venues..."
                className="pl-9"
                required={required}
            />
            {isOpen && filteredVenues.length > 0 && (
                <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover shadow-md">
                    {filteredVenues.map((venue) => (
                        <button
                            key={venue.id}
                            type="button"
                            className="w-full px-4 py-2 text-left hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
                            onClick={() => handleVenueSelect(venue)}
                        >
                            <div className="font-medium">{venue.name}</div>
                            <div className="text-sm text-muted-foreground">
                                {venue.city}, {venue.state}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

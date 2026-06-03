import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface OrdersSearchFilterProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    isSearching?: boolean;
    expandedWidth?: string;
    transitionDuration?: number;
    className?: string;
}

export default function OrdersSearchFilter({
    searchQuery,
    onSearchChange,
    isSearching = false,
    expandedWidth = 'w-64',
    transitionDuration = 300,
    className,
}: OrdersSearchFilterProps) {
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [showSearchContent, setShowSearchContent] = useState(false);
    const [localQuery, setLocalQuery] = useState(searchQuery);
    const containerRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        setLocalQuery(searchQuery);
    }, [searchQuery]);

    useEffect(() => {
        if (isSearchExpanded) {
            const timer = setTimeout(() => setShowSearchContent(true), 50);
            return () => clearTimeout(timer);
        }
        setShowSearchContent(false);
    }, [isSearchExpanded]);

    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    const handleChange = (value: string) => {
        setLocalQuery(value);
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => {
            onSearchChange(value);
        }, 400);
    };

    const handleClear = () => {
        setLocalQuery('');
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        onSearchChange('');
    };

    return (
        <div
            ref={containerRef}
            className={cn('relative flex items-center', className)}
        >
            <div
                className={cn(
                    'flex items-center overflow-hidden transition-all ease-in-out',
                    isSearchExpanded ? expandedWidth : 'w-9',
                )}
                style={{ transitionDuration: `${transitionDuration}ms` }}
            >
                <Button
                    variant="outline"
                    size="md"
                    className="size-9 shrink-0 p-0"
                    onClick={() => setIsSearchExpanded((prev) => !prev)}
                    aria-label="Toggle search"
                >
                    <Search className="size-3 text-gray-400" />
                </Button>

                {showSearchContent && (
                    <div className="relative ml-1 flex-1">
                        <Input
                            value={localQuery}
                            onChange={(e) => handleChange(e.target.value)}
                            placeholder="Search tours, venues, clients…"
                            className="h-9 pr-8"
                            autoFocus
                        />
                        {localQuery && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                aria-label="Clear search"
                            >
                                <X className="size-3" />
                            </button>
                        )}
                        {isSearching && (
                            <span className="absolute top-1/2 right-8 -translate-y-1/2 text-xs text-gray-400">
                                …
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

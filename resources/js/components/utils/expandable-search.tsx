import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ExpandableSearchProps {
    /**
     * Callback fired when the search query changes
     */
    onSearchChange: (query: string) => void;
    /**
     * Placeholder text for the search input
     */
    placeholder?: string;
    /**
     * Width of the expanded search input (default: 'w-64')
     */
    expandedWidth?: string;
    /**
     * Duration of the transition animation in milliseconds (default: 300)
     */
    transitionDuration?: number;
    /**
     * Optional className for the container
     */
    className?: string;
}

/**
 * Reusable expandable search component with smooth animations.
 * Transforms from an icon button to a full search input when clicked.
 */
export function ExpandableSearch({
    onSearchChange,
    placeholder = 'Search...',
    expandedWidth = 'w-64',
    transitionDuration = 300,
    className,
}: ExpandableSearchProps) {
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [showSearchContent, setShowSearchContent] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Handle smooth open/close transitions
    useEffect(() => {
        if (isSearchExpanded) {
            // Immediately show content when opening
            setShowSearchContent(true);
        } else {
            // Delay hiding content until after width animation completes
            const timer = setTimeout(() => {
                setShowSearchContent(false);
            }, transitionDuration);
            return () => clearTimeout(timer);
        }
    }, [isSearchExpanded, transitionDuration]);

    // Notify parent of search query changes
    useEffect(() => {
        onSearchChange(searchQuery);
    }, [searchQuery, onSearchChange]);

    const handleClear = () => {
        setSearchQuery('');
        setIsSearchExpanded(false);
    };

    const transitionStyle = {
        transitionDuration: `${transitionDuration}ms`,
    };

    return (
        <div
            className={cn(
                'relative flex items-center overflow-hidden transition-[width] ease-in-out',
                isSearchExpanded ? expandedWidth : 'w-9',
                className,
            )}
            style={transitionStyle}
        >
            {showSearchContent ? (
                <>
                    <Search
                        className={cn(
                            'pointer-events-none absolute left-3 z-10 h-4 w-4 text-muted-foreground transition-opacity ease-in-out',
                            isSearchExpanded ? 'opacity-100' : 'opacity-0',
                        )}
                        style={transitionStyle}
                    />
                    <Input
                        type="text"
                        placeholder={placeholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={cn(
                            'h-9 w-full pr-9 pl-9 transition-opacity ease-in-out',
                            isSearchExpanded ? 'opacity-100' : 'opacity-0',
                        )}
                        style={transitionStyle}
                        autoFocus={isSearchExpanded}
                    />
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            'absolute right-1 z-10 h-7 w-7 transition-opacity ease-in-out',
                            isSearchExpanded ? 'opacity-100' : 'opacity-0',
                        )}
                        style={transitionStyle}
                        onClick={handleClear}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </>
            ) : (
                <Button
                    variant="outline"
                    size="icon"
                    className="w-9"
                    onClick={() => setIsSearchExpanded(true)}
                >
                    <Search className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
}

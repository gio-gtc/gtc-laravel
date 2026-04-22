import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ExpandableSearchProps {
    onSearchChange: (query: string) => void;
    placeholder?: string;
    expandedWidth?: string;
    transitionDuration?: number;
    className?: string;
}

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
                        placeholder={placeholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={cn(
                            'h-6.5 w-full pr-6.5 pl-6.5 transition-opacity ease-in-out',
                            isSearchExpanded ? 'opacity-100' : 'opacity-0',
                        )}
                        style={transitionStyle}
                        autoFocus={isSearchExpanded}
                    />
                    <Button
                        variant="ghost"
                        className={cn(
                            'absolute right-1 z-10 size-3.5 h-5 transition-opacity ease-in-out',
                            isSearchExpanded ? 'opacity-100' : 'opacity-0',
                        )}
                        style={transitionStyle}
                        onClick={handleClear}
                    >
                        <X className="size-3.5" />
                    </Button>
                </>
            ) : (
                <Button
                    variant="outline"
                    className="h-[32px] w-9 rounded-full"
                    onClick={() => setIsSearchExpanded(true)}
                >
                    <Search className="size-3.5 text-gray-400" />
                </Button>
            )}
        </div>
    );
}

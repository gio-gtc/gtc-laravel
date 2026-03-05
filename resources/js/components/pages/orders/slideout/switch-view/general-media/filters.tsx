import { Button } from '@/components/ui/button';
import { ArrowUpDown, Filter, X } from 'lucide-react';

export default function Filters() {
    return (
        // TODO: ask how this is suppose to work?
        <div className="flex items-center justify-end gap-2">
            <Button variant="outline">
                Still in Cart, +5
                <X className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline">
                <Filter className="h-4 w-4" />
            </Button>
            <Button variant="outline">
                <ArrowUpDown className="h-4 w-4" />
            </Button>
        </div>
    );
}

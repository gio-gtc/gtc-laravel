import { Button } from '@/components/ui/button';
import { ArrowUpDown, Filter, X } from 'lucide-react';

export default function Filters() {
    return (
        <div className="flex items-center justify-end gap-2">
            <Button variant="outline">
                Still in Cart, +5
                <X className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
                <ArrowUpDown className="h-4 w-4" />
            </Button>
        </div>
    );
}

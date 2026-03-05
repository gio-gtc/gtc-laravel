import { cn } from '@/lib/utils';

function Divider({ className = '' }: { className?: string }) {
    return <hr className={cn('h-px border-0 bg-gray-300', className)} />;
}

export default Divider;

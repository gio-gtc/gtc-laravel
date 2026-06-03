import { Skeleton } from '@/components/ui/skeleton';

export default function OrderSlideoutSkeleton() {
    return (
        <div className="flex flex-col gap-4 p-4">
            <div className="space-y-2">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
        </div>
    );
}

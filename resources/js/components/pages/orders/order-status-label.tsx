import { orderStatusIconConfig } from '@/lib/orders/order-status';
import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/types/orders-api';

type OrderStatusLabelProps = {
    status: OrderStatus;
    className?: string;
};

export default function OrderStatusLabel({
    status,
    className,
}: OrderStatusLabelProps) {
    const { icon: Icon, containerClass } = orderStatusIconConfig(status);

    return (
        <div
            className={cn(
                'flex h-[24px] w-[24px] items-center justify-center rounded-md text-white',
                containerClass,
                className,
            )}
        >
            <Icon className="size-4" aria-hidden />
        </div>
    );
}

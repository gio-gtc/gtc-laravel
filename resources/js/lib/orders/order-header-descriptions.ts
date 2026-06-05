import type { OrderHeaderDescriptionKey } from '@/types/orders-api';

export const ORDER_HEADER_DESCRIPTION_FIELDS: ReadonlyArray<{
    key: OrderHeaderDescriptionKey;
    label: string;
    multiline: boolean;
}> = [
    { key: 'ticket_outlets', label: 'Ticket Outlets', multiline: false },
    { key: 'on_same_date', label: 'On Same Date', multiline: false },
    { key: 'cardholder_times', label: 'Cardholder Times', multiline: false },
    { key: 'logos', label: 'Logos', multiline: false },
    {
        key: 'special_instructions',
        label: 'Special Instructions',
        multiline: true,
    },
] as const;

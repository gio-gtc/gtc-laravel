import type { ComponentType } from 'react';
import type { BlockKind } from '@/types/forms';
import { ItemListBlock } from './item-list-block';
import { CtaSelectorBlock } from './cta-selector-block';
import { CustomSizesBlock } from './custom-sizes-block';
import { OrderInfoBlock } from './order-info-block';
import type { BlockRendererProps } from './types';

export const blockRegistry: Record<BlockKind, ComponentType<BlockRendererProps>> = {
    item_list: ItemListBlock,
    cta_selector: CtaSelectorBlock,
    custom_sizes: CustomSizesBlock,
    order_info: OrderInfoBlock,
};

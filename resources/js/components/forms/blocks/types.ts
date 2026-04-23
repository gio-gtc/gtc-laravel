import type { AnswersMap, BlockDescriptor, BlockValue } from '@/types/forms';

export interface BlockRendererProps {
    block: BlockDescriptor;
    value: BlockValue | undefined;
    allValues: AnswersMap;
    onChange: (next: BlockValue) => void;
    errors: Record<string, string | string[]>;
    uploadAction: string;
    scope: string;
    /**
     * Unique prefix for HTML `name`/`id` when the same block definition is
     * embedded multiple times (e.g. CTA radios per item_list). Prevents browser
     * radio groups from merging across sections.
     */
    htmlFieldPrefix?: string;
}

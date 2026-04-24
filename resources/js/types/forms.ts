/**
 * Shared types used by the schema-driven form runtime. The shapes must match
 * the output of {@link \App\Support\SchemaResolver}.
 */

import type { ConditionRule } from '@/lib/forms/conditions';

export type BlockKind = 'item_list' | 'cta_selector' | 'custom_sizes' | 'order_info';

export interface ItemDescriptor {
    key: string;
    name: string;
    platform?: string | null;
    width?: number | null;
    height?: number | null;
    unit?: string;
    meta?: Record<string, unknown> | null;
}

export interface PresetOption {
    value: string;
    label: string;
}

export interface SelectOption {
    value: string;
    label: string;
}

export interface FieldDescriptor {
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'email' | 'number' | 'integer' | 'boolean' | 'date' | 'datetime' | 'select' | 'file' | 'attachments';
    required?: boolean;
    options?: SelectOption[];
    visibleIf?: ConditionRule;
    requiredIf?: ConditionRule;
    maxLength?: number;
    min?: number;
    max?: number;
    placeholder?: string;
    helpText?: string;
    accept?: string;
    maxSizeMb?: number;
    scope?: 'submission' | 'venue';
}

export interface BlockDescriptor {
    key: string;
    name: string;
    kind: BlockKind;
    items: ItemDescriptor[];
    fields: FieldDescriptor[];
    presets: PresetOption[];
    embeds: Record<string, BlockDescriptor>;
}

export interface FileDescriptor {
    path: string;
    url: string;
    size: number;
    mime: string;
    name?: string;
}

export interface ItemListBlockValue {
    selected: string[];
    [embedKey: string]: unknown;
}

export interface CtaSelectorValue {
    presets: string[];
    custom: { label: string }[];
}

export interface CustomSizeRow {
    name: string;
    width: number;
    height: number;
}

export type BlockValue =
    | ItemListBlockValue
    | CtaSelectorValue
    | CustomSizeRow[]
    | Record<string, unknown>;

export type AnswersMap = Record<string, BlockValue>;

/**
 * JSON payload returned by `GET /venue-forms/{mock_venue_id}/schema`. The
 * modal fetches this on open and hands it straight to {@link SchemaForm}.
 */
export interface VenueFormSchemaResponse {
    venue: {
        id: number;
        name: string;
        slug: string;
        mock_venue_id: number | null;
        attributes: Record<string, unknown>;
    };
    blocks: BlockDescriptor[];
    jsonSchema: Record<string, unknown>;
    submitAction: string;
    uploadAction: string;
    scope: string;
}

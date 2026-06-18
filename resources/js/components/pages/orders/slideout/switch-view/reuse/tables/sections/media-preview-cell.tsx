import { AudioLines, Link, PlayIcon } from 'lucide-react';
import type { MouseEvent } from 'react';

export type MediaPreviewKind = 'video' | 'audio';

type MediaPreviewCellProps = {
    kind: MediaPreviewKind;
    visible: boolean;
    onPreviewClick?: (iconIndex: number) => void;
};

const columnShieldProps = {
    'data-slideout-column-shield': true,
    onMouseDown: (e: MouseEvent<HTMLDivElement>) => e.preventDefault(),
    onClick: (e: MouseEvent<HTMLDivElement>) => e.stopPropagation(),
} as const;

export function MediaPreviewCell({
    kind,
    visible,
    onPreviewClick,
}: MediaPreviewCellProps) {
    if (!visible) {
        return <span className="text-muted-foreground"></span>;
    }

    if (kind === 'audio') {
        return (
            <div
                {...columnShieldProps}
                className="flex items-center justify-center gap-2"
            >
                <button
                    type="button"
                    className="cursor-pointer text-gray-400 hover:text-gray-900"
                    onClick={(e) => {
                        e.stopPropagation();
                        onPreviewClick?.(0);
                    }}
                >
                    <AudioLines className="size-3.5 stroke-3" />
                </button>
            </div>
        );
    }

    return (
        <div
            {...columnShieldProps}
            className="flex items-center justify-center gap-2 text-gray-400"
        >
            <button
                type="button"
                className="cursor-pointer hover:text-gray-900"
                onClick={(e) => {
                    e.stopPropagation();
                    onPreviewClick?.(0);
                }}
            >
                <PlayIcon className="size-3.5 stroke-3" />
            </button>
            <button
                type="button"
                className="cursor-pointer hover:text-gray-900"
                onClick={(e) => {
                    e.stopPropagation();
                    onPreviewClick?.(1);
                }}
            >
                <Link className="size-3.5 rotate-45 stroke-3" />
            </button>
        </div>
    );
}

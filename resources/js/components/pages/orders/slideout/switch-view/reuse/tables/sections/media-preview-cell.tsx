import { AudioLines, Link, PlayIcon } from 'lucide-react';

export type MediaPreviewKind = 'video' | 'audio';

type MediaPreviewCellProps = {
    kind: MediaPreviewKind;
    disabled: boolean;
    onPreviewClick?: (iconIndex: number) => void;
};

export function MediaPreviewCell({
    kind,
    disabled,
    onPreviewClick,
}: MediaPreviewCellProps) {
    if (disabled) {
        return <span className="text-muted-foreground"></span>;
    }

    if (kind === 'audio') {
        return (
            <div className="flex items-center justify-center gap-2">
                <button
                    type="button"
                    className="cursor-pointer text-gray-400 hover:text-gray-900"
                    onClick={() => onPreviewClick?.(0)}
                >
                    <AudioLines className="size-3.5" />
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center gap-2 text-gray-400">
            <button
                type="button"
                className="cursor-pointer hover:text-gray-900"
                onClick={() => onPreviewClick?.(0)}
            >
                <PlayIcon className="size-3.5" />
            </button>
            <button
                type="button"
                className="cursor-pointer hover:text-gray-900"
                onClick={() => onPreviewClick?.(1)}
            >
                <Link className="size-3.5 rotate-45" />
            </button>
        </div>
    );
}

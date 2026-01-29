import type { AnyExtension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';

const baseClass =
    'prose prose-sm w-full max-w-none focus:outline-none min-h-[40px] overflow-y-auto text-gray-900';

export const chatEditorBaseExtensions: AnyExtension[] = [StarterKit];

export const CHAT_EDITOR_CLASS = {
    input: `${baseClass} max-h-[150px] px-3 pt-2 pb-10`,
    inline: `${baseClass} max-h-[120px] px-3 py-2 rounded-xl border`,
} as const;

export interface ChatEditorKeyDownOptions {
    /** Called when Enter is pressed (without Shift). Receives the editor view (e.g. for form.requestSubmit()). */
    onEnter?: (view: unknown) => void;
    onEscape?: () => void;
}

export function createChatEditorKeyDown(
    options: ChatEditorKeyDownOptions,
): (view: unknown, event: KeyboardEvent) => boolean {
    const { onEnter, onEscape } = options;
    return (view, event) => {
        if (event.key === 'Escape' && onEscape) {
            onEscape();
            return true;
        }
        if (event.key === 'Enter' && !event.shiftKey && onEnter) {
            event.preventDefault();
            onEnter(view);
            return true;
        }
        return false;
    };
}

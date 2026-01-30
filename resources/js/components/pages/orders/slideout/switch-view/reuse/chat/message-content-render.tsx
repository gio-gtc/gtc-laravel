import { emojis, shortcodeToEmoji } from '@tiptap/extension-emoji';
import React, { createElement, type ReactNode } from 'react';

/** Renders TipTap JSON doc as React with bold, italic, code, lists preserved. */
export function MessageContentRender({ content }: { content: any }) {
    if (typeof content === 'string') {
        return <span className="whitespace-pre-wrap">{content}</span>;
    }
    if (content?.type !== 'doc') {
        return <span>Unsupported content</span>;
    }
    const blocks = content.content ?? [];
    return (
        <div className="leading-relaxed space-y-1">
            {blocks.map((block: any, i: number) => (
                <BlockNode key={i} node={block} />
            ))}
        </div>
    );
}

function BlockNode({ node }: { node: any }) {
    if (!node) return null;
    const children = node.content ?? [];
    const inner = children.map((child: any, i: number) => (
        <InlineNode key={i} node={child} />
    ));

    switch (node.type) {
        case 'paragraph':
            return <p className="whitespace-pre-wrap">{inner}</p>;
        case 'heading': {
            const level = Math.min(
                6,
                Math.max(1, node.attrs?.level ?? 1),
            ) as 1 | 2 | 3 | 4 | 5 | 6;
            const headingClass =
                level === 1
                    ? 'text-lg font-bold'
                    : level === 2
                      ? 'text-base font-semibold'
                      : level === 3
                        ? 'text-sm font-semibold'
                        : level === 4
                          ? 'text-sm font-medium'
                          : 'text-xs font-medium';
            return createElement(
                `h${level}`,
                {
                    className: `whitespace-pre-wrap ${headingClass}`,
                },
                inner,
            );
        }
        case 'blockquote':
            return (
                <blockquote className="border-l-4 border-gray-300 pl-3 italic text-gray-700">
                    {children.map((child: any, i: number) => (
                        <BlockNode key={i} node={child} />
                    ))}
                </blockquote>
            );
        case 'horizontalRule':
            return <hr className="my-2 border-gray-200" />;
        case 'codeBlock':
            return (
                <pre className="overflow-x-auto rounded bg-gray-100 px-2 py-1 font-mono text-xs">
                    <code>{inner}</code>
                </pre>
            );
        case 'bulletList':
            return (
                <ul className="list-disc pl-4 space-y-0.5">
                    {children.map((child: any, i: number) => (
                        <BlockNode key={i} node={child} />
                    ))}
                </ul>
            );
        case 'orderedList':
            return (
                <ol className="list-decimal pl-4 space-y-0.5">
                    {children.map((child: any, i: number) => (
                        <BlockNode key={i} node={child} />
                    ))}
                </ol>
            );
        case 'listItem':
            return (
                <li className="whitespace-pre-wrap">
                    {children.map((child: any, i: number) => (
                        <BlockNode key={i} node={child} />
                    ))}
                </li>
            );
        default:
            return <>{inner}</>;
    }
}

function InlineNode({ node }: { node: any }): ReactNode {
    if (!node) return null;
    if (node.type === 'text') {
        let el: ReactNode = node.text ?? '';
        const marks = node.marks ?? [];
        for (const mark of marks) {
            if (mark.type === 'bold') el = <strong>{el}</strong>;
            else if (mark.type === 'italic') el = <em>{el}</em>;
            else if (mark.type === 'code')
                el = (
                    <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-xs">
                        {el}
                    </code>
                );
            else if (mark.type === 'strike') el = <s>{el}</s>;
            else if (mark.type === 'underline') el = <u>{el}</u>;
            else if (mark.type === 'link')
                el = (
                    <a
                        href={mark.attrs?.href ?? '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-gtc-red underline"
                    >
                        {el}
                    </a>
                );
        }
        return el;
    }
    if (node.type === 'hardBreak') return <br />;
    if (node.type === 'emoji') {
        const shortcode = node.attrs?.name;
        const item = shortcode ? shortcodeToEmoji(shortcode, emojis) : null;
        return (
            <span data-type="emoji" data-name={shortcode}>
                {item?.emoji ?? (shortcode ? `:${shortcode}:` : '')}
            </span>
        );
    }
    return null;
}

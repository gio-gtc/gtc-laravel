import type { ReactNode } from 'react';

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
        case 'heading':
            return (
                <p className="whitespace-pre-wrap font-semibold">{inner}</p>
            );
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
        }
        return el;
    }
    if (node.type === 'hardBreak') return <br />;
    return null;
}

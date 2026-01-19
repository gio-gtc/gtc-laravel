export function RowsColumnedChild({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col items-start gap-2 md:grid md:grid-cols-[150px_1fr]">
            {children}
        </div>
    );
}

export function ColumnedRowsParent({
    children,
}: {
    children: React.ReactNode;
}) {
    return <div className="flex flex-1 flex-col gap-2">{children}</div>;
}

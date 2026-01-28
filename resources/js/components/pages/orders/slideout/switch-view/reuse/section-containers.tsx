function SectionContainers({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="slide-out-container space-y-4">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <div className="overflow-x-auto rounded-lg border">{children}</div>
        </div>
    );
}

export default SectionContainers;

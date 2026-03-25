export default function DemoHeaderTitle({
    tourName,
    venueName,
}: {
    tourName: string;
    venueName: string;
}) {
    return (
        <header className="demo-chrome absolute top-0 right-0 z-20 px-6 py-5">
            <p className="text-right text-xs font-medium tracking-wide text-white uppercase sm:text-sm">
                {tourName}
                <span className="text-white/60"> | </span>
                {venueName}
            </p>
        </header>
    );
}

export default function DemoHeaderTitle({
    tourName,
    venueName,
}: {
    tourName: string;
    venueName: string;
}) {
    return (
        <header className="demo-chrome-header absolute top-0 left-0 z-10 px-3 py-3 pr-14 sm:px-6 sm:py-5">
            <h2 className="text-xl font-medium tracking-wide text-white uppercase sm:text-3xl">
                {tourName}
                <span className="text-gray-400">
                    <span className=""> | </span>
                    {venueName}
                </span>
            </h2>
        </header>
    );
}

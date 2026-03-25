export default function DemoHeaderTitle({
    tourName,
    venueName,
}: {
    tourName: string;
    venueName: string;
}) {
    return (
        <header className="demo-chrome-header absolute top-0 left-0 z-20 px-6 py-5">
            <h2 className="text-right font-medium tracking-wide text-white uppercase">
                {tourName}
                <span className="text-gray-400">
                    <span className=""> | </span>
                    {venueName}
                </span>
            </h2>
        </header>
    );
}

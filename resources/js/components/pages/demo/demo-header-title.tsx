export default function DemoHeaderTitle({
    tourName,
    venueName,
}: {
    tourName: string;
    venueName: string;
}) {
    return (
        <header className="demo-chrome-header">
            <h2 className="demo-chrome-header--title">
                {tourName}
                <span className="text-gray-400">
                    <span> | </span>
                    {venueName}
                </span>
            </h2>
        </header>
    );
}

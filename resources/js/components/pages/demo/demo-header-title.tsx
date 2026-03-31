export default function DemoHeaderTitle({
    tourName,
    venueName,
}: {
    tourName: string;
    venueName: string;
}) {
    return (
        <header className="absolute top-0 left-0 z-10 flex h-[145px] w-full items-center bg-black p-5 px-3 py-3 pr-14 sm:px-6 sm:py-5">
            <h2 className="demo-chrome-header text-xl font-medium tracking-wide text-white uppercase sm:text-3xl">
                {tourName}
                <span className="text-gray-400">
                    <span> | </span>
                    {venueName}
                </span>
            </h2>
        </header>
    );
}

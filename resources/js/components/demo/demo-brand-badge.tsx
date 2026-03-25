import AppLogoIcon from '@/components/app-logo-icon';

export default function DemoBrandBadge() {
    return (
        <div className="demo-chrome absolute bottom-0 left-0 z-20 p-5">
            <div className="flex w-24 items-center justify-center rounded-sm sm:w-28">
                <AppLogoIcon className="h-auto w-full" aria-hidden />
                <span className="sr-only">Global Tour Creatives</span>
            </div>
        </div>
    );
}

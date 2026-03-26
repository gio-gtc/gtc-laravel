import AppLogoIcon from '@/components/app-logo-icon';

export default function DemoBrandBadge() {
    return (
        <div className="demo-chrome-brand absolute bottom-10 left-0 z-20 p-5">
            <div className="flex w-15 items-center justify-center rounded-sm md:w-22">
                <AppLogoIcon className="h-auto w-full" aria-hidden />
                <span className="sr-only">Global Tour Creatives</span>
            </div>
        </div>
    );
}

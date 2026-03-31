import AppLogoIcon from '@/components/app-logo-icon';

export default function DemoBrandBadge() {
    return (
        <div className="h-[calc(145px - size-7)] absolute bottom-7 left-0 z-0 w-full bg-black p-5">
            <div className="demo-chrome-brand flex w-15 items-center justify-center rounded-sm md:w-22">
                <AppLogoIcon className="h-auto w-full" aria-hidden />
                <span className="sr-only">Global Tour Creatives</span>
            </div>
        </div>
    );
}

import AppLogoIcon from '@/components/app-logo-icon';

export default function DemoBrandBadge() {
    return (
        <div className="demo-chrome-brand">
            <div className="demo-chrome-brand--content">
                <AppLogoIcon className="h-auto w-full" aria-hidden />
                <span className="sr-only">Global Tour Creatives</span>
            </div>
        </div>
    );
}

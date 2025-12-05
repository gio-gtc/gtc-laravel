import AppLogoIcon from './app-logo-icon';
import { SidebarTrigger } from './ui/sidebar';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-20 items-center justify-center rounded-md text-sidebar-primary-foreground">
                <AppLogoIcon className="fill-current text-white dark:text-black" />
            </div>
        </>
    );
}

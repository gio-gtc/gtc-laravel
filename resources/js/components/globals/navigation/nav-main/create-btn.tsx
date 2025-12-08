import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarTrigger,
} from '@/components/ui/menubar';
import { useSidebar } from '@/components/ui/sidebar';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Plus } from 'lucide-react';

export const CreateBtn = () => {
    const { isMobile, state } = useSidebar();
    const notCollapsedOrMobile = state !== 'collapsed' || isMobile;
    const hiddenString = notCollapsedOrMobile ? '' : 'hidden';
    const hiddenBackhground = notCollapsedOrMobile ? 'bg-input' : '';

    return (
        <Tooltip>
            <Menubar>
                <MenubarMenu>
                    <TooltipTrigger asChild>
                        <MenubarTrigger
                            className={`flex max-w-[100px] cursor-pointer gap-1.5 rounded-4xl p-2 align-middle ${hiddenBackhground}`}
                        >
                            <div className="flex items-center justify-center rounded-full bg-brand-gtc-red">
                                <Plus
                                    style={{
                                        width: 'calc(var(--spacing) * 4)',
                                        height: 'calc(var(--spacing) * 4)',
                                    }}
                                />
                            </div>
                            <span className={`text-sm ${hiddenString}`}>
                                Create
                            </span>
                        </MenubarTrigger>
                    </TooltipTrigger>
                    <CreateDropdown />
                </MenubarMenu>
            </Menubar>
            <TooltipContent
                side="right"
                align="center"
                hidden={notCollapsedOrMobile}
                children={<span>Create</span>}
            />
        </Tooltip>
    );
};

const CreateDropdown = () => {
    return (
        <MenubarContent className="text-white">
            <MenubarItem>Organization</MenubarItem>
            <MenubarItem>Contact</MenubarItem>
            <MenubarItem>Tour</MenubarItem>
        </MenubarContent>
    );
};

import InvoiceOrOrderModal from '@/components/globals/navigation/invoice-or-order-modal';
import OrganisationModal from '@/components/globals/navigation/organisation-modal';
import TourModal from '@/components/globals/navigation/tour-modal';
import UserInfoModal, {
    type CreateContactPrefill,
} from '@/components/modals/user-info-modal';
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
import { usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

const CREATE_CONTACT_DEEP_LINK_KEYS = [
    'action',
    'first_name',
    'last_name',
    'email',
    'organisation',
    'job_title',
    'phone_number',
] as const;

export const CreateBtn = () => {
    const { url: pageUrl } = usePage();
    const { isMobile, state } = useSidebar();
    const notCollapsedOrMobile = state !== 'collapsed' || isMobile;
    const centerIcon = notCollapsedOrMobile ? '' : 'justify-center';
    const hiddenString = notCollapsedOrMobile ? '' : 'hidden';
    const hiddenBackhground = notCollapsedOrMobile
        ? 'bg-sidebar-accent focus:bg-sidebar-accent border border-transparent focus:border-transparent focus:text-white data-[state=open]:border-gray-300 data-[state=open]:text-white'
        : 'focus:bg-transparent data-[state=open]:bg-brand-gtc-red/20 p-1';
    const [isOrganisationModalOpen, setIsOrganisationModalOpen] =
        useState(false);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [contactPrefill, setContactPrefill] =
        useState<CreateContactPrefill | null>(null);
    const [isTourModalOpen, setIsTourModalOpen] = useState(false);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);

    useEffect(() => {
        const queryIndex = pageUrl.indexOf('?');
        const params =
            queryIndex >= 0
                ? new URLSearchParams(pageUrl.slice(queryIndex + 1))
                : new URLSearchParams();

        if (params.get('action') !== 'create_contact') {
            return;
        }

        const data = {
            first_name: params.get('first_name') ?? '',
            last_name: params.get('last_name') ?? '',
            email: params.get('email') ?? '',
            organisation: params.get('organisation') ?? '',
            job_title: params.get('job_title') ?? '',
            phone: params.get('phone_number') ?? '',
        };

        console.log('Deep Link Data:', data);

        const nextPrefill: CreateContactPrefill = {
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            organisation: data.organisation,
            job_title: data.job_title,
            phone_number: data.phone,
        };

        setContactPrefill(nextPrefill);
        setIsContactModalOpen(true);

        const url = new URL(window.location.href);
        for (const key of CREATE_CONTACT_DEEP_LINK_KEYS) {
            url.searchParams.delete(key);
        }
        const nextSearch = url.searchParams.toString();
        const next =
            url.pathname + (nextSearch ? `?${nextSearch}` : '') + url.hash;

        // Updates the visible URL only; Inertia page.url updates on the next navigation.
        window.history.replaceState(window.history.state, '', next);
    }, [pageUrl]);

    return (
        <>
            <Tooltip>
                <Menubar className={`flex ${centerIcon}`}>
                    <MenubarMenu>
                        <MenubarTrigger
                            className={`max-w-[100px] cursor-pointer rounded-4xl p-2 ${hiddenBackhground}`}
                        >
                            <TooltipTrigger asChild className="flex gap-1.5">
                                <span>
                                    <Plus
                                        className="rounded-full bg-brand-gtc-red"
                                        style={{
                                            width: 'calc(var(--spacing) * 4)',
                                            height: 'calc(var(--spacing) * 4)',
                                        }}
                                    />
                                    <span className={`text-sm ${hiddenString}`}>
                                        Create
                                    </span>
                                </span>
                            </TooltipTrigger>
                        </MenubarTrigger>
                        <CreateDropdown
                            onOrganisationClick={() =>
                                setIsOrganisationModalOpen(true)
                            }
                            onContactClick={() => {
                                setContactPrefill(null);
                                setIsContactModalOpen(true);
                            }}
                            onTourClick={() => setIsTourModalOpen(true)}
                            onOrderClick={() => setIsOrderModalOpen(true)}
                            onInvoiceClick={() => setIsInvoiceModalOpen(true)}
                        />
                    </MenubarMenu>
                </Menubar>
                <TooltipContent
                    side="right"
                    align="center"
                    hidden={notCollapsedOrMobile}
                    children={<span>Create</span>}
                />
            </Tooltip>
            <OrganisationModal
                isOpen={isOrganisationModalOpen}
                onClose={() => setIsOrganisationModalOpen(false)}
            />
            <UserInfoModal
                isOpen={isContactModalOpen}
                onClose={() => {
                    setContactPrefill(null);
                    setIsContactModalOpen(false);
                }}
                mode="create"
                createPrefill={contactPrefill}
            />
            <TourModal
                isOpen={isTourModalOpen}
                onClose={() => setIsTourModalOpen(false)}
            />
            <InvoiceOrOrderModal
                isOpen={isOrderModalOpen}
                onClose={() => setIsOrderModalOpen(false)}
                title="Create Order"
            />
            <InvoiceOrOrderModal
                isOpen={isInvoiceModalOpen}
                onClose={() => setIsInvoiceModalOpen(false)}
                title="Create Invoice"
            />
        </>
    );
};

const CreateDropdown = ({
    onOrganisationClick,
    onContactClick,
    onTourClick,
    onOrderClick,
    onInvoiceClick,
}: {
    onOrganisationClick: () => void;
    onContactClick: () => void;
    onTourClick: () => void;
    onOrderClick: () => void;
    onInvoiceClick: () => void;
}) => {
    return (
        <MenubarContent>
            <MenubarItem onClick={onOrganisationClick}>
                Organisation
            </MenubarItem>
            <MenubarItem onClick={onContactClick}>Contact</MenubarItem>
            <MenubarItem onClick={onTourClick}>Tour</MenubarItem>
            <MenubarItem onClick={onOrderClick}>Order</MenubarItem>
            <MenubarItem onClick={onInvoiceClick}>Invoice</MenubarItem>
        </MenubarContent>
    );
};

import { invoicesData } from '@/components/mockdata';
import { Button } from '@/components/ui/button';
import {
    type Invoice,
    type MediaTableRow,
    type StaticAssetsTableRow,
    type Tour,
    type TourVenue,
    type Venue,
} from '@/types';
import { Eye, Link } from 'lucide-react';
import { useMemo } from 'react';
import AttachmentsSection from '../reuse/attachments-section';
import ChatBox from '../reuse/chat';
import MediaTable from '../reuse/dynamic-media-table';
import SectionContainers from '../reuse/section-containers';
import StaticAssetsMediaTable from '../reuse/static-assets-media-table';
import BillingSection from './billing-section';
import Filters from './filters';

interface GeneralMediaViewProps {
    order: Tour | null;
    venueItem: { orderVenue: TourVenue; venue: Venue } | null;
}

function GeneralMediaView({ order, venueItem }: GeneralMediaViewProps) {
    const mockUser = {
        id: 1,
        name: 'Jane Doe',
        email: 'jane@example.com',
        email_verified_at: null as string | null,
        company_id: 1,
        created_at: '',
        updated_at: '',
    };

    const exampleData: MediaTableRow[] = [
        {
            id: 1,
            isci: 'GTC1818843',
            cutName: 'Generic Presale',
            duration: ':45',
            dueDate: '1/15/25',
            assigned: null,
            status: 'Still in Cart',
            previewIcons: [
                <Eye key="e1" className="h-4 w-4" />,
                <Link key="l1" className="h-4 w-4" />,
            ],
            deliverables: {
                onReject: () => console.log('Reject'),
                onApprove: () => console.log('Approve'),
            },
        },
        {
            id: 2,
            isci: 'GTC1818847',
            cutName: 'Generic Coming soon',
            duration: ':30',
            dueDate: '1/15/25',
            assigned: mockUser,
            status: 'Client Review',
            previewIcons: [
                <Eye key="e2" className="h-4 w-4" />,
                <Link key="l2" className="h-4 w-4" />,
            ],
            deliverables: {
                onReject: () => console.log('Reject'),
                onApprove: () => console.log('Approve'),
            },
        },
        {
            id: 3,
            isci: 'GTC1818848',
            cutName: 'Generic Teaser',
            duration: ':15',
            dueDate: '1/18/25',
            assigned: mockUser,
            status: 'In Production',
            previewIcons: [
                <Eye key="e3" className="h-4 w-4" />,
                <Link key="l3" className="h-4 w-4" />,
            ],
            deliverables: {
                onReject: () => console.log('Reject'),
                onApprove: () => console.log('Approve'),
            },
        },
        {
            id: 4,
            isci: 'GTC1818849',
            cutName: 'Generic Final',
            duration: ':60',
            dueDate: '1/20/25',
            assigned: mockUser,
            status: 'Out for Delivery',
            previewIcons: [
                <Eye key="e4" className="h-4 w-4" />,
                <Link key="l4" className="h-4 w-4" />,
            ],
            deliverables: {
                onReject: () => console.log('Reject'),
                onApprove: () => console.log('Approve'),
            },
        },
        {
            id: 5,
            isci: 'GTC1818850',
            cutName: 'Generic Dropped',
            duration: ':30',
            dueDate: '1/22/25',
            assigned: null,
            status: 'Cancelled',
            previewIcons: [],
            deliverables: undefined,
        },
        {
            id: 6,
            isci: 'GTC1818851',
            cutName: 'Generic Revise',
            duration: ':45',
            dueDate: '1/25/25',
            assigned: mockUser,
            status: 'Revision Requested',
            previewIcons: [
                <Eye key="e6" className="h-4 w-4" />,
                <Link key="l6" className="h-4 w-4" />,
            ],
            deliverables: {
                onReject: () => console.log('Reject'),
                onApprove: () => console.log('Approve'),
            },
        },
        {
            id: 7,
            isci: 'GTC1818852',
            cutName: 'Generic Unassigned',
            duration: ':20',
            dueDate: '1/28/25',
            assigned: null,
            status: 'Unassigned',
            previewIcons: [],
            deliverables: undefined,
        },
    ];

    const staticAssetsMockUser = {
        id: 1,
        name: 'Jane Doe',
        email: 'jane@example.com',
        email_verified_at: null as string | null,
        company_id: 1,
        created_at: '',
        updated_at: '',
    };

    const staticAssetsExampleData: StaticAssetsTableRow[] = [
        {
            id: 1,
            cutName: 'Key Art – Still in Cart',
            width: 1400,
            height: 400,
            dueDate: '1/15/25',
            assigned: null,
            status: 'Still in Cart',
        },
        {
            id: 2,
            cutName: 'Key Art – Client Review',
            width: 1400,
            height: 400,
            dueDate: '1/15/25',
            assigned: staticAssetsMockUser,
            status: 'Client Review',
        },
        {
            id: 3,
            cutName: 'Key Art – In Production',
            width: 1400,
            height: 400,
            dueDate: '1/18/25',
            assigned: staticAssetsMockUser,
            status: 'In Production',
        },
        {
            id: 4,
            cutName: 'Key Art – Out for Delivery',
            width: 1400,
            height: 400,
            dueDate: '1/20/25',
            assigned: staticAssetsMockUser,
            status: 'Out for Delivery',
        },
        {
            id: 5,
            cutName: 'Key Art – Cancelled',
            width: 1400,
            height: 400,
            dueDate: '1/22/25',
            assigned: null,
            status: 'Cancelled',
        },
        {
            id: 6,
            cutName: 'Key Art – Revision Requested',
            width: 1400,
            height: 400,
            dueDate: '1/25/25',
            assigned: staticAssetsMockUser,
            status: 'Revision Requested',
        },
        {
            id: 7,
            cutName: 'Socials & Web Banners – Unassigned',
            width: 1400,
            height: 400,
            dueDate: '1/28/25',
            assigned: null,
            status: 'Unassigned',
        },
    ];

    const billingInvoices = useMemo((): Invoice[] => {
        if (!order || !venueItem) return [];
        return invoicesData.filter(
            (inv) =>
                !inv.isDeleted &&
                inv.tour === order.name &&
                inv.venue === venueItem.venue.name,
        );
    }, [order, venueItem]);

    return (
        <>
            {/* Media tables */}
            <div className="slide-out-container space-y-4">
                <Filters />
                <MediaTable
                    title="Broadcast & Streaming Video"
                    data={exampleData}
                />
                <MediaTable title="Social Video" data={exampleData} />
                <MediaTable title="Audio" data={exampleData} />
                <StaticAssetsMediaTable
                    title="Key Art & Static Assets"
                    data={staticAssetsExampleData}
                />
            </div>

            {/* Submit Order Buttons */}
            <div className="flex justify-center gap-1 rounded-lg bg-neutral-100 p-1">
                <Button className="cursor-pointer bg-white text-gray-700 hover:bg-gray-200">
                    Cancel
                </Button>
                <Button className="cursor-pointer bg-brand-gtc-red hover:bg-brand-gtc-red/70">
                    Submit Order
                </Button>
            </div>

            {/* Billing Section */}
            <SectionContainers title="Billing Invoices">
                <BillingSection billingInvoices={billingInvoices} />
            </SectionContainers>

            {/* Attachments Section */}
            <SectionContainers title="Attachments">
                <AttachmentsSection />
            </SectionContainers>

            {/* Chat Section */}
            <SectionContainers title="Comments">
                <ChatBox />
            </SectionContainers>
        </>
    );
}

export default GeneralMediaView;

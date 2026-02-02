import { StaticAssetsTableRow } from '@/types';
import AttachmentsSection from '../reuse/attachments-section';
import ChatBox from '../reuse/chat';
import SectionContainers from '../reuse/section-containers';
import MediaTable from '../reuse/static-assets-media-table';

function LocalArtView() {
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
    return (
        <>
            <div className="slide-out-container space-y-4">
                <MediaTable
                    title="Localized Art "
                    data={staticAssetsExampleData}
                />
            </div>

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

export default LocalArtView;

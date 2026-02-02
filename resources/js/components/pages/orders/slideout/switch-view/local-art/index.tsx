import { StaticAssetsTableRow } from '@/types';
import AttachmentsSection from '../reuse/attachments-section';
import ChatBox from '../reuse/chat';
import SectionContainers from '../reuse/section-containers';
import MediaTable from '../reuse/static-assets-media-table';

function LocalArtView() {
    const staticAssetsExampleData: StaticAssetsTableRow[] = [
        {
            id: 1,
            cutName: 'Key Art Package',
            width: 1400,
            height: 400,
            dueDate: '1/15/25',
            assigned: {
                id: 1,
                name: 'Jane Doe',
                email: 'jane@example.com',
                email_verified_at: null,
                company_id: 1,
                created_at: '',
                updated_at: '',
            },
            status: 'Revision Requested',
        },
        {
            id: 2,
            cutName: 'Key Art Package',
            width: 1400,
            height: 400,
            dueDate: '1/15/25',
            assigned: {
                id: 2,
                name: 'Jane Doe',
                email: 'jane@example.com',
                email_verified_at: null,
                company_id: 1,
                created_at: '',
                updated_at: '',
            },
            status: 'Out for Delivery',
        },
        {
            id: 3,
            cutName: 'Socials & Web Banners',
            width: 1400,
            height: 400,
            dueDate: '1/15/25',
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

import { LocalizedArtTableRow } from '@/types';
import AttachmentsSection from '../reuse/attachments-section';
import ChatBox from '../reuse/chat';
import LocalizedArtTable from '../reuse/localised-media-table';
import SectionContainers from '../reuse/section-containers';

function LocalArtView() {
    const mockUser = {
        id: 1,
        name: 'Jane Doe',
        email: 'jane@example.com',
        email_verified_at: null as string | null,
        company_id: 1,
        created_at: '',
        updated_at: '',
    };

    const localizedArtExampleData: LocalizedArtTableRow[] = [
        {
            id: 1,
            description: 'Advert for FFFFFFFF',
            width: 1400,
            height: 400,
            cta: 'Save the Date',
            dueDate: '1/15/25',
            assigned: mockUser,
        },
        {
            id: 2,
            description: 'Advert for FFFFFFFF',
            width: 1400,
            height: 400,
            cta: 'Last Chance',
            dueDate: '1/15/25',
            assigned: mockUser,
        },
        {
            id: 3,
            description: 'Advert for FFFFFFFF',
            width: 1400,
            height: 400,
            cta: 'Black Friday Sale',
            dueDate: '1/15/25',
            assigned: mockUser,
        },
    ];

    return (
        <>
            <div className="slide-out-container space-y-4">
                <LocalizedArtTable
                    title="Localized Art"
                    data={localizedArtExampleData}
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

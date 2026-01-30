import AttachmentsSection from '../reuse/attachments-section';
import ChatBox from '../reuse/chat';
import SectionContainers from '../reuse/section-containers';

function LocalArtView() {
    return (
        <>
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

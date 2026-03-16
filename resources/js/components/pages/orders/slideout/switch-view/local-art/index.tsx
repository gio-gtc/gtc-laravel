import { venueSlideoutLocalizedArtData } from '@/components/mockdata';
import { type LocalizedArtTableRow } from '@/types';
import { useState } from 'react';
import AttachmentsSection from '../reuse/attachments-section';
import ChatBox from '../reuse/chat';
import LocalizedArtTable from '../reuse/localised-media-table';
import NotesModal from '../reuse/notes-modal';
import SectionContainers from '../reuse/section-containers';

function LocalArtView() {
    const [notesModalRow, setNotesModalRow] = useState<
        LocalizedArtTableRow | null
    >(null);

    return (
        <>
            <div className="slide-out-container space-y-4">
                <LocalizedArtTable
                    title="Localized Art"
                    data={venueSlideoutLocalizedArtData}
                    onOpenNotes={(row) => setNotesModalRow(row)}
                />
            </div>

            <NotesModal
                isOpen={notesModalRow !== null}
                onClose={() => setNotesModalRow(null)}
                notes={notesModalRow?.notes ?? []}
            />

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

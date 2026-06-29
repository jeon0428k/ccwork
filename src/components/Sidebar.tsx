import { useNotes } from '../context/NotesContext';
import { useTagFilter } from '../hooks/useTagFilter';
import { TagFilter } from './TagFilter';
import { NoteList } from './NoteList';

interface SidebarProps {
  selectedNoteId: string | null;
  onSelect: (id: string) => void;
}

// provider 내부 사이드바 컨테이너: 태그 필터 칩(상단) + 노트 목록.
export function Sidebar({ selectedNoteId, onSelect }: SidebarProps) {
  const { notes } = useNotes();
  const { allTags, activeTags, toggleTag, visibleNotes } = useTagFilter(notes);

  return (
    <>
      <TagFilter allTags={allTags} activeTags={activeTags} onToggle={toggleTag} />
      <NoteList notes={visibleNotes} selectedNoteId={selectedNoteId} onSelect={onSelect} />
    </>
  );
}

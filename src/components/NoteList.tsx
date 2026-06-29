import { useNotes } from '../context/NotesContext';
import { NoteItem } from './NoteItem';
import { Note } from '../types/note';

interface NoteListProps {
  notes: Note[]; // FILTER-2: 표시할 노트를 prop으로 주입 (Green 단계에서 context pull을 대체)
  selectedNoteId: string | null;
  onSelect: (id: string) => void;
}

export function NoteList({ notes: _notes, selectedNoteId, onSelect }: NoteListProps) {
  // FILTER-2 (TDD Red): 주입된 notes 는 아직 사용하지 않는다. Green 단계에서 context pull 을 대체한다.
  void _notes;
  const { notes, loading, error, deleteNote } = useNotes();

  if (loading) {
    return <p className="text-sm text-muted-foreground text-center py-8">로딩 중...</p>;
  }

  if (error) {
    return <p className="text-sm text-destructive text-center py-8">오류: {error}</p>;
  }

  if (notes.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">노트가 없습니다</p>;
  }

  return (
    <>
      <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground px-1 pb-1">
        노트 {notes.length}개
      </p>
      {notes.map((note) => (
        <NoteItem
          key={note.id}
          note={note}
          isSelected={note.id === selectedNoteId}
          onSelect={onSelect}
          onDelete={deleteNote}
        />
      ))}
    </>
  );
}

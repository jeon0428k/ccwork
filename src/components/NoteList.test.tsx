import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import * as api from '../api/notes';
import { NotesProvider } from '../context/NotesContext';
import { NoteList } from './NoteList';
import { Note } from '../types/note';

vi.mock('../api/notes');

function note(id: string, tags: string[]): Note {
  return {
    id,
    title: `note-${id}`,
    content: '',
    tags,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

const wrapper = ({ children }: { children: ReactNode }) => (
  <NotesProvider>{children}</NotesProvider>
);

beforeEach(() => {
  vi.clearAllMocks();
});

// issue-21 §시나리오 — NoteList (notes prop 리팩터, FILTER-2)
describe('NoteList', () => {
  it('should render only the notes passed via the notes prop (not the context notes)', async () => {
    // context 에는 3개가 적재되지만, prop 으로는 1개만 주입한다.
    vi.mocked(api.fetchNotes).mockResolvedValue([
      note('1', ['work']),
      note('2', ['idea']),
      note('3', []),
    ]);

    render(<NoteList notes={[note('1', ['work'])]} selectedNoteId={null} onSelect={vi.fn()} />, {
      wrapper,
    });

    expect(await screen.findByText('note-1')).toBeInTheDocument();
    expect(screen.queryByText('note-2')).not.toBeInTheDocument();
    expect(screen.queryByText('note-3')).not.toBeInTheDocument();
  });

  it('should show "노트 N개" where N matches the injected notes length', async () => {
    vi.mocked(api.fetchNotes).mockResolvedValue([
      note('1', ['work']),
      note('2', ['idea']),
      note('3', []),
    ]);

    render(
      <NoteList
        notes={[note('1', ['work']), note('2', ['idea'])]}
        selectedNoteId={null}
        onSelect={vi.fn()}
      />,
      { wrapper },
    );

    expect(await screen.findByText('노트 2개')).toBeInTheDocument();
  });

  it('should show "노트가 없습니다" when the notes prop is an empty array (0 filter results)', async () => {
    vi.mocked(api.fetchNotes).mockResolvedValue([note('1', ['work'])]);

    render(<NoteList notes={[]} selectedNoteId={null} onSelect={vi.fn()} />, { wrapper });

    expect(await screen.findByText('노트가 없습니다')).toBeInTheDocument();
  });
});

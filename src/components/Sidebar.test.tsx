import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import * as api from '../api/notes';
import { NotesProvider } from '../context/NotesContext';
import { Sidebar } from './Sidebar';
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

// issue-20 갭 보강 — Sidebar 통합
describe('Sidebar', () => {
  it('should render tag filter chips above the note list when notes have tags', async () => {
    vi.mocked(api.fetchNotes).mockResolvedValue([note('1', ['work', 'idea']), note('2', ['work'])]);

    render(<Sidebar selectedNoteId={null} onSelect={vi.fn()} />, { wrapper });

    expect(await screen.findByRole('button', { name: 'work' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'idea' })).toBeInTheDocument();
  });

  it('should mark a chip aria-pressed=true when an inactive chip is clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(api.fetchNotes).mockResolvedValue([note('1', ['work'])]);

    render(<Sidebar selectedNoteId={null} onSelect={vi.fn()} />, { wrapper });
    const chip = await screen.findByRole('button', { name: 'work' });

    await user.click(chip);

    await waitFor(() => expect(chip).toHaveAttribute('aria-pressed', 'true'));
  });

  it('should reset a chip aria-pressed=false when an active chip is re-clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(api.fetchNotes).mockResolvedValue([note('1', ['work'])]);

    render(<Sidebar selectedNoteId={null} onSelect={vi.fn()} />, { wrapper });
    const chip = await screen.findByRole('button', { name: 'work' });

    await user.click(chip);
    await user.click(chip);

    await waitFor(() => expect(chip).toHaveAttribute('aria-pressed', 'false'));
  });
});

// issue-21 §시나리오 — Sidebar 통합: visibleNotes → NoteList (FILTER-2)
describe('Sidebar — visibleNotes 필터링 (FILTER-2)', () => {
  it('should render only "work" notes in the list when the "work" chip is turned on (AC1)', async () => {
    const user = userEvent.setup();
    vi.mocked(api.fetchNotes).mockResolvedValue([note('1', ['work']), note('2', ['idea'])]);

    render(<Sidebar selectedNoteId={null} onSelect={vi.fn()} />, { wrapper });
    const chip = await screen.findByRole('button', { name: 'work' });

    await user.click(chip);

    await waitFor(() => expect(screen.queryByText('note-2')).not.toBeInTheDocument());
    expect(screen.getByText('note-1')).toBeInTheDocument();
  });

  it('should render both work and idea notes when "work" and "idea" chips are on (AC2)', async () => {
    const user = userEvent.setup();
    vi.mocked(api.fetchNotes).mockResolvedValue([
      note('1', ['work']),
      note('2', ['idea']),
      note('3', ['personal']),
    ]);

    render(<Sidebar selectedNoteId={null} onSelect={vi.fn()} />, { wrapper });
    await user.click(await screen.findByRole('button', { name: 'work' }));
    await user.click(screen.getByRole('button', { name: 'idea' }));

    await waitFor(() => expect(screen.queryByText('note-3')).not.toBeInTheDocument());
    expect(screen.getByText('note-1')).toBeInTheDocument();
    expect(screen.getByText('note-2')).toBeInTheDocument();
  });

  it('should hide an untagged note from the list when any chip is on (AC3)', async () => {
    const user = userEvent.setup();
    vi.mocked(api.fetchNotes).mockResolvedValue([note('1', ['work']), note('2', [])]);

    render(<Sidebar selectedNoteId={null} onSelect={vi.fn()} />, { wrapper });
    const chip = await screen.findByRole('button', { name: 'work' });

    await user.click(chip);

    await waitFor(() => expect(screen.queryByText('note-2')).not.toBeInTheDocument());
    expect(screen.getByText('note-1')).toBeInTheDocument();
  });

  it('should render all notes again when the active chip is toggled back off (AC4)', async () => {
    const user = userEvent.setup();
    vi.mocked(api.fetchNotes).mockResolvedValue([note('1', ['work']), note('2', ['idea'])]);

    render(<Sidebar selectedNoteId={null} onSelect={vi.fn()} />, { wrapper });
    const chip = await screen.findByRole('button', { name: 'work' });

    // 켜면 work 노트만 (필터 동작 — 미구현 상태에선 여기서 실패)
    await user.click(chip);
    await waitFor(() => expect(screen.queryByText('note-2')).not.toBeInTheDocument());

    // 다시 끄면 켜진 칩이 하나도 없어 전체 노트가 복귀
    await user.click(chip);
    expect(await screen.findByText('note-2')).toBeInTheDocument();
    expect(screen.getByText('note-1')).toBeInTheDocument();
  });
});

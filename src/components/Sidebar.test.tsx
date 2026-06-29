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

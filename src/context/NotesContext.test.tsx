import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import * as api from '../api/notes';
import { NotesProvider, useNotes } from './NotesContext';

vi.mock('../api/notes');

const wrapper = ({ children }: { children: ReactNode }) => (
  <NotesProvider>{children}</NotesProvider>
);

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(api.fetchNotes).mockResolvedValue([]);
});

// 시나리오 2.4 — NotesContext.createNote
describe('NotesContext.createNote', () => {
  it('should call api.createNote with { title, content, tags } exactly once when saving', async () => {
    vi.mocked(api.createNote).mockResolvedValue({
      id: '1',
      title: 't',
      content: 'c',
      tags: ['react'],
      createdAt: '',
      updatedAt: '',
    });
    const { result } = renderHook(() => useNotes(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.createNote('t', 'c', ['react']);
    });

    expect(api.createNote).toHaveBeenCalledWith({ title: 't', content: 'c', tags: ['react'] });
    expect(api.createNote).toHaveBeenCalledTimes(1);
  });

  it('should persist the note including the tags array (no separate tag API call)', async () => {
    vi.mocked(api.createNote).mockResolvedValue({
      id: '1',
      title: 't',
      content: 'c',
      tags: ['react'],
      createdAt: '',
      updatedAt: '',
    });
    const { result } = renderHook(() => useNotes(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.createNote('t', 'c', ['react']);
    });

    expect(result.current.notes).toContainEqual(expect.objectContaining({ tags: ['react'] }));
    expect(api.createNote).toHaveBeenCalledWith(expect.objectContaining({ tags: ['react'] }));
  });

  it('should persist tags: [] when no tags were added', async () => {
    vi.mocked(api.createNote).mockResolvedValue({
      id: '1',
      title: 't',
      content: 'c',
      tags: [],
      createdAt: '',
      updatedAt: '',
    });
    const { result } = renderHook(() => useNotes(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.createNote('t', 'c', []);
    });

    expect(api.createNote).toHaveBeenCalledWith({ title: 't', content: 'c', tags: [] });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as api from '../api/notes';
import type { Note } from '../types/note';
import { NotesProvider } from '../context/NotesContext';
import { NoteEditor } from './NoteEditor';

vi.mock('../api/notes');

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(api.fetchNotes).mockResolvedValue([]);
});

interface EditorProps {
  selectedNoteId: string | null;
  isCreating: boolean;
  onDone: () => void;
}

function renderEditor(props: EditorProps) {
  return render(
    <NotesProvider>
      <NoteEditor {...props} />
    </NotesProvider>,
  );
}

// 시나리오 2.4(예외) — 저장 실패 처리
describe('NoteEditor.handleSave', () => {
  it('should console.error and not throw when createNote rejects', async () => {
    const user = userEvent.setup();
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(api.createNote).mockRejectedValue(new Error('save failed'));
    renderEditor({ selectedNoteId: null, isCreating: true, onDone: vi.fn() });

    await user.type(screen.getByPlaceholderText('제목'), '제목');
    await user.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() => expect(errorSpy).toHaveBeenCalled());
    errorSpy.mockRestore();
  });
});

// 시나리오 2.5 — NoteEditor (재오픈 표시 · 폴백)
// 노트는 목록이 로드된 뒤 선택(null→id 전환)되므로, 그 사용 흐름을 재현한다.
describe('NoteEditor (태그 표시)', () => {
  async function openNote(onDone = vi.fn()) {
    const view = render(
      <NotesProvider>
        <NoteEditor selectedNoteId={null} isCreating={false} onDone={onDone} />
      </NotesProvider>,
    );
    // 노트 목록 fetch 완료를 기다린다.
    await act(async () => {});
    // 노트 선택: selectedNoteId null → '1' 전환 → 폼 동기화.
    view.rerender(
      <NotesProvider>
        <NoteEditor selectedNoteId="1" isCreating={false} onDone={onDone} />
      </NotesProvider>,
    );
    return view;
  }

  it('should render saved tags as a chip list under the title when reopening a note with tags', async () => {
    vi.mocked(api.fetchNotes).mockResolvedValue([
      {
        id: '1',
        title: '제목1',
        content: '본문1',
        tags: ['타입스크립트', '테스트'],
        createdAt: '',
        updatedAt: '',
      },
    ]);

    await openNote();

    expect(await screen.findByText('타입스크립트')).toBeInTheDocument();
    expect(screen.getByText('테스트')).toBeInTheDocument();
  });

  it('should render an empty tag area without error when opening a legacy note without tags', async () => {
    vi.mocked(api.fetchNotes).mockResolvedValue([
      // 레거시 노트: tags 필드 없음 (구버전 데이터 시뮬레이션 — non-optional 타입을 의도적으로 우회)
      { id: '1', title: '레거시', content: '본문', createdAt: '', updatedAt: '' } as Note,
    ]);

    await openNote();

    await waitFor(() => expect(screen.getByPlaceholderText('제목')).toHaveValue('레거시'));
    // 제목 input + 본문 textarea + 태그 입력 input = textbox 3개 (에러 없이 빈 태그 영역)
    expect(screen.getAllByRole('textbox')).toHaveLength(3);
  });
});

// 시나리오 2.4(TAG-2) — NoteEditor (삭제 후 저장 반영)
describe('NoteEditor (태그 삭제 후 저장)', () => {
  async function openNoteWithTags(tags: string[]) {
    vi.mocked(api.fetchNotes).mockResolvedValue([
      { id: '1', title: '제목1', content: '본문1', tags, createdAt: '', updatedAt: '' },
    ]);
    vi.mocked(api.updateNote).mockResolvedValue({
      id: '1',
      title: '제목1',
      content: '본문1',
      tags,
      createdAt: '',
      updatedAt: '',
    });

    const view = render(
      <NotesProvider>
        <NoteEditor selectedNoteId={null} isCreating={false} onDone={vi.fn()} />
      </NotesProvider>,
    );
    await act(async () => {});
    view.rerender(
      <NotesProvider>
        <NoteEditor selectedNoteId="1" isCreating={false} onDone={vi.fn()} />
      </NotesProvider>,
    );
    return view;
  }

  it('should persist the remaining tags excluding the removed one when saving after a chip is removed', async () => {
    const user = userEvent.setup();
    await openNoteWithTags(['React', 'TypeScript']);

    await user.click(await screen.findByRole('button', { name: 'React 태그 삭제' }));
    await user.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() =>
      expect(api.updateNote).toHaveBeenCalledWith('1', {
        title: '제목1',
        content: '본문1',
        tags: ['TypeScript'],
      }),
    );
  });

  it('should persist tags: [] when the only tag is removed and then saved', async () => {
    const user = userEvent.setup();
    await openNoteWithTags(['solo']);

    await user.click(await screen.findByRole('button', { name: 'solo 태그 삭제' }));
    await user.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() =>
      expect(api.updateNote).toHaveBeenCalledWith('1', {
        title: '제목1',
        content: '본문1',
        tags: [],
      }),
    );
  });

  // 시나리오 2.3(TAG-3) — Backspace로 마지막 칩 삭제 후 저장
  it('should persist tags without the last one when the last chip is removed via Backspace and saved', async () => {
    const user = userEvent.setup();
    await openNoteWithTags(['React', 'TypeScript']);

    // 태그 input(placeholder)에 포커스 → 빈 상태에서 Backspace → 마지막 칩(TypeScript) 삭제
    const input = await screen.findByPlaceholderText('태그 추가');
    input.focus();
    await user.keyboard('{Backspace}');
    await user.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() =>
      expect(api.updateNote).toHaveBeenCalledWith('1', {
        title: '제목1',
        content: '본문1',
        tags: ['React'],
      }),
    );
  });
});

// 시나리오 2.2(TAG-4) — NoteEditor (중복 방지 통합: input 비움 / 원본 저장)
describe('NoteEditor (중복 태그 방지)', () => {
  it('should keep a single chip and clear the input when the same tag is entered twice', async () => {
    const user = userEvent.setup();
    renderEditor({ selectedNoteId: null, isCreating: true, onDone: vi.fn() });

    const tagInput = screen.getByPlaceholderText('태그 추가');
    await user.type(tagInput, 'React{Enter}');
    await user.type(tagInput, 'React{Enter}');

    expect(screen.getAllByText('React')).toHaveLength(1);
    expect(tagInput).toHaveValue('');
  });

  it('should persist the original casing React (not lowercased) when saving after entering React', async () => {
    const user = userEvent.setup();
    vi.mocked(api.createNote).mockResolvedValue({
      id: '2',
      title: '제목',
      content: '',
      tags: ['React'],
      createdAt: '',
      updatedAt: '',
    });
    renderEditor({ selectedNoteId: null, isCreating: true, onDone: vi.fn() });

    await user.type(screen.getByPlaceholderText('제목'), '제목');
    await user.type(screen.getByPlaceholderText('태그 추가'), 'React{Enter}');
    await user.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() =>
      expect(api.createNote).toHaveBeenCalledWith({ title: '제목', content: '', tags: ['React'] }),
    );
  });
});

// 시나리오 2.3(TAG-5) — NoteEditor (trim 통합)
describe('NoteEditor (입력 검증)', () => {
  it('should persist the trimmed tag React (not padded) when a padded value is entered and saved', async () => {
    const user = userEvent.setup();
    vi.mocked(api.createNote).mockResolvedValue({
      id: '2',
      title: '제목',
      content: '',
      tags: ['React'],
      createdAt: '',
      updatedAt: '',
    });
    renderEditor({ selectedNoteId: null, isCreating: true, onDone: vi.fn() });

    await user.type(screen.getByPlaceholderText('제목'), '제목');
    await user.type(screen.getByPlaceholderText('태그 추가'), '  React  {Enter}');
    await user.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() =>
      expect(api.createNote).toHaveBeenCalledWith({ title: '제목', content: '', tags: ['React'] }),
    );
  });
});

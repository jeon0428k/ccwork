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

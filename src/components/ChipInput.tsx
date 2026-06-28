import { useState, KeyboardEvent } from 'react';
import { Chip } from './Chip';

interface ChipInputProps {
  tags: string[];
  onAddTag: (raw: string) => void; // Enter/쉼표 시
  onRemoveTag: (tag: string) => void; // 칩 × 클릭 시
  onRemoveLast: () => void; // 빈 input + Backspace 시
  placeholder?: string;
}

// dumb 컴포넌트: 내부 텍스트 상태만 보유, 확정 시 onAddTag 위임 후 비움
export function ChipInput({
  tags,
  onAddTag,
  onRemoveTag,
  onRemoveLast,
  placeholder,
}: ChipInputProps) {
  const [text, setText] = useState('');

  const commit = () => {
    if (!text) return;
    onAddTag(text);
    setText('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault(); // 쉼표 문자가 입력값에 들어가지 않도록 차단
      commit();
    } else if (e.key === 'Backspace' && text === '') {
      onRemoveLast(); // 빈 input에서만 마지막 칩 삭제 (텍스트 있으면 일반 문자 삭제)
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {tags.map((tag, i) => (
        <Chip key={`${tag}-${i}`} label={tag} onRemove={() => onRemoveTag(tag)} />
      ))}
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        maxLength={15}
        className="flex-1 min-w-32 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground/50"
      />
    </div>
  );
}

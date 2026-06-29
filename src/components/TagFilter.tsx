interface TagFilterProps {
  allTags: string[];
  activeTags: string[];
  onToggle: (tag: string) => void;
}

// 사이드바 상단 태그 필터 칩. 켜진 칩은 음각 톤으로 구분(aria-pressed). 태그가 없으면 미렌더.
export function TagFilter({ allTags, activeTags, onToggle }: TagFilterProps) {
  if (allTags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 px-1 pb-2">
      {allTags.map((tag) => {
        const isActive = activeTags.includes(tag);
        return (
          <button
            key={tag}
            type="button"
            aria-pressed={isActive}
            onClick={() => onToggle(tag)}
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 italic text-xs transition-colors cursor-pointer ${
              isActive ? 'bg-foreground text-card' : 'bg-muted text-foreground hover:bg-muted/70'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full border ${
                isActive ? 'border-card/70' : 'border-foreground/60'
              }`}
            />
            {tag}
          </button>
        );
      })}
    </div>
  );
}

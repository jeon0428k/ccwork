interface ChipProps {
  label: string;
  onRemove?: () => void; // × 버튼 클릭 핸들러. 없으면 표시 전용
}

// "Library Tags" — 이탤릭 + 좌측 punch-hole(원형 구멍)로 기록보관소 은유 (components/chip.md)
export function Chip({ label, onRemove }: ChipProps) {
  return (
    <span className="group inline-flex items-center gap-1 bg-muted text-foreground rounded-full px-2.5 py-1 italic text-xs">
      <span className="w-1.5 h-1.5 rounded-full border border-foreground/60" />
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`${label} 태그 삭제`}
          className="ml-0.5 leading-none text-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity hover:text-foreground cursor-pointer"
        >
          ×
        </button>
      )}
    </span>
  );
}

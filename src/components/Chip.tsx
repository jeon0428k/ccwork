interface ChipProps {
  label: string;
}

// "Library Tags" — 이탤릭 + 좌측 punch-hole(원형 구멍)로 기록보관소 은유 (components/chip.md)
export function Chip({ label }: ChipProps) {
  return (
    <span className="inline-flex items-center gap-1 bg-muted text-foreground rounded-full px-2.5 py-1 italic text-xs">
      <span className="w-1.5 h-1.5 rounded-full border border-foreground/60" />
      {label}
    </span>
  );
}

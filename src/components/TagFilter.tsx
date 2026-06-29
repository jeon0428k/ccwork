interface TagFilterProps {
  allTags: string[];
  activeTags: string[];
  onToggle: (tag: string) => void;
}

// TDD Red 스텁 — 구현은 tdd-green에서. 현재는 렌더 시 실패한다.
export function TagFilter(props: TagFilterProps) {
  void props;
  throw new Error('TagFilter not implemented');
}

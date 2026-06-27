# Divider — Sanctuary Archive

토큰: [../tokens/color.md](../tokens/color.md).

- 주요 섹션 구분에는 **장식 플로리시**(가운데 다이아몬드 ◆ 또는 길게 늘인 선)로 "Sanctuary" 분위기.
- 일반 구분은 얇은 가로 룰(`outline-variant`). 단, **본문 안에서 남발 금지** — 주요 분기에서만([../dont.md](../dont.md)).

```html
<div class="flex items-center gap-stack-sm my-stack-lg text-outline">
  <span class="flex-1 h-px bg-outline-variant"></span>
  <span class="text-on-surface-variant">◆</span>
  <span class="flex-1 h-px bg-outline-variant"></span>
</div>
```

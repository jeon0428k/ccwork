# Chip — Sanctuary Archive

"Library Tags" — 도서관 태그 은유. 토큰: [../tokens/color.md](../tokens/color.md), [../tokens/typography.md](../tokens/typography.md).

- **이탤릭** 텍스트 + 좌측 **punch-hole(작은 원형 구멍)** 아이콘으로 기록보관소 은유 강화.
- 배경 `secondary-container`(Tan) + 텍스트 `on-secondary-container`. 모서리 `full`(pill).
- 폰트: `label-sm` 또는 `label-lg`, `font-style: italic`.
- **색상만으로 구분하지 않는다** — 이탤릭 + punch-hole을 항상 함께.

```html
<span
  class="inline-flex items-center gap-1 bg-secondary-container text-on-secondary-container
             rounded-full px-stack-sm py-1 italic font-body text-label-sm"
>
  <span class="w-1.5 h-1.5 rounded-full border border-on-secondary-container/60"></span>
  아이디어
</span>
```

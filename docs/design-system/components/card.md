# Card — Sanctuary Archive

토큰: [../tokens/color.md](../tokens/color.md), [../tokens/shape.md](../tokens/shape.md).

- **그림자 없음.** 1px 외곽선(`outline-variant`, 양피지보다 살짝 짙은 톤) 또는 미세한 배경 톤 시프트(`surface-container`)로 카드를 정의한다.
- 모서리: `DEFAULT`(4px)~`lg`(8px).
- 상호작용(클릭 가능)은 배경 톤 시프트(`surface-container-high`)로 hover 표현 — 떠오르는 그림자 금지.

```html
<article
  class="bg-surface-container-low border border-outline-variant rounded-md p-stack-md
                hover:bg-surface-container-high transition-colors"
>
  …
</article>
```

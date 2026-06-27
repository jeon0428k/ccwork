# Input — Sanctuary Archive

"Ruled Lines" — 공책 줄 은유. 토큰: [../tokens/color.md](../tokens/color.md), [../tokens/elevation.md](../tokens/elevation.md).

- 풀 박스 대신 **하단 룰 라인**(`outline-variant`)으로 공책 줄 느낌. 포커스 시 `primary`로 진해짐.
- 또는 매우 옅은 **음각 박스**(inner-shadow inset).
- 폰트: 본문 입력은 `body-lg`, 라벨은 `label-lg`. placeholder는 `surface-dim`.

```html
<!-- Ruled line -->
<input
  class="bg-transparent border-b border-outline-variant focus:border-primary
              font-body text-on-surface placeholder:text-surface-dim py-stack-sm outline-none"
/>

<!-- 음각 박스 -->
<input
  class="bg-surface-container-low rounded-md px-stack-sm py-stack-sm
              shadow-[inset_0_1px_2px_0_rgba(50,34,20,0.1)] outline-none"
/>
```

# Button — Sanctuary Archive

"Leather Tabs / Ink Stamps" — 가죽 탭/잉크 스탬프 은유. 토큰: [../tokens/color.md](../tokens/color.md), 그림자: [../tokens/elevation.md](../tokens/elevation.md).

- **Primary**: `primary`(Deep Leather) 배경 + `on-primary`(양피지) 텍스트. 1.5px 외곽선(`primary` 약간 어둡게). hard-edge 2px 그림자.
- **Secondary**: `secondary-container`(Tan) 배경 + `on-secondary-container` 텍스트. 1.5px 외곽선.
- 모서리: `lg`(8px) 이하. 폰트: `label-lg`(Source Serif 4, 600, +0.05em).
- 그림자: `2px 2px 0 0 rgba(50,34,20,.2)` — **blur 금지.** 누름 시 1px로.

```html
<button
  class="bg-primary text-on-primary font-body rounded-lg px-stack-md py-stack-sm
               shadow-[2px_2px_0_0_rgba(50,34,20,0.2)] active:translate-y-[1px]
               active:shadow-[1px_1px_0_0_rgba(50,34,20,0.2)] transition-all"
>
  저장
</button>
```

# Shape / Radius — Sanctuary Archive

**Soft** — 4px 기본. 날카로운 90°(임상적)도, 과한 둥근 모서리(장난스러움)도 아니다. 잘 쓰인 책의 닳은 모서리, 두꺼운 종이의 자연스러운 컷 느낌.

## 모서리 토큰

| 토큰      | 값                         |
| --------- | -------------------------- |
| `sm`      | 0.125rem (2px)             |
| `DEFAULT` | 0.25rem (4px) — 표준       |
| `md`      | 0.375rem (6px)             |
| `lg`      | 0.5rem (8px)               |
| `xl`      | 0.75rem (12px) — **최대**  |
| `full`    | 9999px — **칩(pill) 한정** |

규칙:

- 일반 컨테이너·카드·버튼·인풋은 `DEFAULT`(4px)~`lg`(8px). 큰 표면도 `xl`(12px)까지.
- `rounded-2xl` 이상(16px+)·`rounded-3xl` 금지. `full`은 칩에만.

## Tailwind v4 `@theme` (radius)

```css
@theme {
  --radius: 0.25rem; /* DEFAULT */
}
```

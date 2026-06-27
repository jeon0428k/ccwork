# Typography — Sanctuary Archive

**듀얼 세리프 페어링.** 헤드라인 = Playfair Display(고대비·우아), 본문/라벨 = Source Serif 4(가독·학술적). 산세리프 금지. 라벨·메타는 small-caps 또는 이탤릭으로 기록보관소 표기 느낌.

## 타입 스케일

| 레벨                 | 폰트             | 크기/굵기/행간    | letter-spacing |
| -------------------- | ---------------- | ----------------- | -------------- |
| `display-lg`         | Playfair Display | 48px / 700 / 56px | -0.02em        |
| `headline-lg`        | Playfair Display | 32px / 700 / 40px | —              |
| `headline-lg-mobile` | Playfair Display | 28px / 700 / 36px | —              |
| `headline-md`        | Playfair Display | 24px / 600 / 32px | —              |
| `body-lg`            | Source Serif 4   | 18px / 400 / 28px | —              |
| `body-md`            | Source Serif 4   | 16px / 400 / 24px | —              |
| `label-lg`           | Source Serif 4   | 14px / 600 / 20px | 0.05em         |
| `label-sm`           | Source Serif 4   | 12px / 400 / 16px | —              |

한글 헤드라인은 `word-break: keep-all`로 자연스러운 줄바꿈을 준다.

## 폰트 스택 (한글 폴백 필수)

Playfair Display·Source Serif 4는 **한글 글리프가 없다.** 반드시 한글 세리프(Noto Serif KR)를 폴백에 포함한다.

```css
--font-display: 'Playfair Display', 'Noto Serif KR', serif; /* 헤드라인 */
--font-body: 'Source Serif 4', 'Noto Serif KR', serif; /* 본문·라벨 */
```

## 폰트 로딩

`index.html` 또는 CSS `@import`:

```html
<link
  href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Source+Serif+4:wght@400;600&family=Noto+Serif+KR:wght@400;600;700&display=swap"
  rel="stylesheet"
/>
```

## Tailwind v4 `@theme` (폰트)

```css
@theme {
  --font-display: 'Playfair Display', 'Noto Serif KR', serif;
  --font-body: 'Source Serif 4', 'Noto Serif KR', serif;
}
```

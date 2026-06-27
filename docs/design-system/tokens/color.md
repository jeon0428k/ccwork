# Color — Sanctuary Archive

"Classic Notebook" — 양피지·잉크·가죽·황동의 어스톤. 임의 HEX 대신 토큰/시맨틱 클래스를 쓴다. 순수 검정·차가운 그레이·쨍한 채도 금지([../dont.md](../dont.md)).

## 표면 (Surface — 톤 레이어)

| 토큰                        | HEX       | 용도                        |
| --------------------------- | --------- | --------------------------- |
| `background` / `surface`    | `#fef8f5` | 베이스 양피지 (기본 캔버스) |
| `surface-container-lowest`  | `#ffffff` | 최상층(드물게)              |
| `surface-container-low`     | `#f8f2ef` | 가라앉은 표면 1             |
| `surface-container`         | `#f2ede9` | 표면 2                      |
| `surface-container-high`    | `#ede7e4` | 표면 3 (hover/선택)         |
| `surface-container-highest` | `#e7e1de` | 표면 4                      |
| `surface-dim`               | `#ded9d6` | placeholder·비활성          |
| `surface-variant`           | `#e7e1de` | 보조 표면                   |
| `inverse-surface`           | `#32302e` | 반전 표면(툴팁 등)          |
| `inverse-on-surface`        | `#f5f0ec` | 반전 표면 위 텍스트         |

## 텍스트/잉크 (On-surface)

| 토큰                           | HEX       | 용도                                   |
| ------------------------------ | --------- | -------------------------------------- |
| `on-surface` / `on-background` | `#1d1b19` | 기본 텍스트(잉크 블랙, 순수 검정 아님) |
| `on-surface-variant`           | `#4e453e` | 보조 텍스트·메타·라벨                  |
| `outline`                      | `#80756d` | 외곽선·구분선                          |
| `outline-variant`              | `#d2c4bb` | 약한 외곽선·룰 라인                    |

## Primary (Deep Leather — 핵심 액션 전용)

| 토큰                   | HEX       |
| ---------------------- | --------- |
| `primary`              | `#322214` |
| `on-primary`           | `#ffffff` |
| `primary-container`    | `#4a3728` |
| `on-primary-container` | `#bba08c` |
| `inverse-primary`      | `#dec1ac` |
| `surface-tint`         | `#705a49` |

## Secondary (Aged Brass/Tan — 액센트·칩)

| 토큰                     | HEX       |
| ------------------------ | --------- |
| `secondary`              | `#715a3e` |
| `on-secondary`           | `#ffffff` |
| `secondary-container`    | `#fdddb9` |
| `on-secondary-container` | `#786044` |

## Tertiary (Dusty Vellum) / Error

| 토큰                    | HEX       |
| ----------------------- | --------- |
| `tertiary`              | `#2c2412` |
| `tertiary-container`    | `#433a25` |
| `on-tertiary-container` | `#b1a489` |
| `error`                 | `#ba1a1a` |
| `on-error`              | `#ffffff` |
| `error-container`       | `#ffdad6` |
| `on-error-container`    | `#93000a` |

## Tailwind v4 `@theme` (색상)

```css
@theme {
  --color-background: #fef8f5;
  --color-surface: #fef8f5;
  --color-surface-container-lowest: #ffffff;
  --color-surface-container-low: #f8f2ef;
  --color-surface-container: #f2ede9;
  --color-surface-container-high: #ede7e4;
  --color-surface-container-highest: #e7e1de;
  --color-surface-dim: #ded9d6;
  --color-surface-variant: #e7e1de;
  --color-on-surface: #1d1b19;
  --color-on-surface-variant: #4e453e;
  --color-outline: #80756d;
  --color-outline-variant: #d2c4bb;
  --color-primary: #322214;
  --color-on-primary: #ffffff;
  --color-primary-container: #4a3728;
  --color-on-primary-container: #bba08c;
  --color-secondary: #715a3e;
  --color-on-secondary: #ffffff;
  --color-secondary-container: #fdddb9;
  --color-on-secondary-container: #786044;
  --color-error: #ba1a1a;
  --color-on-error: #ffffff;
}
```

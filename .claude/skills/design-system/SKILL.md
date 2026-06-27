---
name: design-system
description: >
  Apply the "Sanctuary Archive" design system when doing any visual/UI work in this notes app —
  styling .tsx/.css, building components, layout, colors, typography, spacing, Tailwind classes.
  Routes to the right granular spec in docs/design-system/ and enforces Do/Don't rules. Use when
  editing UI components, CSS, styling, building new components, or any visual/layout work. Trigger
  on keywords: style, UI, design, layout, component, CSS, Tailwind, color, spacing, hover, focus,
  theme, 디자인, 스타일, 컴포넌트, 레이아웃, 색상.
---

# Sanctuary Archive — 디자인 작업 스킬

이 노트 앱의 **모든 스타일/UI 작업**은 `docs/design-system/`의 "Sanctuary Archive" 디자인 시스템을 따른다. 이 스킬은 **작업 유형에 맞는 문서 조각만 골라 읽도록** 라우팅한다 (정본은 `docs/design-system/`, 여기 복사하지 않는다).

## 작업 순서

1. **먼저** [`docs/design-system/dont.md`](../../../docs/design-system/dont.md) 를 읽어 금지 패턴 파악.
2. 아래 표에서 **작업 유형에 해당하는 파일만** 읽는다 (전부 읽지 않는다 — 토큰 절약).
3. 임의 HEX·px 대신 토큰을 사용해 구현.
4. [`docs/design-system/do.md`](../../../docs/design-system/do.md) 체크리스트로 자가 리뷰.

## 라우팅 — 작업 유형 → 읽을 파일

| 작업                          | 읽을 파일                                                           |
| ----------------------------- | ------------------------------------------------------------------- |
| 개요·원칙 확인                | `docs/design-system/README.md` · `docs/design-system/principles.md` |
| 색상 (+ `@theme` 색상)        | `docs/design-system/tokens/color.md`                                |
| 폰트·타입스케일 (+ 한글 폴백) | `docs/design-system/tokens/typography.md`                           |
| 간격·레이아웃                 | `docs/design-system/tokens/spacing.md`                              |
| 모서리                        | `docs/design-system/tokens/shape.md`                                |
| 깊이·그림자·letterpress       | `docs/design-system/tokens/elevation.md`                            |
| 버튼                          | `docs/design-system/components/button.md`                           |
| 인풋                          | `docs/design-system/components/input.md`                            |
| 칩                            | `docs/design-system/components/chip.md`                             |
| 카드                          | `docs/design-system/components/card.md`                             |
| 리스트                        | `docs/design-system/components/list.md`                             |
| 디바이더                      | `docs/design-system/components/divider.md`                          |
| 금지 패턴                     | `docs/design-system/dont.md`                                        |
| 완료 후 리뷰                  | `docs/design-system/do.md`                                          |

## 핵심 원칙 (요약)

- **Editorial Serif** — Playfair Display(헤드라인) + Source Serif 4(본문). 산세리프 금지. 한글은 Noto Serif KR 폴백.
- **Warm Parchment** — 양피지·잉크·가죽·황동 어스톤. 순수 검정/순백 글레어 금지.
- **Tonal & Letterpress Depth** — 흐릿한 그림자 대신 톤 레이어 + 음각 + hard-edge 2px.
- **Analog Object** — 중앙 정렬·여백 프레임 유지(데스크탑 64px / 모바일 20px).

## 자동 검사 (Hook)

`.tsx/.css` 저장 시 `.claude/hooks/design-system-check.sh`(PostToolUse)가 `dont.md` 위반을 검사한다.

- **차단(exit 2)**: 순수 검정, 흐릿한 floating 그림자(`drop-shadow`/`shadow-2xl`), `rounded-3xl`.
- **권고(경고만)**: 중성 그레이, 산세리프 폰트, `shadow-lg/xl`, `rounded-2xl` (점진 이행 대상).

차단되면 메시지의 토큰 가이드대로 수정 후 다시 저장한다.

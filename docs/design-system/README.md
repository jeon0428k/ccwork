# Sanctuary Archive — 디자인 시스템

> 이 문서는 본 노트 앱의 **정식 디자인 시스템**이다. **모든 스타일/UI 작업(`.tsx`, `.css`, Tailwind 클래스, 신규 컴포넌트, 레이아웃)은 이 문서를 기준으로 진행**한다. 작업 시 `design-system` 스킬이 작업 유형에 맞는 파일로 라우팅한다. 출처: Stitch가 생성한 "Sanctuary Archive" 디자인 시스템.

## 4대 원칙 (요약)

1. **Editorial Serif** — Playfair Display(헤드라인) + Source Serif 4(본문). 산세리프 금지, 한글은 Noto Serif KR 폴백.
2. **Warm Parchment** — 따뜻한 양피지·잉크·가죽·황동 어스톤. 순수 검정·순백 글레어 회피.
3. **Tonal & Letterpress Depth** — 흐릿한 그림자 대신 톤 레이어 + 음각 + hard-edge 2px.
4. **Analog Object** — 중앙 정렬·여백 프레임 유지("종이 오브젝트").

자세한 철학은 [principles.md](./principles.md).

## 파일 구조 (세분화 — 필요한 조각만 읽기)

```
docs/design-system/
├── README.md              # 인덱스 + 4대 원칙 (진입점)
├── principles.md          # 브랜드 철학
├── tokens/
│   ├── color.md           # 색상
│   ├── typography.md      # 폰트/타입스케일 + 한글 폴백
│   ├── spacing.md         # 간격 + 레이아웃
│   ├── shape.md           # radius
│   └── elevation.md       # 톤레이어/letterpress/그림자
├── components/
│   ├── button.md
│   ├── input.md
│   ├── chip.md
│   ├── card.md
│   ├── list.md
│   └── divider.md
├── do.md                  # ✅ 체크리스트
└── dont.md                # ⛔ 금지 패턴
```

## 작업 유형 → 읽을 파일

| 작업                         | 파일                                             |
| ---------------------------- | ------------------------------------------------ |
| 색상                         | [tokens/color.md](./tokens/color.md)             |
| 폰트·타입스케일 (+한글 폴백) | [tokens/typography.md](./tokens/typography.md)   |
| 간격·레이아웃                | [tokens/spacing.md](./tokens/spacing.md)         |
| 모서리                       | [tokens/shape.md](./tokens/shape.md)             |
| 깊이·그림자                  | [tokens/elevation.md](./tokens/elevation.md)     |
| 버튼                         | [components/button.md](./components/button.md)   |
| 인풋                         | [components/input.md](./components/input.md)     |
| 칩                           | [components/chip.md](./components/chip.md)       |
| 카드                         | [components/card.md](./components/card.md)       |
| 리스트                       | [components/list.md](./components/list.md)       |
| 디바이더                     | [components/divider.md](./components/divider.md) |
| 금지 패턴                    | [dont.md](./dont.md)                             |
| 완료 후 리뷰                 | [do.md](./do.md)                                 |

## 작업 순서

1. 스타일 작업 전 **[dont.md](./dont.md)** 먼저 읽어 금지 패턴 파악.
2. 위 표에서 **작업 유형에 해당하는 파일만** 읽는다 (전부 읽지 않음 — 토큰 절약).
3. 임의 HEX·px 대신 토큰을 사용해 구현.
4. **[do.md](./do.md)** 체크리스트로 자가 리뷰.

## 알아둘 점

- **한글 폰트**: Playfair Display·Source Serif 4는 한글 글리프가 없다 → 폰트 스택에 Noto Serif KR 폴백 필수([tokens/typography.md](./tokens/typography.md)).
- **자동 검사**: `.tsx/.css` 저장 시 `.claude/hooks/design-system-check.sh`가 `dont.md` 위반을 검사한다.
- **점진 이행**: 기존 구현 UI(중성 그레이)는 이 문서 이전 것. 손대는 화면부터 Sanctuary Archive로 이행한다.

# Spacing & Layout — Sanctuary Archive

8px 베이스라인. 넉넉한 여백으로 "프레임" 효과 — 콘텐츠를 책상 위 펼친 책처럼 보이게 한다.

## 간격 토큰

| 토큰                  | 값     |
| --------------------- | ------ |
| `unit`                | 8px    |
| `stack-sm`            | 12px   |
| `stack-md`            | 24px   |
| `stack-lg`            | 48px   |
| `gutter`              | 32px   |
| `margin-mobile`       | 20px   |
| `margin-desktop`      | 64px   |
| `container-max-width` | 1120px |

## 레이아웃 (Layout)

- **Fixed Grid** — 책상 위 펼친 책처럼 화면 **중앙 정렬**. 최대 폭 `container-max-width`(1120px).
- **여백 프레임**: 데스크탑 64px(`margin-desktop`), 모바일 20px(`margin-mobile`). **여백은 절대 0이 되지 않는다** — 양피지에 항상 보이는 가장자리/인셋을 유지해 "종이 오브젝트" 은유를 지킨다.
- **수직 리듬**: 엄격한 8px baseline grid로 텍스트가 "떠 있지" 않고 "놓인" 느낌.
- **콘텐츠 폭**: 본문 가독성을 위해 에디터/리딩 영역은 고정 폭(예: 800px)으로 줄 길이를 보존한다.

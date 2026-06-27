# Elevation & Depth — Sanctuary Archive

떠 있는 흐릿한 그림자 대신 **톤 레이어 + 음각(letterpress)**. "stacked paper" 룩. 큰 blur 금지([../dont.md](../dont.md)).

## 깊이 표현 3종

1. **표면 스택 (Tonal Layers)**
   어두운 "책상"(베이스) 뒤에 "양피지"(컨테이너)를 쌓아 깊이를 만든다. Z축 그림자 대신 `surface-container-*` 스케일로 단계 표현. → [color.md](./color.md)

2. **물리적 음각 (Letterpress Inset)**
   인풋·보조 컨테이너는 미세한 inner-shadow로 종이에 눌린(debossed) 느낌.

   ```css
   box-shadow: inset 0 1px 2px 0 rgba(50, 34, 20, 0.1);
   ```

3. **마이크로 그림자 (Hard-edge)**
   버튼은 단일 hard-edge 그림자(2px offset)로 카드스톡/가죽 탭 두께감. **blur 금지.**
   ```css
   box-shadow: 2px 2px 0 0 rgba(50, 34, 20, 0.2);
   /* 누름: 1px로 줄여 눌리는 느낌 */
   ```

## Floating 요소

- 모달·컨텍스트 메뉴 등 **일시적 오버레이만** 부드러운 그림자 허용(매우 옅게). 그 외 카드·버튼·패널은 톤 레이어/음각/hard-edge로만.

#!/usr/bin/env bash
# Sanctuary Archive 디자인 시스템 검사 (PostToolUse)
# .tsx/.jsx/.ts/.css/.scss 편집 시 docs/design-system/dont.md 위반을 검사한다.
#   - BLOCK 티어: exit 2로 차단 (Claude에 피드백)
#   - WARN  티어: 경고만 출력 (점진 이행 대상)
set -uo pipefail

input=$(cat)

# 편집된 파일 경로 추출 (jq 우선, 폴백 grep)
if command -v jq >/dev/null 2>&1; then
  file=$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty')
else
  file=$(printf '%s' "$input" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"file_path"[[:space:]]*:[[:space:]]*"//;s/"$//')
fi

[ -z "$file" ] && exit 0
[ -f "$file" ] || exit 0

case "$file" in
  *.tsx|*.jsx|*.ts|*.css|*.scss) ;;
  *) exit 0 ;;
esac

block_out=""
warn_out=""

# check <block|warn> <regex> <메시지>
check() {
  local matches
  matches=$(grep -nEi "$2" "$file" 2>/dev/null)
  [ -z "$matches" ] && return 0
  if [ "$1" = "block" ]; then
    block_out+="⛔ $3"$'\n'"$matches"$'\n\n'
  else
    warn_out+="⚠️  $3"$'\n'"$matches"$'\n\n'
  fi
}

# ── BLOCK 티어 (명백한 위반 → 차단) ──
check block '#000000|#000\b|\b(bg|text|border)-black\b|:[[:space:]]*black\b' \
  '순수 검정 금지 → 잉크 블랙 #1d1b19 (text-on-surface)'
check block '\bdrop-shadow|\bshadow-2xl\b' \
  '흐릿한 floating 그림자 금지 → hard-edge 2px 그림자 (카드스톡)'
check block '\brounded-3xl\b' \
  '과한 둥근 모서리 금지 → 최대 12px (rounded-xl)'

# ── WARN 티어 (점진 이행 대상 → 경고만) ──
check warn '\b(bg|text|border)-(slate|gray|zinc|neutral|stone|cool)-[0-9]' \
  '차가운 중성 그레이 → 따뜻한 어스톤 토큰 (surface / on-surface)'
check warn 'sans-serif|\bfont-sans\b|Pretendard|\bInter\b|system-ui' \
  '산세리프 폰트 → Playfair Display(헤드라인) / Source Serif 4(본문)'
check warn '\bshadow-lg\b|\bshadow-xl\b' \
  '블러 그림자 → 톤 레이어 또는 hard-edge 2px'
check warn '\brounded-2xl\b' \
  '큰 둥근 모서리 → soft 4px 기본 (pill은 칩 한정)'

# ── 출력 ──
if [ -n "$warn_out" ]; then
  printf '── Sanctuary Archive 권고 · %s ──\n%s' "$file" "$warn_out" >&2
fi

if [ -n "$block_out" ]; then
  printf '── Sanctuary Archive 위반 (수정 필요) · %s ──\n%s' "$file" "$block_out" >&2
  printf '→ docs/design-system/dont.md · 토큰: docs/design-system/tokens/ · 컴포넌트: docs/design-system/components/\n' >&2
  exit 2
fi

exit 0

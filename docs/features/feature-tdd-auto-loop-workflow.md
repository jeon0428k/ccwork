## 기본 동작

- 입력: $ARGUMENTS = GitHub 이슈 번호
- 7단계 순서는 /tdd-loop 컨테이너 참조 (시나리오 → Red → Green → AC 검증 → Refactor → Security → PR)
- 각 단계는 Task tool로 subagent spawn — 격리 실행
- 사용자 동의 없이 끝까지 완주

## 0단계 사전 점검

- AC 존재 / git status clean / base 브랜치 == feature/<spec> / feat/<slug> 분기

## 자율 모드 강제 (모든 subagent 호출 프롬프트 끝에 작성)

- 하위 스킬의 사용자 승인 게이트는 자체 통과
- 묻지 마라, 모호하면 STOP, 추측 금지
- 출력은 정해진 JSON 한 블록만, 그 외 텍스트 금지

## 격리 원칙

- 메인은 코드 본문 직접 안 봄 — subagent만
- AC 검증은 별도 agent — Green을 한 subagent와 반드시 분리
- subagent 종료 시 결과 JSON만 반환

## 재시도

- Green 단계만 최대 3회
- 다른 단계는 schema 위반 시 1회 재시도 후 STOP

## 리포트 / 진행 표시

- 단계별 정해진 JSON schema에 맞춰 본 세션 리포트 (schema는 예시값과 함께 명세, 변형 금지)
- 진행 메시지는 [단계명] OK / STOP({사유}) 한 줄

## STOP 처리

- 각 단계 STOP 조건 명시 (예: ac_passed=false / Green 3회 실패 / Security high+)
- STOP 시: 메인 로그 + gh issue comment + 루프 종료 (사람에게 안 묻기)

## PR 단계

- base = feature/<spec>
- body에 Closes #$ARGUMENTS 포함
- commitlint 검증, 실패 시 STOP

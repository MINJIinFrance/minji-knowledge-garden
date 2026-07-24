# Minji Brand Correction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 잘못된 Minjae 브랜딩을 Minji로 통일하고 다시 배포한다.

**Architecture:** 중앙 사이트 설정과 페이지 메타데이터, 문서의 이름 문자열만 수정한다. 기능과 레이아웃은 유지하며 검색과 테스트로 누락 및 회귀를 확인한다.

**Tech Stack:** Astro, TypeScript, Vitest, Playwright, Codex Sites

## Global Constraints

- 사이트 브랜드는 `minji.log`, 작성자 표시는 `Minji`다.
- 기능, 콘텐츠 구조, 레이아웃, 접근 정책은 변경하지 않는다.

---

### Task 1: 브랜딩 문자열 보정

**Files:**
- Modify: `src/config/site.ts`
- Modify: `src/pages/**/*.astro`
- Modify: `README.md`
- Modify: `docs/superpowers/plans/2026-07-23-personal-knowledge-portfolio.md`

- [ ] 잘못된 이름을 검색해 대상 파일을 확인한다.
- [ ] `minjae.log`를 `minji.log`로, 작성자 `민재`를 `Minji`로 수정한다.
- [ ] 잘못된 이름이 남지 않았는지 다시 검색한다.

### Task 2: 검증 및 배포

**Files:**
- Test: `tests/**/*.test.ts`
- Test: `tests/e2e/*.spec.ts`

- [ ] `pnpm check`, `pnpm test`, `pnpm test:e2e`, `pnpm build`를 실행한다.
- [ ] 변경사항을 커밋하고 Sites 소스 저장소에 푸시한다.
- [ ] 새 저장 버전을 소유자 전용 프로덕션으로 배포하고 URL을 확인한다.

# minji.log

개인 공부 기록과 프로젝트를 연결해 공개하는 Astro 기반 지식 포트폴리오입니다.

## 로컬 실행

```bash
pnpm install
pnpm dev
```

검증은 `pnpm check`, `pnpm test`, `pnpm test:e2e`, `pnpm build` 순서로 실행합니다.

## 콘텐츠 작성

- 노트: `src/content/notes/*.md`
- 프로젝트: `src/content/projects/*.md`
- 공개할 글은 frontmatter의 `draft`를 `false`로 설정합니다.
- 노트 본문에서 `[[slug]]` 문법으로 다른 노트를 연결할 수 있습니다.

## 배포

`SITE_URL`에 실제 공개 주소를 지정한 뒤 정적 빌드를 생성합니다.

```bash
SITE_URL=https://example.com pnpm build
```

`.openai/hosting.json`의 프로젝트 ID는 Codex Sites 배포에 사용되므로 유지합니다.

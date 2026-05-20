# Frontend

React 19 + Vite 프로젝트.

## Structure

```
src/
├── App.jsx        # 루트 컴포넌트
├── App.css        # 글로벌 스타일
├── main.jsx       # 진입점
└── assets/        # 이미지, SVG 등 정적 파일
```

## Commands

```bash
npm run dev      # 개발 서버 (port 5173)
npm run build    # 프로덕션 빌드
npm run preview  # 빌드 결과 미리보기
npm run lint     # ESLint 검사
```

## Conventions

- 컴포넌트 파일명: PascalCase (`MyComponent.jsx`)
- CSS 파일: 컴포넌트와 같은 이름 (`MyComponent.css`)
- API 호출은 `http://localhost:8000/api` 로

## Adding New Components

`src/components/` 디렉토리를 만들어 컴포넌트별로 분리 권장.

## API 연동 예시

```js
const res = await fetch('http://localhost:8000/api/items/')
const data = await res.json()
```

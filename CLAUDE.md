# Project Overview

React + FastAPI 웹앱 프로젝트.

## Structure

```
hyerin_project/
├── frontend/     # React 19 + Vite
├── backend/      # Python FastAPI
└── start.sh      # 전체 실행 스크립트
```

## How to Run

```bash
./start.sh        # 백엔드 + 프론트엔드 동시 실행
```

| 서버 | URL |
|------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |

## Tech Stack

- **Frontend**: React 19, Vite, JavaScript (JSX)
- **Backend**: FastAPI, Pydantic v2, Uvicorn
- **Package manager**: npm (frontend), pip + venv (backend)

## Key Conventions

- API 경로는 `/api/` 접두사 사용
- 백엔드 CORS는 `http://localhost:5173` 허용
- 환경변수는 `backend/.env` 에서 관리
- 새 API 라우터는 `backend/app/api/routes/` 에 파일 추가 후 `__init__.py` 에 등록

# Backend

FastAPI 백엔드.

## Structure

```
app/
├── main.py            # 앱 진입점, CORS, 라우터 등록
├── core/
│   └── config.py      # 환경변수 (pydantic-settings)
├── api/
│   └── routes/
│       ├── __init__.py   # 라우터 통합
│       └── items.py      # 예시 라우터
├── models/            # SQLAlchemy 모델 (DB 사용 시)
└── schemas/           # Pydantic 스키마 (요청/응답 타입)
```

## Commands

```bash
source venv/bin/activate
uvicorn app.main:app --reload   # 개발 서버 (port 8000)
```

## Adding a New API Route

1. `app/api/routes/foo.py` 생성
2. `APIRouter()` 인스턴스 만들고 엔드포인트 작성
3. `app/api/routes/__init__.py` 에 등록:

```python
from app.api.routes import foo
router.include_router(foo.router, prefix="/foo", tags=["foo"])
```

## Environment Variables

`backend/.env` 파일에서 관리. `app/core/config.py`의 `Settings` 클래스에 필드 추가하면 자동으로 로드됨.

## API Docs

서버 실행 후 http://localhost:8000/docs (Swagger UI)

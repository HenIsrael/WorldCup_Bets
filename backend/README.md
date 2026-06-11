# World Cup Predictions API

FastAPI backend that stores per-game prediction probabilities in PostgreSQL.

## Dev setup with Docker PostgreSQL

The database runs in Docker; the API runs locally with auto-reload so table/data
changes are reflected in real time.

### 1. Start PostgreSQL (and Adminer)

```bash
cd backend
docker compose up -d
```

This starts:
- `db` — PostgreSQL 16 on `localhost:5432` (user/pass/db: `postgres` / `postgres` / `worldcup`), data persisted in the `pgdata` volume.
- `adminer` — a web DB browser at http://localhost:8080 for inspecting tables/rows live.

Adminer login: System `PostgreSQL`, Server `db`, Username `postgres`, Password `postgres`, Database `worldcup`.

### 2. Install Python deps

```bash
python -m venv .venv
# Windows (Git Bash): .venv/Scripts/python.exe -m pip install -r requirements.txt
# macOS/Linux:        .venv/bin/pip install -r requirements.txt
```

### 3. Run the API (auto-reload)

```bash
# Windows (Git Bash):
.venv/Scripts/uvicorn app.main:app --reload --port 8000
# macOS/Linux:
.venv/bin/uvicorn app.main:app --reload --port 8000
```

The `match_predictions` table is created automatically on startup.
Open the interactive docs at http://localhost:8000/docs.

### Real-time workflow
- The API process uses `--reload`, so code edits restart it automatically.
- Data written via the API persists in the Docker volume and is immediately
  visible in Adminer (refresh the table view).
- To wipe the database, run `docker compose down -v` (removes the `pgdata` volume).

## Endpoints
- `GET /health`
- `GET /predictions`
- `GET /predictions/{game_id}`
- `PUT /predictions/{game_id}` (create/update)
- `DELETE /predictions/{game_id}`

## Config
Environment variables (see `.env.example`, loaded from `.env`):
- `DATABASE_URL` — SQLAlchemy connection string.
- `CORS_ORIGINS` — comma-separated allowed origins for the frontend.

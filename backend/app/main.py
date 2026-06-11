import logging
import secrets
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, Security, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import APIKeyHeader
from sqlalchemy.orm import Session

from . import crud
from .config import settings
from .database import Base, engine, get_db
from .poisson import predict_score
from .schemas import MatchPredictionCreate, MatchPredictionRead, MatchScoreRead

logger = logging.getLogger("uvicorn.error")

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


def require_admin(api_key: str | None = Security(api_key_header)) -> None:
    """Guard write endpoints: require a valid X-API-Key header.

    Reads are public; only create/update/delete need this.
    """
    if not settings.admin_api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Write access is disabled: ADMIN_API_KEY is not configured.",
        )
    if not api_key or not secrets.compare_digest(api_key, settings.admin_api_key):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API key.",
        )


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Create tables on startup (single table, no migration history needed yet).
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="World Cup Predictions API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["meta"])
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/predictions", response_model=list[MatchPredictionRead], tags=["predictions"])
def list_predictions(db: Session = Depends(get_db)) -> list[MatchPredictionRead]:
    return crud.list_predictions(db)


@app.get(
    "/predictions/{game_id}",
    response_model=MatchPredictionRead,
    tags=["predictions"],
)
def get_prediction(game_id: str, db: Session = Depends(get_db)) -> MatchPredictionRead:
    prediction = crud.get_prediction(db, game_id)
    if prediction is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No prediction found for game_id '{game_id}'",
        )
    return prediction


@app.get(
    "/predictions/{game_id}/score",
    response_model=MatchScoreRead,
    tags=["predictions"],
    dependencies=[Depends(require_admin)],
)
def get_score(game_id: str, db: Session = Depends(get_db)) -> MatchScoreRead:
    prediction = crud.get_prediction(db, game_id)
    if prediction is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No prediction found for game_id '{game_id}'",
        )

    result = predict_score(prediction)
    top5_str = ", ".join(
        f"{s.home}-{s.away} ({s.prob * 100:.1f}%)" for s in result.top5
    )
    logger.info(
        "[Bet] game %s | lambda_home=%.2f lambda_away=%.2f | top 5: %s",
        game_id,
        result.lambda_home,
        result.lambda_away,
        top5_str,
    )
    return MatchScoreRead(home=result.home, away=result.away)


@app.put(
    "/predictions/{game_id}",
    response_model=MatchPredictionRead,
    tags=["predictions"],
    dependencies=[Depends(require_admin)],
)
def upsert_prediction(
    game_id: str,
    payload: MatchPredictionCreate,
    db: Session = Depends(get_db),
) -> MatchPredictionRead:
    return crud.upsert_prediction(db, game_id, payload)


@app.delete(
    "/predictions/{game_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["predictions"],
    dependencies=[Depends(require_admin)],
)
def delete_prediction(game_id: str, db: Session = Depends(get_db)) -> None:
    deleted = crud.delete_prediction(db, game_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No prediction found for game_id '{game_id}'",
        )

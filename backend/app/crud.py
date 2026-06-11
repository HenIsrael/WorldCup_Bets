from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import MatchPrediction
from .schemas import MatchPredictionCreate


def list_predictions(db: Session) -> list[MatchPrediction]:
    return list(db.scalars(select(MatchPrediction).order_by(MatchPrediction.game_id)))


def get_prediction(db: Session, game_id: str) -> MatchPrediction | None:
    return db.get(MatchPrediction, game_id)


def upsert_prediction(
    db: Session, game_id: str, payload: MatchPredictionCreate
) -> MatchPrediction:
    prediction = db.get(MatchPrediction, game_id)
    values = payload.model_dump()
    if prediction is None:
        prediction = MatchPrediction(game_id=game_id, **values)
        db.add(prediction)
    else:
        for field, value in values.items():
            setattr(prediction, field, value)
    db.commit()
    db.refresh(prediction)
    return prediction


def delete_prediction(db: Session, game_id: str) -> bool:
    prediction = db.get(MatchPrediction, game_id)
    if prediction is None:
        return False
    db.delete(prediction)
    db.commit()
    return True

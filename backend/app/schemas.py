from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class MatchPredictionBase(BaseModel):
    # Decimal odds (>= 0). No upper bound.
    host_win: float = Field(..., ge=0.0)
    draw: float = Field(..., ge=0.0)
    guest_win: float = Field(..., ge=0.0)

    goals_0_1: float = Field(..., ge=0.0)
    goals_2_3: float = Field(..., ge=0.0)
    goals_4_plus: float = Field(..., ge=0.0)

    over_2_5: float = Field(..., ge=0.0)
    under_2_5: float = Field(..., ge=0.0)


class MatchPredictionCreate(MatchPredictionBase):
    """Payload for creating/updating a prediction (game_id comes from the path)."""


class MatchPredictionRead(MatchPredictionBase):
    game_id: str
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

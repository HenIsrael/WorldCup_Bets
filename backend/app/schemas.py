from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class MatchPredictionBase(BaseModel):
    # Stored as decimal odds (>= 1.0 typically). Only require non-negative values.
    host_win_prob: float = Field(..., ge=0.0)
    draw_prob: float = Field(..., ge=0.0)
    guest_win_prob: float = Field(..., ge=0.0)

    goals_0_1_prob: float = Field(..., ge=0.0)
    goals_2_3_prob: float = Field(..., ge=0.0)
    goals_4_plus_prob: float = Field(..., ge=0.0)

    over_2_5_prob: float = Field(..., ge=0.0)
    under_2_5_prob: float = Field(..., ge=0.0)


class MatchPredictionCreate(MatchPredictionBase):
    """Payload for creating/updating a prediction (game_id comes from the path)."""


class MatchPredictionRead(MatchPredictionBase):
    game_id: str
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

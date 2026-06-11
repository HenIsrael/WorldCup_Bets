from datetime import datetime

from sqlalchemy import DateTime, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


class MatchPrediction(Base):
    """Probability set for a single game, keyed by the external game id."""

    __tablename__ = "match_predictions"

    game_id: Mapped[str] = mapped_column(String, primary_key=True)

    host_win_prob: Mapped[float] = mapped_column(Numeric(5, 4), nullable=False)
    draw_prob: Mapped[float] = mapped_column(Numeric(5, 4), nullable=False)
    guest_win_prob: Mapped[float] = mapped_column(Numeric(5, 4), nullable=False)

    goals_0_1_prob: Mapped[float] = mapped_column(Numeric(5, 4), nullable=False)
    goals_2_3_prob: Mapped[float] = mapped_column(Numeric(5, 4), nullable=False)
    goals_4_plus_prob: Mapped[float] = mapped_column(Numeric(5, 4), nullable=False)

    over_2_5_prob: Mapped[float] = mapped_column(Numeric(5, 4), nullable=False)
    under_2_5_prob: Mapped[float] = mapped_column(Numeric(5, 4), nullable=False)

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

"""Independent Poisson goals model fitted to bookmaker odds.

Given the decimal odds stored for a match, back out the implied probabilities,
fit a pair of Poisson rates (lambda_home, lambda_away) by grid search, and read
the most likely scorelines off the resulting score matrix.
"""

from __future__ import annotations

import math
from dataclasses import dataclass

from .models import MatchPrediction

MAX_GOALS = 10
_FACT = [math.factorial(k) for k in range(MAX_GOALS + 1)]


@dataclass
class ScoreProbability:
    home: int
    away: int
    prob: float


@dataclass
class PredictedScore:
    home: int
    away: int
    lambda_home: float
    lambda_away: float
    top5: list[ScoreProbability]


def _pmf_vector(lam: float) -> list[float]:
    e_neg = math.exp(-lam)
    return [e_neg * lam**k / _FACT[k] for k in range(MAX_GOALS + 1)]


def _normalize3(a: float, b: float, c: float) -> tuple[float, float, float]:
    s = a + b + c
    return a / s, b / s, c / s


def predict_score(p: MatchPrediction) -> PredictedScore:
    # Odds are stored as Decimal; cast to float before any float math.
    home_win = float(p.home_win)
    draw = float(p.draw)
    away_win = float(p.away_win)
    goals_0_1 = float(p.goals_0_1)
    goals_2_3 = float(p.goals_2_3)
    goals_4_plus = float(p.goals_4_plus)
    over_2_5 = float(p.over_2_5)
    under_2_5 = float(p.under_2_5)

    # Odds -> implied probabilities, normalized per market to strip the vig.
    t_home, t_draw, t_away = _normalize3(1 / home_win, 1 / draw, 1 / away_win)
    t_01, t_23, t_4p = _normalize3(1 / goals_0_1, 1 / goals_2_3, 1 / goals_4_plus)
    over = 1 / over_2_5
    under = 1 / under_2_5
    t_over = over / (over + under)

    best = {"err": math.inf, "lh": 1.0, "la": 1.0}

    def evaluate(lh: float, la: float) -> float:
        ph = _pmf_vector(lh)
        pa = _pmf_vector(la)

        # 1X2 via a running cumulative of the away distribution.
        home = 0.0
        draw = 0.0
        cum_away_below = 0.0
        for h in range(MAX_GOALS + 1):
            draw += ph[h] * pa[h]
            home += ph[h] * cum_away_below  # P(away < h)
            cum_away_below += pa[h]
        away = 1 - home - draw

        # Goal totals from Poisson(lh + la).
        pt = _pmf_vector(lh + la)
        p01 = p23 = p4p = p_over = 0.0
        for g in range(MAX_GOALS + 1):
            if g <= 1:
                p01 += pt[g]
            elif g <= 3:
                p23 += pt[g]
            else:
                p4p += pt[g]
            if g >= 3:
                p_over += pt[g]

        return (
            (home - t_home) ** 2
            + (draw - t_draw) ** 2
            + (away - t_away) ** 2
            + (p_over - t_over) ** 2
            + (p01 - t_01) ** 2
            + (p23 - t_23) ** 2
            + (p4p - t_4p) ** 2
        )

    # Coarse grid.
    lh = 0.1
    while lh <= 4.5:
        la = 0.1
        while la <= 4.5:
            err = evaluate(lh, la)
            if err < best["err"]:
                best = {"err": err, "lh": lh, "la": la}
            la += 0.05
        lh += 0.05

    # Fine refine around the best coarse pair.
    lh_start = max(0.05, best["lh"] - 0.05)
    la_start = max(0.05, best["la"] - 0.05)
    lh = lh_start
    while lh <= best["lh"] + 0.05:
        la = la_start
        while la <= best["la"] + 0.05:
            err = evaluate(lh, la)
            if err < best["err"]:
                best = {"err": err, "lh": lh, "la": la}
            la += 0.005
        lh += 0.005

    # Rebuild the score matrix and rank scorelines by probability.
    ph = _pmf_vector(best["lh"])
    pa = _pmf_vector(best["la"])
    scores = [
        ScoreProbability(home=h, away=a, prob=ph[h] * pa[a])
        for h in range(MAX_GOALS + 1)
        for a in range(MAX_GOALS + 1)
    ]
    scores.sort(key=lambda s: s.prob, reverse=True)
    top5 = scores[:5]

    return PredictedScore(
        home=top5[0].home,
        away=top5[0].away,
        lambda_home=best["lh"],
        lambda_away=best["la"],
        top5=top5,
    )

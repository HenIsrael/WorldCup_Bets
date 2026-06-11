import { useState } from 'react'
import type { MatchPrediction, Team } from '../types'
import type { MatchView } from '../utils/date'
import { getBetScore, getWinnerPrediction } from '../api'
import { formatLocalTime } from '../utils/timezone'
import { useSecretKey } from '../hooks/useSecretKey'
import UnlockModal from './UnlockModal'

interface MatchCardProps {
  match: MatchView
  teamsById: Map<string, Team>
}

function TeamFlag({ team, name }: { team: Team | undefined; name: string | undefined }) {
  const [errored, setErrored] = useState(false)
  const label = name ?? '?'
  if (team?.flag && !errored) {
    return (
      <img
        className="team-flag"
        src={team.flag}
        alt={`${label} flag`}
        loading="lazy"
        onError={() => setErrored(true)}
      />
    )
  }
  return (
    <span className="team-flag team-flag--fallback" aria-hidden="true">
      {label.slice(0, 2).toUpperCase() || '?'}
    </span>
  )
}

const PREDICTION_LABELS: Record<keyof Omit<MatchPrediction, 'updated_at'>, string> = {
  home_win: 'Home Win',
  draw: 'Draw',
  away_win: 'Away Win',
  goals_0_1: 'Goals 0–1',
  goals_2_3: 'Goals 2–3',
  goals_4_plus: 'Goals 4+',
  over_2_5: 'Over 2.5',
  under_2_5: 'Under 2.5',
}

export default function MatchCard({ match, teamsById }: MatchCardProps) {
  const { game, instant, stadium } = match
  const [homeScore, setHomeScore] = useState('')
  const [awayScore, setAwayScore] = useState('')

  const [predState, setPredState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [prediction, setPrediction] = useState<MatchPrediction | null>(null)
  const [predError, setPredError] = useState('')

  const homeTeam = teamsById.get(game.home_team_id)
  const awayTeam = teamsById.get(game.away_team_id)

  const sanitize = (value: string) => value.replace(/[^0-9]/g, '').slice(0, 2)

  const homeName = game.home_team_name_en || game.home_team_label || 'TBD'
  const awayName = game.away_team_name_en || game.away_team_label || 'TBD'
  const kickoff = instant ? formatLocalTime(instant) : 'TBD'
  const venue = stadium ? `${stadium.city_en}, ${stadium.country_en}` : null

  const handleWinner = async () => {
    if (predState === 'loading') return
    setPredState('loading')
    setPrediction(null)
    setPredError('')
    try {
      const data = await getWinnerPrediction(game.id)
      setPrediction(data)
      setPredState('done')
    } catch (err) {
      setPredError(err instanceof Error ? err.message : 'Failed to load prediction.')
      setPredState('error')
    }
  }

  const { unlocked, key, showModal, openModal, closeModal, tryUnlock, lock } = useSecretKey()

  const [betLoading, setBetLoading] = useState(false)

  const handleBet = async () => {
    if (betLoading) return
    setBetLoading(true)
    setPredError('')
    try {
      const { home, away } = await getBetScore(game.id, key)
      setHomeScore(String(home))
      setAwayScore(String(away))
    } catch (err) {
      setPredError(err instanceof Error ? err.message : 'Failed to compute bet.')
      setPredState('error')
    } finally {
      setBetLoading(false)
    }
  }

  return (
    <article className="match-card">
      <header className="match-card__meta">
        <span className="match-card__time">{kickoff}</span>
        {venue ? <span className="match-card__venue">{venue}</span> : null}
        {game.group ? <span className="match-card__group">Group {game.group}</span> : null}
      </header>

      <div className="match-card__body">
        <div className="team team--home">
          <TeamFlag team={homeTeam} name={homeName} />
          <div className="team__info">
            <span className="team__role">Home</span>
            <span className="team__name">{homeName}</span>
          </div>
        </div>

        <div className="prediction">
          <input
            className="score-box"
            inputMode="numeric"
            placeholder="-"
            aria-label={`${homeName} predicted score`}
            value={homeScore}
            onChange={(e) => setHomeScore(sanitize(e.target.value))}
          />
          <span className="prediction__sep">:</span>
          <input
            className="score-box"
            inputMode="numeric"
            placeholder="-"
            aria-label={`${awayName} predicted score`}
            value={awayScore}
            onChange={(e) => setAwayScore(sanitize(e.target.value))}
          />
        </div>

        <div className="team team--away">
          <div className="team__info">
            <span className="team__role">Away</span>
            <span className="team__name">{awayName}</span>
          </div>
          <TeamFlag team={awayTeam} name={awayName} />
        </div>
      </div>

      <div className="match-card__winner-row">
        <button
          className="btn btn--winner"
          onClick={() => void handleWinner()}
          disabled={predState === 'loading'}
          aria-busy={predState === 'loading'}
        >
          {predState === 'loading' ? (
            <><span className="spinner spinner--sm" aria-hidden="true" /> Loading…</>
          ) : (
            '🏆 Winner'
          )}
        </button>
        {unlocked ? (
          <>
            <button
              className="btn btn--bet"
              onClick={() => void handleBet()}
              disabled={betLoading}
              aria-busy={betLoading}
            >
              {betLoading ? (
                <><span className="spinner spinner--sm" aria-hidden="true" /> Betting…</>
              ) : (
                <><span aria-hidden="true">＋</span> Bet</>
              )}
            </button>
            <button
              className="btn btn--lock"
              onClick={lock}
              title="Lock Bet button"
              aria-label="Lock Bet button"
            >
              🔓
            </button>
          </>
        ) : (
          <button
            className="btn btn--locked"
            onClick={openModal}
            title="Unlock to use Bet"
            aria-label="Unlock Bet button"
          >
            🔒 Bet
          </button>
        )}
      </div>

      {showModal && <UnlockModal onUnlock={tryUnlock} onClose={closeModal} />}

      {predState === 'error' && (
        <div className="pred-error">{predError}</div>
      )}

      {predState === 'done' && prediction && (
        <div className="pred-row" role="table" aria-label="Winner prediction odds">
          {(Object.keys(PREDICTION_LABELS) as Array<keyof typeof PREDICTION_LABELS>).map((key) => (
            <div className="pred-cell" key={key} role="cell">
              <span className="pred-cell__label">{PREDICTION_LABELS[key]}</span>
              <span className="pred-cell__value">{Number(prediction[key]).toFixed(4)}</span>
            </div>
          ))}
        </div>
      )}
    </article>
  )
}

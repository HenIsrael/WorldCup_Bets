import { useState } from 'react'
import type { Game, Team } from '../types'
import { gameTime } from '../utils/date'

interface MatchCardProps {
  game: Game
  teamsById: Map<string, Team>
}

function TeamFlag({ team, name }: { team: Team | undefined; name: string }) {
  const [errored, setErrored] = useState(false)
  if (team?.flag && !errored) {
    return (
      <img
        className="team-flag"
        src={team.flag}
        alt={`${name} flag`}
        loading="lazy"
        onError={() => setErrored(true)}
      />
    )
  }
  return (
    <span className="team-flag team-flag--fallback" aria-hidden="true">
      {name.slice(0, 2).toUpperCase()}
    </span>
  )
}

export default function MatchCard({ game, teamsById }: MatchCardProps) {
  const [homeScore, setHomeScore] = useState('')
  const [awayScore, setAwayScore] = useState('')

  const homeTeam = teamsById.get(game.home_team_id)
  const awayTeam = teamsById.get(game.away_team_id)

  const sanitize = (value: string) => value.replace(/[^0-9]/g, '').slice(0, 2)

  return (
    <article className="match-card">
      <header className="match-card__meta">
        <span className="match-card__time">{gameTime(game) || 'TBD'}</span>
        {game.group ? <span className="match-card__group">Group {game.group}</span> : null}
      </header>

      <div className="match-card__body">
        <div className="team team--home">
          <TeamFlag team={homeTeam} name={game.home_team_name_en} />
          <span className="team__name">{game.home_team_name_en}</span>
        </div>

        <div className="prediction">
          <input
            className="score-box"
            inputMode="numeric"
            placeholder="-"
            aria-label={`${game.home_team_name_en} predicted score`}
            value={homeScore}
            onChange={(e) => setHomeScore(sanitize(e.target.value))}
          />
          <span className="prediction__sep">:</span>
          <input
            className="score-box"
            inputMode="numeric"
            placeholder="-"
            aria-label={`${game.away_team_name_en} predicted score`}
            value={awayScore}
            onChange={(e) => setAwayScore(sanitize(e.target.value))}
          />
        </div>

        <div className="team team--away">
          <TeamFlag team={awayTeam} name={game.away_team_name_en} />
          <span className="team__name">{game.away_team_name_en}</span>
        </div>
      </div>
    </article>
  )
}

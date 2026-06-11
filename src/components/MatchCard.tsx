import { useState } from 'react'
import type { Team } from '../types'
import type { MatchView } from '../utils/date'
import { formatLocalTime } from '../utils/timezone'

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

export default function MatchCard({ match, teamsById }: MatchCardProps) {
  const { game, instant, stadium } = match
  const [homeScore, setHomeScore] = useState('')
  const [awayScore, setAwayScore] = useState('')

  const homeTeam = teamsById.get(game.home_team_id)
  const awayTeam = teamsById.get(game.away_team_id)

  const sanitize = (value: string) => value.replace(/[^0-9]/g, '').slice(0, 2)

  const homeName = game.home_team_name_en || 'TBD'
  const awayName = game.away_team_name_en || 'TBD'
  const kickoff = instant ? formatLocalTime(instant) : 'TBD'
  const venue = stadium ? `${stadium.city_en}, ${stadium.country_en}` : null

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
          <span className="team__name">{homeName}</span>
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
          <TeamFlag team={awayTeam} name={awayName} />
          <span className="team__name">{awayName}</span>
        </div>
      </div>
    </article>
  )
}

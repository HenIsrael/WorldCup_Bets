import { useState } from 'react'
import type { Team } from '../types'
import type { MatchView } from '../utils/date'
import { formatLocalTime } from '../utils/timezone'

interface FinishedGamesListProps {
  matches: MatchView[]
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

function formatDate(instant: Date | null): string {
  if (!instant) return 'Date unknown'
  return instant.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function FinishedGamesList({ matches, teamsById }: FinishedGamesListProps) {
  if (matches.length === 0) {
    return (
      <div className="state state--empty">
        <p>No finished games yet.</p>
        <p className="state__detail">Scores will appear here once matches are played.</p>
      </div>
    )
  }

  return (
    <div className="finished-games">
      {matches.map(({ game, instant, stadium }) => {
        const homeTeam = teamsById.get(game.home_team_id)
        const awayTeam = teamsById.get(game.away_team_id)
        const homeName = game.home_team_name_en || game.home_team_label || 'TBD'
        const awayName = game.away_team_name_en || game.away_team_label || 'TBD'
        const home = game.home_score === '' ? '-' : game.home_score
        const away = game.away_score === '' ? '-' : game.away_score
        const homeNum = Number(game.home_score)
        const awayNum = Number(game.away_score)
        const hasScores = game.home_score !== '' && game.away_score !== ''
        const homeWon = hasScores && homeNum > awayNum
        const awayWon = hasScores && awayNum > homeNum
        const venue = stadium ? `${stadium.city_en}, ${stadium.country_en}` : null

        return (
          <article className="finished-card" key={game.id}>
            <header className="finished-card__meta">
              <span className="finished-card__date">
                {formatDate(instant)}
                {instant ? ` · ${formatLocalTime(instant)}` : ''}
              </span>
              {game.group ? (
                <span className="finished-card__group">Group {game.group}</span>
              ) : null}
              {venue ? <span className="finished-card__venue">{venue}</span> : null}
            </header>

            <div className="finished-card__body">
              <div className={`finished-team finished-team--home${homeWon ? ' finished-team--winner' : ''}`}>
                <TeamFlag team={homeTeam} name={homeName} />
                <span className="finished-team__name">{homeName}</span>
              </div>

              <div className="finished-score">
                <span className={`finished-score__num${homeWon ? ' finished-score__num--winner' : ''}`}>
                  {home}
                </span>
                <span className="finished-score__sep">:</span>
                <span className={`finished-score__num${awayWon ? ' finished-score__num--winner' : ''}`}>
                  {away}
                </span>
              </div>

              <div className={`finished-team finished-team--away${awayWon ? ' finished-team--winner' : ''}`}>
                <span className="finished-team__name">{awayName}</span>
                <TeamFlag team={awayTeam} name={awayName} />
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}

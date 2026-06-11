import type { Team } from '../types'
import type { DayGroup } from '../utils/date'
import MatchCard from './MatchCard'

interface AllGamesListProps {
  groups: DayGroup[]
  teamsById: Map<string, Team>
  todayKey: string
}

function prettyDay(group: DayGroup, todayKey: string): string {
  if (group.dayKey === 'unknown') return 'Date unknown'
  if (group.dayKey === todayKey) return 'Today'

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowKey = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`
  if (group.dayKey === tomorrowKey) return 'Tomorrow'

  return group.representativeDate.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

export default function AllGamesList({ groups, teamsById, todayKey }: AllGamesListProps) {
  const otherGroups = groups.filter((g) => g.dayKey !== todayKey)
  return (
    <div className="all-games">
      {otherGroups.map((group) => (
        <section key={group.dayKey} className="day-group">
          <div className="day-group__header">
            <h2
              className={`day-group__title${group.dayKey === todayKey ? ' day-group__title--today' : ''}`}
            >
              {prettyDay(group, todayKey)}
            </h2>
            <span className="day-group__count">
              {group.matches.length} match{group.matches.length !== 1 ? 'es' : ''}
            </span>
          </div>
          <div className="match-list">
            {group.matches.map((match) => (
              <MatchCard key={match.game.id} match={match} teamsById={teamsById} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

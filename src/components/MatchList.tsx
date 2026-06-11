import type { Team } from '../types'
import type { MatchView } from '../utils/date'
import MatchCard from './MatchCard'

interface MatchListProps {
  matches: MatchView[]
  teamsById: Map<string, Team>
}

export default function MatchList({ matches, teamsById }: MatchListProps) {
  return (
    <div className="match-list">
      {matches.map((match) => (
        <MatchCard key={match.game.id} match={match} teamsById={teamsById} />
      ))}
    </div>
  )
}

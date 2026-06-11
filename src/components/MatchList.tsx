import type { Game, Team } from '../types'
import MatchCard from './MatchCard'

interface MatchListProps {
  games: Game[]
  teamsById: Map<string, Team>
}

export default function MatchList({ games, teamsById }: MatchListProps) {
  return (
    <div className="match-list">
      {games.map((game) => (
        <MatchCard key={game.id} game={game} teamsById={teamsById} />
      ))}
    </div>
  )
}

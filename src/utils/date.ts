import type { Game, Stadium } from '../types'
import { matchInstant, stadiumTimeZone } from './timezone'

/** Returns a date's day key as "YYYY-MM-DD" in the user's local time zone. */
export function localDayKey(date: Date = new Date()): string {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

/** Today's day key in the user's local time zone. */
export function todayKey(): string {
  return localDayKey()
}

export interface MatchView {
  game: Game
  /** Kickoff as a UTC instant (null if local_date couldn't be parsed). */
  instant: Date | null
  /** IANA time zone of the stadium used for the conversion. */
  timeZone: string
  stadium?: Stadium
}

/**
 * Builds match views for all games, resolving each game's stadium time zone and
 * kickoff instant. Stadiums are looked up by id for venue display.
 */
export function toMatchViews(
  games: Game[],
  stadiumsById: Map<string, Stadium>,
): MatchView[] {
  return games.map((game) => {
    const timeZone = stadiumTimeZone(game.stadium_id) ?? 'UTC'
    return {
      game,
      timeZone,
      instant: matchInstant(game, timeZone),
      stadium: stadiumsById.get(game.stadium_id),
    }
  })
}

/**
 * Filters match views to those whose kickoff falls on the given day in the
 * user's local time zone, sorted by kickoff time.
 */
export function matchesForDay(
  views: MatchView[],
  dayKey: string = todayKey(),
): MatchView[] {
  return views
    .filter((v) => v.instant !== null && localDayKey(v.instant) === dayKey)
    .sort((a, b) => a.instant!.getTime() - b.instant!.getTime())
}

export interface DayGroup {
  /** "YYYY-MM-DD" day key in the user's local time zone. */
  dayKey: string
  /** The kickoff instant of the first match, used for display formatting. */
  representativeDate: Date
  matches: MatchView[]
}

/**
 * Groups all match views by their local day (user timezone), sorted
 * chronologically. Matches without a parseable instant are placed last.
 */
export function groupByDay(views: MatchView[]): DayGroup[] {
  const map = new Map<string, MatchView[]>()
  const withoutInstant: MatchView[] = []

  for (const v of views) {
    if (!v.instant) {
      withoutInstant.push(v)
      continue
    }
    const key = localDayKey(v.instant)
    const group = map.get(key)
    if (group) group.push(v)
    else map.set(key, [v])
  }

  const groups: DayGroup[] = Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dayKey, matches]) => ({
      dayKey,
      representativeDate: matches[0].instant!,
      matches: matches.sort((a, b) => a.instant!.getTime() - b.instant!.getTime()),
    }))

  if (withoutInstant.length > 0) {
    groups.push({
      dayKey: 'unknown',
      representativeDate: new Date(0),
      matches: withoutInstant,
    })
  }

  return groups
}

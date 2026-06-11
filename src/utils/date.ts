import type { Game } from '../types'

/** Returns today's date as "MM/DD/YYYY" to match the API's local_date prefix. */
export function todayKey(date: Date = new Date()): string {
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const yyyy = date.getFullYear()
  return `${mm}/${dd}/${yyyy}`
}

/** Extracts the "MM/DD/YYYY" date portion from a game's local_date. */
export function gameDateKey(game: Game): string {
  return (game.local_date ?? '').split(' ')[0] ?? ''
}

/** Extracts the "HH:MM" time portion from a game's local_date. */
export function gameTime(game: Game): string {
  return (game.local_date ?? '').split(' ')[1] ?? ''
}

/** Filters games to those on the given day and sorts them by kickoff time. */
export function gamesForDay(games: Game[], dayKey: string = todayKey()): Game[] {
  return games
    .filter((g) => gameDateKey(g) === dayKey)
    .sort((a, b) => gameTime(a).localeCompare(gameTime(b)))
}

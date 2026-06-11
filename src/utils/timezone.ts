import type { Game } from '../types'

/**
 * IANA time zone for each FIFA World Cup 2026 host stadium, keyed by stadium id.
 * The API's `local_date` is the stadium's local (venue) wall-clock time, so we
 * use these zones to convert that time into the user's own time zone.
 */
export const STADIUM_TIME_ZONES: Record<string, string> = {
  '1': 'America/Mexico_City', // Mexico City - Estadio Azteca
  '2': 'America/Mexico_City', // Guadalajara (Zapopan) - Estadio Akron
  '3': 'America/Monterrey', // Monterrey (Guadalupe) - Estadio BBVA
  '4': 'America/Chicago', // Dallas (Arlington, Texas)
  '5': 'America/Chicago', // Houston
  '6': 'America/Chicago', // Kansas City
  '7': 'America/New_York', // Atlanta
  '8': 'America/New_York', // Miami (Miami Gardens)
  '9': 'America/New_York', // Boston (Foxborough)
  '10': 'America/New_York', // Philadelphia
  '11': 'America/New_York', // New York/New Jersey (East Rutherford)
  '12': 'America/Toronto', // Toronto
  '13': 'America/Vancouver', // Vancouver
  '14': 'America/Los_Angeles', // Seattle
  '15': 'America/Los_Angeles', // San Francisco Bay Area (Santa Clara)
  '16': 'America/Los_Angeles', // Los Angeles (Inglewood)
}

export function stadiumTimeZone(stadiumId: string | undefined): string | undefined {
  if (!stadiumId) return undefined
  return STADIUM_TIME_ZONES[stadiumId]
}

interface WallClock {
  year: number
  month: number
  day: number
  hour: number
  minute: number
}

/** Parses the API's "MM/DD/YYYY HH:MM" local_date into wall-clock components. */
function parseLocalDate(value: string): WallClock | null {
  if (!value) return null
  const [datePart, timePart = '00:00'] = value.trim().split(' ')
  const [mm, dd, yyyy] = datePart.split('/').map(Number)
  const [hh, min] = timePart.split(':').map(Number)
  if ([mm, dd, yyyy, hh, min].some((n) => Number.isNaN(n))) return null
  return { year: yyyy, month: mm, day: dd, hour: hh, minute: min }
}

/** Offset (ms) between the given instant's wall time in `timeZone` and UTC. */
function tzOffsetMs(date: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  const parts = dtf.formatToParts(date)
  const map: Record<string, string> = {}
  for (const p of parts) {
    if (p.type !== 'literal') map[p.type] = p.value
  }
  let hour = Number(map.hour)
  if (hour === 24) hour = 0
  const asUTC = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    hour,
    Number(map.minute),
    Number(map.second),
  )
  return asUTC - date.getTime()
}

/** Converts a wall-clock time in `timeZone` to the matching UTC instant (DST-aware). */
function zonedTimeToUtc(wc: WallClock, timeZone: string): Date {
  const guess = Date.UTC(wc.year, wc.month - 1, wc.day, wc.hour, wc.minute, 0)
  let offset = tzOffsetMs(new Date(guess), timeZone)
  // Refine once to handle instants near DST transitions.
  offset = tzOffsetMs(new Date(guess - offset), timeZone)
  return new Date(guess - offset)
}

/** The UTC instant of a game's kickoff, interpreting local_date in the stadium's time zone. */
export function matchInstant(game: Game, timeZone: string | undefined): Date | null {
  const wc = parseLocalDate(game.local_date)
  if (!wc) return null
  return zonedTimeToUtc(wc, timeZone ?? 'UTC')
}

/** Formats an instant as a short time (HH:MM) in the user's local time zone. */
export function formatLocalTime(instant: Date): string {
  return instant.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

/** The user's resolved IANA time zone name (e.g. "Asia/Jerusalem"). */
export function userTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return ''
  }
}

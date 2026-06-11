import type {
  Game,
  GamesResponse,
  MatchPrediction,
  Stadium,
  StadiumsResponse,
  Team,
  TeamsResponse,
} from './types'

const BASE = '/api'
const BACKEND = '/backend'

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) {
    throw new Error(`Request to ${path} failed (${res.status})`)
  }
  return (await res.json()) as T
}

export async function getGames(): Promise<Game[]> {
  const data = await getJson<GamesResponse>('/get/games')
  return data.games ?? []
}

export async function getTeams(): Promise<Team[]> {
  const data = await getJson<TeamsResponse>('/get/teams')
  return data.teams ?? []
}

export async function getStadiums(): Promise<Stadium[]> {
  const data = await getJson<StadiumsResponse>('/get/stadiums')
  return data.stadiums ?? []
}

export async function getWinnerPrediction(gameId: string): Promise<MatchPrediction> {
  const res = await fetch(`${BACKEND}/predictions/${encodeURIComponent(gameId)}`, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) {
    if (res.status === 404) throw new Error('No prediction found for this game.')
    throw new Error(`Request failed (${res.status})`)
  }
  return (await res.json()) as MatchPrediction
}

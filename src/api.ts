import type { Game, GamesResponse, Team, TeamsResponse } from './types'

const BASE = '/api'

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

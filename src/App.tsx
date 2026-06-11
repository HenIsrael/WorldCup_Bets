import { useCallback, useEffect, useMemo, useState } from 'react'
import { getGames, getTeams } from './api'
import type { Game, Team } from './types'
import { gamesForDay, todayKey } from './utils/date'
import MatchList from './components/MatchList'
import './App.css'

type Status = 'loading' | 'ready' | 'error'

export default function App() {
  const [games, setGames] = useState<Game[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [status, setStatus] = useState<Status>('loading')
  const [error, setError] = useState<string>('')

  const load = useCallback(async () => {
    setStatus('loading')
    setError('')
    try {
      const [gamesData, teamsData] = await Promise.all([getGames(), getTeams()])
      setGames(gamesData)
      setTeams(teamsData)
      setStatus('ready')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const teamsById = useMemo(() => {
    const map = new Map<string, Team>()
    for (const team of teams) map.set(team.id, team)
    return map
  }, [teams])

  const today = todayKey()
  const todaysGames = useMemo(() => gamesForDay(games, today), [games, today])

  const prettyDate = useMemo(
    () =>
      new Date().toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    [],
  )

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__brand">
          <span className="app__logo" aria-hidden="true">⚽</span>
          <div>
            <h1 className="app__title">World Cup 2026 Predictions</h1>
            <p className="app__subtitle">Today&apos;s matches &middot; {prettyDate}</p>
          </div>
        </div>
      </header>

      <main className="app__main">
        {status === 'loading' && (
          <div className="state state--loading">
            <span className="spinner" aria-hidden="true" />
            <p>Loading today&apos;s matches…</p>
          </div>
        )}

        {status === 'error' && (
          <div className="state state--error">
            <p>Couldn&apos;t load matches.</p>
            <p className="state__detail">{error}</p>
            <button className="btn" onClick={() => void load()}>
              Try again
            </button>
          </div>
        )}

        {status === 'ready' && todaysGames.length === 0 && (
          <div className="state state--empty">
            <p>No matches scheduled today.</p>
            <p className="state__detail">Check back on a match day.</p>
          </div>
        )}

        {status === 'ready' && todaysGames.length > 0 && (
          <MatchList games={todaysGames} teamsById={teamsById} />
        )}
      </main>
    </div>
  )
}

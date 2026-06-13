import { useCallback, useEffect, useMemo, useState } from 'react'
import { getGames, getStadiums, getTeams } from './api'
import type { Game, Stadium, Team } from './types'
import { groupByDay, matchesForDay, toMatchViews, todayKey } from './utils/date'
import { userTimeZone } from './utils/timezone'
import MatchList from './components/MatchList'
import AllGamesList from './components/AllGamesList'
import FinishedGamesList from './components/FinishedGamesList'
import './App.css'

type Status = 'loading' | 'ready' | 'error'

export default function App() {
  const [games, setGames] = useState<Game[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [stadiums, setStadiums] = useState<Stadium[]>([])
  const [status, setStatus] = useState<Status>('loading')
  const [error, setError] = useState<string>('')

  const load = useCallback(async () => {
    setStatus('loading')
    setError('')
    try {
      const [gamesData, teamsData, stadiumsData] = await Promise.all([
        getGames(),
        getTeams(),
        getStadiums(),
      ])
      setGames(gamesData)
      setTeams(teamsData)
      setStadiums(stadiumsData)
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

  const stadiumsById = useMemo(() => {
    const map = new Map<string, Stadium>()
    for (const stadium of stadiums) map.set(stadium.id, stadium)
    return map
  }, [stadiums])

  const today = todayKey()
  const todaysMatches = useMemo(
    () =>
      matchesForDay(toMatchViews(games, stadiumsById), today).filter(
        (v) => v.game.finished !== 'TRUE',
      ),
    [games, stadiumsById, today],
  )

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

  const allMatchViews = useMemo(
    () => toMatchViews(games, stadiumsById),
    [games, stadiumsById],
  )

  const upcomingMatchViews = useMemo(
    () => allMatchViews.filter((v) => v.game.finished !== 'TRUE'),
    [allMatchViews],
  )

  const allGroups = useMemo(() => groupByDay(upcomingMatchViews), [upcomingMatchViews])

  const finishedMatches = useMemo(
    () =>
      allMatchViews
        .filter((v) => v.game.finished === 'TRUE')
        .sort((a, b) => {
          const at = a.instant?.getTime() ?? -Infinity
          const bt = b.instant?.getTime() ?? -Infinity
          return bt - at
        }),
    [allMatchViews],
  )

  const [showAll, setShowAll] = useState(false)
  const [showFinished, setShowFinished] = useState(false)

  const tzName = useMemo(() => userTimeZone(), [])

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__brand">
          <span className="app__logo" aria-hidden="true">⚽</span>
          <div>
            <h1 className="app__title">World Cup 2026 Predictions</h1>
            <p className="app__subtitle">Today&apos;s matches &middot; {prettyDate}</p>
            {tzName ? (
              <p className="app__tz">Kickoff times shown in your local time ({tzName})</p>
            ) : null}
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

        {status === 'ready' && todaysMatches.length === 0 && (
          <div className="state state--empty">
            <p>No matches scheduled today.</p>
            <p className="state__detail">Check back on a match day.</p>
          </div>
        )}

        {status === 'ready' && todaysMatches.length > 0 && (
          <MatchList matches={todaysMatches} teamsById={teamsById} />
        )}

        {status === 'ready' && (
          <div className="all-games-toggle">
            <button
              className="btn btn--outline"
              onClick={() => setShowAll((v) => !v)}
              aria-expanded={showAll}
            >
              {showAll ? '▲ Hide all games' : '▼ Show all games'}
            </button>
            <button
              className="btn btn--outline"
              onClick={() => setShowFinished((v) => !v)}
              aria-expanded={showFinished}
            >
              {showFinished ? '▲ Hide finished' : '🏁 Finished'}
            </button>
          </div>
        )}

        {status === 'ready' && showAll && (
          <AllGamesList groups={allGroups} teamsById={teamsById} todayKey={today} />
        )}

        {status === 'ready' && showFinished && (
          <FinishedGamesList matches={finishedMatches} teamsById={teamsById} />
        )}
      </main>
    </div>
  )
}

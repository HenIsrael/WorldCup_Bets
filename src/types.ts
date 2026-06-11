export interface Team {
  _id: string
  id: string
  name_en: string
  name_fa: string
  flag: string
  fifa_code: string
  iso2: string
  groups: string
}

export interface Game {
  _id: string
  id: string
  home_team_id: string
  away_team_id: string
  home_score: string
  away_score: string
  group: string
  matchday: string
  /** Format: "MM/DD/YYYY HH:MM" */
  local_date: string
  persian_date: string
  stadium_id: string
  finished: string
  time_elapsed: string
  type: string
  home_team_name_en: string
  home_team_name_fa: string
  away_team_name_en: string
  away_team_name_fa: string
}

export interface GamesResponse {
  games: Game[]
}

export interface TeamsResponse {
  teams: Team[]
}

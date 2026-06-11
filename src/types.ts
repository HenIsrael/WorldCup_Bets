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
  /** Knockout-stage placeholder, e.g. "Winner Group A" */
  home_team_label?: string
  /** Knockout-stage placeholder, e.g. "Runner-up Group B" */
  away_team_label?: string
}

export interface Stadium {
  _id: string
  id: string
  name_en: string
  name_fa: string
  fifa_name: string
  city_en: string
  city_fa: string
  country_en: string
  country_fa: string
  capacity: number
  region: string
}

export interface GamesResponse {
  games: Game[]
}

export interface TeamsResponse {
  teams: Team[]
}

export interface StadiumsResponse {
  stadiums: Stadium[]
}

export interface MatchPrediction {
  home_win: number
  draw: number
  away_win: number
  goals_0_1: number
  goals_2_3: number
  goals_4_plus: number
  over_2_5: number
  under_2_5: number
  updated_at: string
}

# World Cup 2026 Predictions (Stage 1 - UI)

A React + TypeScript (Vite) app that shows **today's** FIFA World Cup 2026 matches and lets you type a predicted score for each game.

Data comes from the free [worldcup26.ir API](https://worldcup26.ir/api-docs/).

## Features (this stage)

- Loads all games and teams on startup.
- Filters to matches scheduled for the current date.
- Each match card shows both teams (name + flag) and two score boxes (home / away).
- Loading, error (with retry), and empty states.

> Predictions are kept in local component state only and are **not** submitted or stored yet. Saving, auth, and scoring come in later stages.

## Getting started

```bash
npm install
npm run dev
```

Then open the URL Vite prints (default http://localhost:5173).

## How the API is called

To avoid CORS issues in development, requests go through a Vite dev proxy: the app calls `/api/...` and Vite forwards it to `https://worldcup26.ir/...` (see [vite.config.ts](vite.config.ts)).

Endpoints used:

- `GET /get/games` - all games (filtered client-side by today's date)
- `GET /get/teams` - team metadata, used to map team IDs to flag images

## Project structure

```
src/
  api.ts                 # fetch helpers (getGames, getTeams)
  types.ts               # Game / Team interfaces
  utils/date.ts          # today's date key + day filtering/sorting
  components/
    MatchList.tsx        # renders the list of match cards
    MatchCard.tsx        # one match: teams, flags, score inputs
  App.tsx                # data loading + page states
```

## Build

```bash
npm run build
npm run preview
```

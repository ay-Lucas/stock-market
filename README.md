<div align="center">

# Stock‑Matic

Type‑safe stock analytics dashboard with Next.js + Express and shared types. View quotes and historical prices, screen symbols, and visualize data with interactive charts.

</div>

## Features

- End‑to‑end types: shared TypeScript models across frontend and backend
- Rich data: quotes, OHLCV, dividends, earnings, financials, news, recommendations, trending, screeners, options, search
- Provider strategy: Yahoo Finance primary for historical daily; Polygon/Finnhub integrated with fallback for reliability
- Interactive charts: Lightweight‑Charts with responsive layout and interval switching
- Safer APIs: robust validation of dates, intervals, and parameters

## Tech Stack

- Next.js 15 (App Router), React 19, Tailwind CSS
- Node.js + Express, yahoo‑finance2, Polygon.io, Finnhub
- TypeScript, ESLint; path aliases; monorepo with shared types

## Repository Structure

```
.
├── backend/    # Express API and providers
├── frontend/   # Next.js app (UI & charts)
└── shared/     # Shared TypeScript types
```

## Quick Start (Local)

Prerequisites: Node 18+

1) Start the backend (port 4000)

```bash
cd backend
npm install
echo "PORT=4000" > .env   # optional; defaults to 3000
npm run dev
```

2) Start the frontend (port 3000)

```bash
cd frontend
npm install
npm run dev
# open http://localhost:3000
```

Notes

- In dev, Next.js proxies `/api/*` → `http://localhost:4000/api/*`.
- Server‑side fetches default to `http://localhost:4000`; override with `NEXT_PUBLIC_API_BASE` if needed.

## Environment Variables

Backend (`backend/.env`)

- `PORT` – optional
- `POLYGON_API_KEY` – optional (required for Polygon intraday/higher‑granularity)
- `FINNHUB_API_KEY` – optional
- `NODE_ENV` – `development` | `production`

Frontend (`frontend/.env.local`)

- `BACKEND_URL` – production backend base URL (e.g., `https://your-backend.vercel.app`)
- `NEXT_PUBLIC_API_BASE` – same as above; used by SSR fetches

Example (`frontend/.env.example`)

```
BACKEND_URL=http://localhost:4000
NEXT_PUBLIC_API_BASE=http://localhost:4000
```

## API Overview

Base path: `/api/stocks`

- `GET /:symbol/quote` – current quote (Polygon → Yahoo fallback)
- `GET /:symbol/historical?from&to&interval[&multiplier]` – OHLCV
  - Yahoo: `1d, 5d, 1wk, 1mo, 3mo, 60m, 1h`
  - Polygon: `second, minute, hour, day, week, month, quarter, year` (+ `multiplier`)
- `GET /:symbol/dividends?from&to`
- `GET /:symbol/news`
- `GET /:symbol/earnings`
- `GET /:symbol/financials`
- `GET /:symbol/recommendations`
- `GET /:symbol/insights`
- `GET /trending?iso2&count`
- `GET /dailyGainers?count`
- `GET /screener?scrId&count`
- `GET /search?q`

Example

```bash
curl "http://localhost:4000/api/stocks/AAPL/historical?from=2024-01-01&to=2024-06-30&interval=1d"
```

## Frontend UX

- Root page provides ticker search with suggestions; selecting a ticker updates the chart.
- Historical data defaults to Yahoo daily (`1d`) and renders as `YYYY‑MM‑DD` for clarity.

## Deploy

### Recommended: Vercel (Frontend) + Vercel Serverless (Backend)

Backend (project root: `backend`)

- No custom build step required; the Express app is exported and handled by `backend/api/index.ts`.
- Env vars: set required keys (`POLYGON_API_KEY`, `FINNHUB_API_KEY`) and `NODE_ENV=production`.
- Endpoints: `https://<your-backend>.vercel.app/api/...`

Frontend (project root: `frontend`)

- Env vars:
  - `BACKEND_URL=https://<your-backend>.vercel.app`
  - `NEXT_PUBLIC_API_BASE=https://<your-backend>.vercel.app`
- `next.config.ts` enables `experimental.externalDir` and rewrites `/api/*` → `${BACKEND_URL}/api/*`.

### Alternative: Other Hosts for Backend

- Render/Railway/Fly/VMs are supported. For sleeping free tiers, expect cold starts (use keep‑warm pings or a paid plan).

## Development Tips

- Path aliases: `@/*` → `frontend/src/*`, `@shared/*` → `shared/*`
- Linting: CI treats ESLint errors as build failures; remove unused imports/vars.
- Timezones: Use Yahoo daily + ISO dates to avoid off‑by‑one issues.
- Intraday: Prefer Polygon with `interval` + `multiplier` and set `POLYGON_API_KEY`.

## Troubleshooting

- SSR fetch error “Failed to parse URL … /api/…”: ensure `NEXT_PUBLIC_API_BASE` is set in prod, or rely on absolute base in SSR path.
- Next build error about imports outside project: `experimental.externalDir = true` is enabled in `frontend/next.config.ts`.
- Missing yahoo‑finance2 types in frontend: shared types avoid deep imports; ensure you’re importing from `shared/types`.

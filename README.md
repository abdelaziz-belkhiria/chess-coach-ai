# Chess Coach AI

An AI-powered chess improvement tool. Enter any Chess.com username, and the app automatically imports games, analyzes them with Stockfish, generates plain-English coaching explanations via AI, and tracks recurring weaknesses across game history.

## Goal
Most analysis tools look at one game at a time. This project focuses on the layer above that: tracking patterns and mistakes **across many games over time**, and turning that into a personalized coaching report — recurring tactical blind spots, weak openings, time-pressure blunders, etc.

Built as a learning project (APIs, backend logic, prompt engineering, full-stack app architecture), with a long-term goal of polishing it into a sellable product.

Designed to be general-purpose: any user can enter their own Chess.com username, not tied to one specific account.

## Status: Version 1 — In Progress

### Done
- [x] Project scaffolded (Python venv, Node.js confirmed working)
- [x] Chess.com public API connected — successfully fetching games for a test username
- [x] `fetch_games.py` — pulls monthly archives and game list (PGN, ratings, opening, result, etc.)
- [x] Git repo initialized

### In Progress
- [ ] Refactor `fetch_games.py` to accept username as input/parameter instead of hardcoded
- [ ] Stockfish engine integration (`stockfish` python package) — downloading binary, writing test script
- [ ] Move-by-move analysis (centipawn loss per move)
- [ ] Move classification (Brilliant / Good / Inaccuracy / Mistake / Blunder)

### Not Started
- [ ] AI coaching layer (Claude API) — plain-English explanations of mistakes
- [ ] Store games + analysis in a database (SQLite to start)
- [ ] Cross-game pattern detection (recurring weaknesses, opening win rates, time-pressure blunders)
- [ ] Puzzle generator from own blunder positions
- [ ] React frontend (username input, game list, move-by-move viewer, dashboard)
- [ ] FastAPI backend wiring it all together

## Tech Stack
- **Backend:** Python, FastAPI
- **Chess engine:** Stockfish (local binary, free/open-source)
- **AI explanations:** Claude API
- **Chess data:** Chess.com public API (no auth required)
- **Database:** SQLite (to start), possibly Supabase later
- **Frontend:** React (not started yet)

## Environment
- OS: Windows
- Python 3.12, venv active
- Node.js v20.19.5
- Packages installed so far: `requests`, `fastapi`, `uvicorn`, `chess`, (`stockfish` pending)

## Project Structure
```
chess-coach/
├── venv/                  # python virtual env (gitignored)
├── engine/                # stockfish binary goes here (gitignored)
├── fetch_games.py         # pulls games from Chess.com API (any username)
├── test_stockfish.py      # stockfish integration test (next step)
└── README.md
```

## Notes for future me / future Claude session
- The app should work for ANY Chess.com username entered by the user — not hardcoded to one account. Currently `fetch_games.py` has a hardcoded test username; this needs refactoring to accept input.
- Chess.com API requires a `User-Agent` header or requests can get blocked.
- Decided NOT to use ML/model training for v1 — this is an "AI-powered app" (gluing together Stockfish + Claude API + good architecture), not a from-scratch ML project. ML-based pattern clustering is a possible v2/v3 feature.
- Building solo. Building primarily to learn AI/automation/backend skills; selling it later is a possible long-term goal but not the current focus.
- Next immediate step when resuming: finish Stockfish setup, confirm a test script returns a best move + evaluation, then move to analyzing a full game move-by-move. After that, refactor the username to be a parameter, not hardcoded.

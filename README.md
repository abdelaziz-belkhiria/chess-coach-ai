# Chess Coach AI

A personal project to build an AI-powered chess improvement tool: import your Chess.com games automatically, analyze them with Stockfish, get plain-English coaching explanations via AI, and track recurring weaknesses across your game history.

## Goal
Not just a single-game analyzer (tools like Chessigma already do that for free). The point of this project is the layer those tools don't have yet: tracking patterns and mistakes **across many games over time**, and turning that into a personalized coaching report.

Built primarily as a learning project (APIs, backend logic, prompt engineering, full-stack app), with a long-term possibility of polishing it into a sellable product.

## Status: Version 1 — In Progress

### Done
- [x] Project scaffolded (Python venv, Node.js confirmed working)
- [x] Chess.com public API connected — successfully fetching games for username `sudokubectl`
- [x] `fetch_games.py` — pulls monthly archives and game list (PGN, ratings, opening, result, etc.)

### In Progress
- [ ] Stockfish engine integration (`stockfish` python package) — downloading binary, writing test script
- [ ] Move-by-move analysis (centipawn loss per move)
- [ ] Move classification (Brilliant / Good / Inaccuracy / Mistake / Blunder)

### Not Started
- [ ] AI coaching layer (Claude API) — plain-English explanations of mistakes
- [ ] Store games + analysis in a database (SQLite to start)
- [ ] Cross-game pattern detection (recurring weaknesses, opening win rates, time-pressure blunders)
- [ ] Puzzle generator from own blunder positions
- [ ] React frontend (game list, move-by-move viewer, dashboard)
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
├── fetch_games.py         # pulls games from Chess.com API
├── test_stockfish.py      # stockfish integration test (next step)
└── README.md
```

## Notes for future me / future Claude session
- Chess.com username being used for testing: `sudokubectl`
- Chess.com API requires a `User-Agent` header or requests can get blocked
- Decided NOT to use ML/model training for v1 — this is an "AI-powered app" (gluing together Stockfish + Claude API + good architecture), not a from-scratch ML project. ML-based pattern clustering is a possible v2/v3 feature.
- Next immediate step when resuming: finish Stockfish setup, confirm `test_stockfish.py` returns a best move + evaluation, then move to analyzing a full game move-by-move.

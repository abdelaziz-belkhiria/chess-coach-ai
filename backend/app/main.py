from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session
import uvicorn
import logging

from .db import database, models
from .schemas import game_schema
from .services import import_service, analysis_service, weakness_service
from .clients import chesscom_client

from fastapi.middleware.cors import CORSMiddleware

# Create database tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Chess Coach AI Backend")

# Configure CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.post("/players/{username}/import-latest", response_model=game_schema.ImportGamesResponse)
async def import_latest(username: str, db: Session = Depends(database.get_db)):
    """Fetch latest games from Chess.com and import them into the DB."""
    try:
        result = import_service.import_latest_games(db, username)
        return result
    except Exception as e:
        logger.error(f"Error importing games for {username}: {e}")
        raise HTTPException(status_code=500, detail="Failed to import games from Chess.com")

@app.get("/players/{username}/games", response_model=list[game_schema.GameResponse])
async def get_player_games(username: str, db: Session = Depends(database.get_db)):
    """List all games stored in the database for a given player."""
    games = analysis_service.list_player_games(db, username)
    return games

@app.get("/games/{game_id}", response_model=game_schema.GameResponse)
async def get_game(game_id: int, db: Session = Depends(database.get_db)):
    """Get details of a specific game by its ID."""
    game = analysis_service.get_game_by_id(db, game_id)
    if not game:
        raise HTTPException(status_code=404, detail=f"Game with ID {game_id} not found")
    return game

@app.post("/games/{game_id}/analyze", response_model=game_schema.AnalyzeGameResponse)
async def analyze_stored_game(game_id: int, db: Session = Depends(database.get_db)):
    """Analyze a stored game with Stockfish and save results."""
    try:
        result = analysis_service.analyze_game(db, game_id)
        return result
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error during analysis of game {game_id}: {e}")
        raise HTTPException(status_code=500, detail="An error occurred during game analysis.")

@app.get("/games/{game_id}/analysis", response_model=list[game_schema.MoveAnalysisResponse])
async def get_game_analysis(game_id: int, db: Session = Depends(database.get_db)):
    """Retrieve the move-by-move analysis results for a analyzed game."""
    analysis = analysis_service.get_game_analysis(db, game_id)
    if not analysis:
        # Check if game exists but just isn't analyzed
        game = analysis_service.get_game_by_id(db, game_id)
        if not game:
            raise HTTPException(status_code=404, detail=f"Game with ID {game_id} not found")
        return []
    return analysis

@app.get("/games/{game_id}/review", response_model=game_schema.GameReviewResponse)
async def get_game_review(game_id: int, review_as: str = "both", db: Session = Depends(database.get_db)):
    """Get a comprehensive frontend-friendly review of a game (Accuracy, counts, graph)."""
    try:
        result = analysis_service.get_game_review(db, game_id)
        return result
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error during game review for game {game_id}: {e}")
        raise HTTPException(status_code=500, detail="An error occurred during game review.")

@app.get("/players/{username}/weaknesses", response_model=game_schema.WeaknessSummaryResponse)
async def get_player_weaknesses(username: str, db: Session = Depends(database.get_db)):
    """Analyze player's historical games to detect performance weaknesses."""
    try:
        result = weakness_service.get_player_weaknesses(db, username)
        return result
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error calculating weaknesses for {username}: {e}")
        raise HTTPException(status_code=500, detail="Failed to calculate player weaknesses.")

@app.post("/players/{username}/analyze-games", response_model=game_schema.AnalyzePlayerGamesResponse)
async def analyze_player_games(username: str, limit: int = 5, db: Session = Depends(database.get_db)):
    """Analyze multiple unanalyzed games for a player (Batch process)."""
    try:
        result = analysis_service.analyze_player_games(db, username, limit)
        return result
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error during batch analysis for {username}: {e}")
        raise HTTPException(status_code=500, detail="An error occurred during batch analysis.")

# Legacy/Helper endpoint from previous step (optional to keep, but user asked to keep it or implied it)
@app.get("/players/{username}/latest-games-raw")
async def get_latest_games_raw(username: str):
    """Directly fetch games from Chess.com without saving (Raw API view)."""
    games = chesscom_client.get_latest_games(username)
    if not games:
        archives = chesscom_client.get_archives(username)
        if not archives:
            raise HTTPException(status_code=404, detail="Player not found or no games available")
        return {"username": username, "games": []}
    return {"username": username, "count": len(games), "games": games}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)

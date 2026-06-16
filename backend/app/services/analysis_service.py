from sqlalchemy.orm import Session
from ..db import models
from ..engine import stockfish_analyzer
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)

def get_game_by_id(db: Session, game_id: int):
    """Retrieve a specific game by its database ID."""
    return db.query(models.Game).filter(models.Game.id == game_id).first()

def list_player_games(db: Session, username: str):
    """Retrieve all imported games for a specific player username."""
    player = db.query(models.Player).filter(models.Player.username == username.lower()).first()
    if not player:
        return []
    return db.query(models.Game).filter(models.Game.player_id == player.id).all()

def analyze_game(db: Session, game_id: int):
    """Analyze a game with Stockfish and store move evaluations in the DB."""
    game = get_game_by_id(db, game_id)
    if not game:
        raise HTTPException(status_code=404, detail=f"Game with ID {game_id} not found")

    if not game.pgn:
        raise HTTPException(status_code=400, detail="Game PGN is missing")

    # 1. Clear old analysis if it exists
    db.query(models.MoveAnalysis).filter(models.MoveAnalysis.game_id == game_id).delete()

    # 2. Perform analysis
    try:
        moves_data = stockfish_analyzer.analyze_pgn(game.pgn)
    except Exception as e:
        logger.error(f"Stockfish analysis failed for game {game_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis engine error: {str(e)}")

    # 3. Save to database and count classifications
    blunders = 0
    mistakes = 0
    inaccuracies = 0

    for move in moves_data:
        classification = move["classification"]
        if classification == "Blunder":
            blunders += 1
        elif classification == "Mistake":
            mistakes += 1
        elif classification == "Inaccuracy":
            inaccuracies += 1

        db_move = models.MoveAnalysis(
            game_id=game_id,
            move_number=move["move_number"],
            turn=move["turn"],
            move_san=move["move_san"],
            fen_before=move["fen_before"],
            best_move=move["best_move"],
            evaluation_before=move["evaluation_before"],
            evaluation_after=move["evaluation_after"],
            points_lost=move["points_lost"],
            classification=classification
        )
        db.add(db_move)

    # 4. Mark game as analyzed
    game.analyzed = True
    db.commit()

    return {
        "game_id": game_id,
        "moves_analyzed": len(moves_data),
        "blunders": blunders,
        "mistakes": mistakes,
        "inaccuracies": inaccuracies
    }

def get_game_analysis(db: Session, game_id: int):
    """Retrieve stored move analyses for a game, ordered by sequence."""
    return db.query(models.MoveAnalysis).filter(
        models.MoveAnalysis.game_id == game_id
    ).order_by(
        models.MoveAnalysis.move_number,
        models.MoveAnalysis.turn.desc() # 'white' comes after 'black' alphabetically, but we want white first? 
                                        # Actually 'white' > 'black' is True. 
                                        # Let's check: move 1 white, move 1 black.
    ).all()

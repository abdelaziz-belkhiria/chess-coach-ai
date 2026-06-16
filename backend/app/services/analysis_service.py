from sqlalchemy.orm import Session
from ..db import models

def get_game_by_id(db: Session, game_id: int):
    """Retrieve a specific game by its database ID."""
    return db.query(models.Game).filter(models.Game.id == game_id).first()

def list_player_games(db: Session, username: str):
    """Retrieve all imported games for a specific player username."""
    # Find player first to get ID
    player = db.query(models.Player).filter(models.Player.username == username.lower()).first()
    if not player:
        return []
        
    return db.query(models.Game).filter(models.Game.player_id == player.id).all()

# Placeholder for next step
def analyze_game(db: Session, game_id: int):
    """Logic to analyze a game with Stockfish and store results."""
    pass

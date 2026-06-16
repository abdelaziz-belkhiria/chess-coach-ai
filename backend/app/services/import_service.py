from sqlalchemy.orm import Session
from datetime import datetime
from ..db import models
from ..clients import chesscom_client
import logging

logger = logging.getLogger(__name__)

def get_or_create_player(db: Session, username: str):
    """Get a player from database or create one if not exists."""
    db_player = db.query(models.Player).filter(models.Player.username == username.lower()).first()
    if not db_player:
        db_player = models.Player(username=username.lower())
        db.add(db_player)
        db.commit()
        db.refresh(db_player)
    return db_player

def import_latest_games(db: Session, username: str):
    """Fetch latest games from Chess.com and save to DB."""
    # 1. Ensure player exists
    player = get_or_create_player(db, username)
    
    # 2. Fetch games from Chess.com
    chesscom_games = chesscom_client.get_latest_games(username)
    
    imported_count = 0
    skipped_count = 0
    
    for game_data in chesscom_games:
        url = game_data.get("url")
        
        # Check if game already exists
        existing_game = db.query(models.Game).filter(models.Game.chesscom_url == url).first()
        if existing_game:
            skipped_count += 1
            continue
            
        # Extract fields
        pgn = game_data.get("pgn")
        white_username = game_data.get("white", {}).get("username")
        black_username = game_data.get("black", {}).get("username")
        result = f"{game_data.get('white', {}).get('result')} - {game_data.get('black', {}).get('result')}"
        time_control = game_data.get("time_control")
        
        # Convert timestamp to datetime
        end_time_ts = game_data.get("end_time")
        end_time = datetime.fromtimestamp(end_time_ts) if end_time_ts else None
        
        # Create game record
        new_game = models.Game(
            player_id=player.id,
            chesscom_url=url,
            pgn=pgn,
            white_username=white_username,
            black_username=black_username,
            result=result,
            time_control=time_control,
            end_time=end_time
        )
        
        db.add(new_game)
        imported_count += 1
        
    db.commit()
    
    return {
        "username": username,
        "imported": imported_count,
        "skipped": skipped_count,
        "total_seen": len(chesscom_games)
    }

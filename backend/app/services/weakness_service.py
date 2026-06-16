from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from ..db import models
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)

def get_player_weaknesses(db: Session, username: str):
    """Calculate weakness statistics for a player based on analyzed games."""
    # 1. Find player
    player = db.query(models.Player).filter(models.Player.username == username.lower()).first()
    if not player:
        raise HTTPException(status_code=404, detail=f"Player {username} not found")

    # 2. Get analyzed games for this player
    # A game is "analyzed" if the analyzed flag is True.
    # The player must be either the white or black player.
    analyzed_games = db.query(models.Game).filter(
        and_(
            models.Game.player_id == player.id,
            models.Game.analyzed == True
        )
    ).all()

    game_ids = [g.id for g in analyzed_games]

    if not analyzed_games:
        return {
            "username": username,
            "total_analyzed_games": 0,
            "total_moves_analyzed": 0,
            "total_blunders": 0,
            "total_mistakes": 0,
            "total_inaccuracies": 0,
            "average_points_lost": 0.0,
            "phase_weakness": {"opening": 0, "middlegame": 0, "endgame": 0},
            "color_weakness": {"white": 0, "black": 0},
            "main_weakness": "No clear weakness detected yet.",
            "critical_mistakes": [],
            "message": "No analyzed games yet. Analyze games first."
        }

    # 3. Get all MoveAnalysis rows for moves made BY this player across all analyzed games
    # We need to check the Game record to see if the player was White or Black for that move.
    
    player_moves = []
    
    # Efficiently fetch moves: Join MoveAnalysis with Game
    query = db.query(models.MoveAnalysis, models.Game).join(
        models.Game, models.MoveAnalysis.game_id == models.Game.id
    ).filter(
        models.MoveAnalysis.game_id.in_(game_ids)
    ).filter(
        or_(
            and_(models.Game.white_username.ilike(username), models.MoveAnalysis.turn == 'white'),
            and_(models.Game.black_username.ilike(username), models.MoveAnalysis.turn == 'black')
        )
    )
    
    results = query.all()
    
    total_moves = len(results)
    blunders = 0
    mistakes = 0
    inaccuracies = 0
    total_points_lost = 0.0
    
    phase_counts = {"opening": 0, "middlegame": 0, "endgame": 0}
    color_counts = {"white": 0, "black": 0}
    
    bad_classifications = ["Blunder", "Mistake", "Inaccuracy"]
    
    for move, game in results:
        total_points_lost += move.points_lost
        
        is_bad = move.classification in bad_classifications
        
        if move.classification == "Blunder":
            blunders += 1
        elif move.classification == "Mistake":
            mistakes += 1
        elif move.classification == "Inaccuracy":
            inaccuracies += 1
            
        # Phase Detection
        if move.move_number <= 10:
            phase = "opening"
        elif move.move_number <= 30:
            phase = "middlegame"
        else:
            phase = "endgame"
            
        if is_bad:
            phase_counts[phase] += 1
            color_counts[move.turn] += 1
            
    avg_points_lost = total_points_lost / total_moves if total_moves > 0 else 0.0
    
    # 4. Critical Mistakes (Top 10 by points_lost)
    # Sort results by points_lost descending
    sorted_moves = sorted(results, key=lambda x: x[0].points_lost, reverse=True)
    critical_mistakes = []
    for move, game in sorted_moves[:10]:
        critical_mistakes.append({
            "game_id": move.game_id,
            "move_number": move.move_number,
            "turn": move.turn,
            "move_san": move.move_san,
            "points_lost": move.points_lost,
            "classification": move.classification,
            "best_move": move.best_move,
            "fen_before": move.fen_before
        })

    # 5. Determine Main Weakness
    main_weakness = "No clear weakness detected yet."
    
    # Compare phases
    max_phase = max(phase_counts, key=phase_counts.get)
    if phase_counts[max_phase] > 0:
        main_weakness = f"You lose most points in the {max_phase}."
        
    # Check if color is a significantly bigger factor (e.g. 50% more bad moves on one side)
    white_bad = color_counts["white"]
    black_bad = color_counts["black"]
    
    if white_bad > black_bad * 1.5 and white_bad > 5:
        main_weakness = "You make significantly more bad moves as White."
    elif black_bad > white_bad * 1.5 and black_bad > 5:
        main_weakness = "You make significantly more bad moves as Black."

    return {
        "username": username,
        "total_analyzed_games": len(analyzed_games),
        "total_moves_analyzed": total_moves,
        "total_blunders": blunders,
        "total_mistakes": mistakes,
        "total_inaccuracies": inaccuracies,
        "average_points_lost": round(avg_points_lost, 3),
        "phase_weakness": phase_counts,
        "color_weakness": color_counts,
        "main_weakness": main_weakness,
        "critical_mistakes": critical_mistakes
    }

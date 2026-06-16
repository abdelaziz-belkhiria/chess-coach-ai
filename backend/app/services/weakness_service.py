from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from ..db import models
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)

def get_player_weaknesses(db: Session, username: str):
    """Calculate weakness statistics for a player using rates for better accuracy."""
    # 1. Find player
    player = db.query(models.Player).filter(models.Player.username == username.lower()).first()
    if not player:
        raise HTTPException(status_code=404, detail=f"Player {username} not found")

    # 2. Get analyzed games for this player
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
            "phase_bad_move_rate": {"opening": 0, "middlegame": 0, "endgame": 0},
            "color_bad_move_rate": {"white": 0, "black": 0},
            "main_weakness": "Not enough analyzed moves yet. Analyze more games first.",
            "critical_mistakes": [],
            "message": "No analyzed games yet. Analyze games first."
        }

    # 3. Get all MoveAnalysis rows for moves made BY this player
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
    
    # Raw counts of bad moves
    phase_bad_counts = {"opening": 0, "middlegame": 0, "endgame": 0}
    color_bad_counts = {"white": 0, "black": 0}
    
    # Total move counts per segment (for rates)
    phase_total_counts = {"opening": 0, "middlegame": 0, "endgame": 0}
    color_total_counts = {"white": 0, "black": 0}
    
    bad_classifications = ["Blunder", "Mistake", "Inaccuracy"]
    
    for move, game in results:
        total_points_lost += move.points_lost
        
        # Phase Detection
        if move.move_number <= 10:
            phase = "opening"
        elif move.move_number <= 30:
            phase = "middlegame"
        else:
            phase = "endgame"
            
        phase_total_counts[phase] += 1
        color_total_counts[move.turn] += 1
        
        if move.classification == "Blunder":
            blunders += 1
        elif move.classification == "Mistake":
            mistakes += 1
        elif move.classification == "Inaccuracy":
            inaccuracies += 1
            
        if move.classification in bad_classifications:
            phase_bad_counts[phase] += 1
            color_bad_counts[move.turn] += 1
            
    avg_points_lost = total_points_lost / total_moves if total_moves > 0 else 0.0
    
    # Calculate rates
    phase_rates = {
        k: (phase_bad_counts[k] / phase_total_counts[k]) if phase_total_counts[k] > 0 else 0.0 
        for k in phase_total_counts
    }
    color_rates = {
        k: (color_bad_counts[k] / color_total_counts[k]) if color_total_counts[k] > 0 else 0.0 
        for k in color_total_counts
    }
    
    # 4. Critical Mistakes
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

    # 5. Determine Main Weakness based on rates
    if total_moves < 20:
        main_weakness = "Not enough analyzed moves yet. Analyze more games first."
    else:
        # Check if color is the primary issue (significant rate difference)
        w_rate = color_rates["white"]
        b_rate = color_rates["black"]
        
        if b_rate > w_rate * 1.3:
            main_weakness = "You make bad moves more often as Black."
        elif w_rate > b_rate * 1.3:
            main_weakness = "You make bad moves more often as White."
        else:
            # Otherwise, use highest phase rate
            max_phase = max(phase_rates, key=phase_rates.get)
            if phase_rates[max_phase] > 0:
                main_weakness = f"Your highest bad move rate is in the {max_phase}."
            else:
                main_weakness = "No clear weakness detected yet."

    return {
        "username": username,
        "total_analyzed_games": len(analyzed_games),
        "total_moves_analyzed": total_moves,
        "total_blunders": blunders,
        "total_mistakes": mistakes,
        "total_inaccuracies": inaccuracies,
        "average_points_lost": round(avg_points_lost, 3),
        "phase_weakness": phase_bad_counts,
        "color_weakness": color_bad_counts,
        "phase_bad_move_rate": {k: round(v, 3) for k, v in phase_rates.items()},
        "color_bad_move_rate": {k: round(v, 3) for k, v in color_rates.items()},
        "main_weakness": main_weakness,
        "critical_mistakes": critical_mistakes
    }

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
    # Find player with platform support
    player = db.query(models.Player).filter(models.Player.username == username.lower()).first()
    if not player:
        return []
    return db.query(models.Game).filter(models.Game.player_id == player.id).all()

def analyze_player_games(db: Session, username: str, limit: int = 5):
    """Analyze multiple unanalyzed games for a specific player."""
    player = db.query(models.Player).filter(models.Player.username.ilike(username)).first()
    if not player:
        raise HTTPException(status_code=404, detail=f"Player {username} not found")

    # Get unanalyzed games
    unanalyzed_games = db.query(models.Game).filter(
        models.Game.player_id == player.id,
        models.Game.analyzed == False
    ).order_by(models.Game.imported_at.desc()).all()

    if not unanalyzed_games:
        return {
            "username": username,
            "requested_limit": limit,
            "games_analyzed": 0,
            "games_remaining": 0,
            "total_moves_analyzed": 0,
            "total_blunders": 0,
            "total_mistakes": 0,
            "total_inaccuracies": 0,
            "failed_games": [],
            "message": "No unanalyzed games remaining."
        }

    games_to_analyze = unanalyzed_games[:limit]
    
    total_moves = 0
    total_blunders = 0
    total_mistakes = 0
    total_inaccuracies = 0
    failed_games = []
    analyzed_count = 0

    for game in games_to_analyze:
        try:
            result = analyze_game(db, game.id)
            total_moves += result["moves_analyzed"]
            total_blunders += result["blunders"]
            total_mistakes += result["mistakes"]
            total_inaccuracies += result["inaccuracies"]
            analyzed_count += 1
        except Exception as e:
            logger.error(f"Failed to analyze game {game.id} during batch: {e}")
            failed_games.append(game.id)
            continue

    remaining_count = len(unanalyzed_games) - analyzed_count

    return {
        "username": username,
        "requested_limit": limit,
        "games_analyzed": analyzed_count,
        "games_remaining": max(0, remaining_count),
        "total_moves_analyzed": total_moves,
        "total_blunders": total_blunders,
        "total_mistakes": total_mistakes,
        "total_inaccuracies": total_inaccuracies,
        "failed_games": failed_games,
        "message": f"Successfully analyzed {analyzed_count} games." if analyzed_count > 0 else "Analysis completed with failures."
    }

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
            best_move=move.get("best_move_san") or move.get("best_move"), # for backward compat
            best_move_uci=move.get("best_move_uci"),
            best_move_san=move.get("best_move_san"),
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
        models.MoveAnalysis.turn.desc() # 'white' comes after 'black' alphabetically
    ).all()

def get_game_review(db: Session, game_id: int):
    """Generate a comprehensive frontend-friendly review for a game."""
    game = get_game_by_id(db, game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    if not game.analyzed:
        raise HTTPException(
            status_code=400, 
            detail="Game must be analyzed before review. Call POST /games/{id}/analyze first."
        )

    # Get move analysis
    moves = get_game_analysis(db, game_id)
    
    # Initialize summary statistics
    classifications = ["Brilliant", "Great", "Best", "Excellent", "Good", "Book", "Inaccuracy", "Mistake", "Miss", "Blunder"]
    
    stats = {
        "white": {"username": game.white_username, "points_lost": [], "counts": {c: 0 for c in classifications}},
        "black": {"username": game.black_username, "points_lost": [], "counts": {c: 0 for c in classifications}}
    }

    processed_moves = []
    eval_graph = []
    key_moments = []
    
    for i, m in enumerate(moves):
        side = m.turn
        stats[side]["points_lost"].append(m.points_lost)
        if m.classification in stats[side]["counts"]:
            stats[side]["counts"][m.classification] += 1
        
        # Build processed move list
        processed_moves.append({
            "move_number": m.move_number,
            "turn": m.turn,
            "move_san": m.move_san,
            "classification": m.classification,
            "points_lost": m.points_lost,
            "evaluation_before": m.evaluation_before,
            "evaluation_after": m.evaluation_after,
            "best_move_uci": m.best_move_uci,
            "best_move_san": m.best_move_san,
            "fen_before": m.fen_before
        })

        # Eval graph (ply is the index + 1)
        eval_graph.append({
            "ply": i + 1,
            "move_number": m.move_number,
            "turn": m.turn,
            "evaluation": m.evaluation_after
        })

    # Accuracy estimates (Temporary approximate formula)
    # accuracy = max(0, min(100, 100 - average_points_lost * 15))
    def calc_accuracy(pts_list):
        if not pts_list: return 0.0
        avg_loss = sum(pts_list) / len(pts_list)
        return round(max(0, min(100, 100 - avg_loss * 15)), 1)

    white_accuracy = calc_accuracy(stats["white"]["points_lost"])
    black_accuracy = calc_accuracy(stats["black"]["points_lost"])

    # Key moments (top 5 worst moves)
    # Sort all moves by points lost
    sorted_by_loss = sorted(moves, key=lambda x: x.points_lost, reverse=True)
    for m in sorted_by_loss[:5]:
        key_moments.append({
            "move_number": m.move_number,
            "turn": m.turn,
            "move_san": m.move_san,
            "classification": m.classification,
            "points_lost": m.points_lost
        })

    return {
        "game": {
            "id": game.id,
            "platform": game.player.platform if game.player else "chesscom",
            "white_username": game.white_username,
            "black_username": game.black_username,
            "result": game.result,
            "time_control": game.time_control,
            "end_time": game.end_time,
            "analyzed": game.analyzed
        },
        "summary": {
            "total_moves": len(moves),
            "white": {
                "username": game.white_username,
                "accuracy_estimate": white_accuracy,
                "counts": stats["white"]["counts"]
            },
            "black": {
                "username": game.black_username,
                "accuracy_estimate": black_accuracy,
                "counts": stats["black"]["counts"]
            }
        },
        "moves": processed_moves,
        "evaluation_graph": eval_graph,
        "key_moments": key_moments
    }

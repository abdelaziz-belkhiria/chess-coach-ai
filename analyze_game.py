import chess
import chess.pgn
import io
import math
from stockfish import Stockfish

STOCKFISH_PATH = "engine/stockfish.exe"


def cp_to_win_prob(cp):
    """Convert centipawn eval (from side-to-move's perspective doesn't matter here,
    we normalize to White's perspective before calling this) to win probability 0-1."""
    return 1 / (1 + math.pow(10, -cp / 400))


def classify_by_expected_points(points_lost):
    if points_lost <= 0.00:
        return "Best"
    elif points_lost <= 0.02:
        return "Excellent"
    elif points_lost <= 0.05:
        return "Good"
    elif points_lost <= 0.10:
        return "Inaccuracy"
    elif points_lost <= 0.20:
        return "Mistake"
    else:
        return "Blunder"


def analyze_pgn(pgn_text, depth=14):
    sf = Stockfish(path=STOCKFISH_PATH, depth=depth)
    game = chess.pgn.read_game(io.StringIO(pgn_text))
    board = game.board()

    results = []

    # Eval BEFORE any move (starting position), always from White's perspective
    sf.set_fen_position(board.fen())
    eval_data = sf.get_evaluation()
    prev_cp = eval_data["value"] if eval_data["type"] == "cp" else (10000 if eval_data["value"] > 0 else -10000)
    prev_win_prob_white = cp_to_win_prob(prev_cp)

    for move in game.mainline_moves():
        mover_is_white = board.turn == chess.WHITE
        san = board.san(move)
        board.push(move)

        sf.set_fen_position(board.fen())
        eval_data = sf.get_evaluation()
        current_cp = eval_data["value"] if eval_data["type"] == "cp" else (10000 if eval_data["value"] > 0 else -10000)
        current_win_prob_white = cp_to_win_prob(current_cp)

        # Win probability from the perspective of the player who just moved
        if mover_is_white:
            wp_before = prev_win_prob_white
            wp_after = current_win_prob_white
        else:
            wp_before = 1 - prev_win_prob_white
            wp_after = 1 - current_win_prob_white

        points_lost = max(0.0, wp_before - wp_after)
        classification = classify_by_expected_points(points_lost)

        results.append({
            "move": san,
            "player": "White" if mover_is_white else "Black",
            "eval_cp": current_cp,
            "points_lost": round(points_lost, 3),
            "classification": classification
        })

        prev_win_prob_white = current_win_prob_white

    return results


if __name__ == "__main__":
    sample_pgn = """
1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7
    """

    analysis = analyze_pgn(sample_pgn, depth=12)
    for entry in analysis:
        print(f"{entry['player']:6} {entry['move']:6} eval: {entry['eval_cp']:6} pts_lost: {entry['points_lost']:.3f} -> {entry['classification']}")
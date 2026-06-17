import chess
import chess.pgn
import io
import os
import logging
from stockfish import Stockfish
from dotenv import load_dotenv

load_dotenv()

DEFAULT_STOCKFISH_PATH = os.getenv("STOCKFISH_PATH", "engine/stockfish.exe")
MAX_POINTS_LOST = 10.0
logger = logging.getLogger(__name__)

class ChessAnalyzer:
    def __init__(self, path=None, depth=12):
        self.path = path or DEFAULT_STOCKFISH_PATH
        self.depth = depth

    def _get_eval_value(self, sf: Stockfish):
        """Get evaluation value from side-to-move's perspective in pawns."""
        try:
            eval_data = sf.get_evaluation()
            if eval_data["type"] == "cp":
                return eval_data["value"] / 100.0
            elif eval_data["type"] == "mate":
                # Mate for side to move is positive, being mated is negative
                return 100.0 if eval_data["value"] > 0 else -100.0
            return 0.0
        except Exception as e:
            logger.error(f"Error getting evaluation: {e}")
            return 0.0

    def classify_move(self, points_lost: float) -> str:
        """Classify a move based on centipawn loss."""
        points_lost = max(0.0, points_lost)
        if points_lost <= 0.10:
            return "Best"
        elif points_lost <= 0.30:
            return "Excellent"
        elif points_lost <= 0.70:
            return "Good"
        elif points_lost <= 1.50:
            return "Inaccuracy"
        elif points_lost <= 3.00:
            return "Mistake"
        else:
            return "Blunder"

    def analyze_pgn(self, pgn_text: str, depth=None) -> list[dict]:
        """Analyze a PGN string and return a list of move evaluations."""
        analysis_depth = depth or self.depth
        
        if not os.path.exists(self.path):
            raise FileNotFoundError(f"Stockfish executable not found at {self.path}. Check STOCKFISH_PATH in .env.")

        sf = Stockfish(path=self.path, depth=analysis_depth)
        pgn_io = io.StringIO(pgn_text)
        game = chess.pgn.read_game(pgn_io)
        if not game:
            return []

        board = game.board()
        results = []
        move_number = 1

        for move in game.mainline_moves():
            mover_is_white = board.turn == chess.WHITE
            turn_str = "white" if mover_is_white else "black"
            fen_before = board.fen()
            move_san = board.san(move)

            # 1. Evaluation BEFORE the move, from the perspective of the side about to move (the mover)
            sf.set_fen_position(fen_before)
            eval_before_data = sf.get_evaluation()
            eval_before_mover = self._get_eval_value(sf)
            best_move_uci = sf.get_best_move()
            
            # Convert best move to SAN for easier reading
            best_move_san = None
            if best_move_uci:
                try:
                    best_move_san = board.san(chess.Move.from_uci(best_move_uci))
                except Exception:
                    best_move_san = best_move_uci

            # 2. Execute move
            board.push(move)

            # 3. Evaluation AFTER the move. Stockfish now evaluates from the perspective
            # of whoever is next to move (the opponent), so we negate it to get the
            # mover's own perspective (needed for an apples-to-apples points-lost calc).
            sf.set_fen_position(board.fen())
            eval_after_data = sf.get_evaluation()
            eval_after_opponent = self._get_eval_value(sf)
            eval_after_mover = -eval_after_opponent

            # Points lost calculation and capping (always from the mover's own perspective,
            # i.e. "how much did my own move worsen my position").
            points_lost = max(0.0, eval_before_mover - eval_after_mover)
            if points_lost > MAX_POINTS_LOST:
                points_lost = MAX_POINTS_LOST
            
            classification = self.classify_move(points_lost)

            # Check if it was a mate-related situation
            is_mate_related = (eval_before_data["type"] == "mate" or eval_after_data["type"] == "mate")

            # Convert evaluations to a SINGLE consistent reference frame (White's perspective,
            # the standard convention used by chess.com/lichess eval bars) before storing/returning.
            # Without this, evaluation_before/after would alternate perspective every ply
            # (White's view on White's moves, Black's view on Black's moves), which makes the
            # evaluation graph and any move-to-move eval comparison meaningless.
            eval_before_white = eval_before_mover if mover_is_white else -eval_before_mover
            eval_after_white = eval_after_mover if mover_is_white else -eval_after_mover

            results.append({
                "move_number": move_number,
                "turn": turn_str,
                "move_san": move_san,
                "fen_before": fen_before,
                "best_move": best_move_san, # Set to SAN for backward compatibility if possible, or just add new fields
                "best_move_uci": best_move_uci,
                "best_move_san": best_move_san,
                "evaluation_before": round(eval_before_white, 2),
                "evaluation_after": round(eval_after_white, 2),
                "points_lost": round(points_lost, 2),
                "classification": classification,
                "is_mate_related": is_mate_related
            })

            # Increment move number after black moves
            if not mover_is_white:
                move_number += 1

        return results

def analyze_pgn(pgn_text: str, depth=12) -> list[dict]:
    analyzer = ChessAnalyzer(depth=depth)
    return analyzer.analyze_pgn(pgn_text)

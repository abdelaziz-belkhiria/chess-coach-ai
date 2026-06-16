from stockfish import Stockfish

STOCKFISH_PATH = "engine/stockfish.exe"

sf = Stockfish(path=STOCKFISH_PATH)
sf.make_moves_from_current_position(["e2e4", "e7e5"])
print("Best move:", sf.get_best_move())
print("Evaluation:", sf.get_evaluation())
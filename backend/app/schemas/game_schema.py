from pydantic import BaseModel, ConfigDict, HttpUrl
from typing import List, Optional
from datetime import datetime

class MoveAnalysisResponse(BaseModel):
    id: int
    game_id: int
    move_number: int
    turn: str
    move_san: str
    fen_before: str
    best_move: Optional[str] = None
    evaluation_before: Optional[float] = None
    evaluation_after: Optional[float] = None
    points_lost: Optional[float] = None
    classification: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class GameResponse(BaseModel):
    id: int
    player_id: int
    chesscom_url: Optional[str] = None
    pgn: str
    white_username: str
    black_username: str
    result: Optional[str] = None
    time_control: Optional[str] = None
    end_time: Optional[datetime] = None
    imported_at: datetime
    analyzed: bool

    model_config = ConfigDict(from_attributes=True)

class PlayerResponse(BaseModel):
    id: int
    username: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ImportGamesResponse(BaseModel):
    username: str
    imported: int
    skipped: int
    total_seen: int

class AnalyzeGameResponse(BaseModel):
    game_id: int
    moves_analyzed: int
    blunders: int
    mistakes: int
    inaccuracies: int

class AnalyzePlayerGamesResponse(BaseModel):
    username: str
    requested_limit: int
    games_analyzed: int
    games_remaining: int
    total_moves_analyzed: int
    total_blunders: int
    total_mistakes: int
    total_inaccuracies: int
    failed_games: List[int]
    message: Optional[str] = None

class CriticalMistakeResponse(BaseModel):
    game_id: int
    move_number: int
    turn: str
    move_san: str
    points_lost: float
    classification: str
    best_move: Optional[str]
    fen_before: str

    model_config = ConfigDict(from_attributes=True)

class PhaseWeakness(BaseModel):
    opening: int
    middlegame: int
    endgame: int

class ColorWeakness(BaseModel):
    white: int
    black: int

class WeaknessSummaryResponse(BaseModel):
    username: str
    total_analyzed_games: int
    total_moves_analyzed: int
    total_blunders: int
    total_mistakes: int
    total_inaccuracies: int
    average_points_lost: float
    phase_weakness: PhaseWeakness
    color_weakness: ColorWeakness
    phase_bad_move_rate: dict[str, float]
    color_bad_move_rate: dict[str, float]
    main_weakness: str
    critical_mistakes: List[CriticalMistakeResponse]
    message: Optional[str] = None

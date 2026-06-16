from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class Player(Base):
    __tablename__ = "players"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    games = relationship("Game", back_populates="player")

class Game(Base):
    __tablename__ = "games"

    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=False)
    chesscom_url = Column(String, unique=True, index=True, nullable=True)
    pgn = Column(Text, nullable=False)
    white_username = Column(String, nullable=False)
    black_username = Column(String, nullable=False)
    result = Column(String, nullable=True)
    time_control = Column(String, nullable=True)
    end_time = Column(DateTime, nullable=True)
    imported_at = Column(DateTime(timezone=True), server_default=func.now())
    analyzed = Column(Boolean, default=False)

    player = relationship("Player", back_populates="games")
    move_analyses = relationship("MoveAnalysis", back_populates="game", cascade="all, delete-orphan")

class MoveAnalysis(Base):
    __tablename__ = "move_analyses"

    id = Column(Integer, primary_key=True, index=True)
    game_id = Column(Integer, ForeignKey("games.id"), nullable=False)
    move_number = Column(Integer, nullable=False)
    turn = Column(String, nullable=False) # "white" or "black"
    move_san = Column(String, nullable=False)
    fen_before = Column(Text, nullable=False)
    best_move = Column(String, nullable=True)
    evaluation_before = Column(Float, nullable=True)
    evaluation_after = Column(Float, nullable=True)
    points_lost = Column(Float, nullable=True)
    classification = Column(String, nullable=True)

    game = relationship("Game", back_populates="move_analyses")

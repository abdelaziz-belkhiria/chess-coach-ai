# Chess Coach AI

**Chess Coach AI** is an ambitious full-stack chess analysis and coaching platform. The vision is to transform raw game data into a personalized coaching experience that understands how *you* play, identifies your unique recurring blind spots, and explains tactical and strategic concepts in plain English.

> [!IMPORTANT]
> **Project Status: Work-in-Progress Prototype**
> This project is currently in the prototype stage. Many core features (like the AI coach, advanced classification, and personalized puzzles) are in the planning or early-development phase.

---

## 🎯 Core Vision
The ultimate goal of Chess Coach AI is to bridge the gap between engine evaluations (centipawns) and human understanding (concepts). It allows users to import their public games from major platforms (starting with Chess.com) and receive deep insights through:

1.  **A Premium Game Review**: A concept-driven review of every move, with human-readable labels and accurate accuracy estimates.
2.  **A Personal AI Coach**: A pedagogical layer that explains *why* a move was a mistake and *what* should have been considered instead.
3.  **Cross-Game Weakness Tracking**: Detection of recurring patterns (e.g., "You frequently miss tactical forks in the endgame") instead of analyzing games in isolation.
4.  **Personalized Puzzles**: Training exercises generated directly from the user's own blunders and missed opportunities.

---

## 🛠️ Current Implementation

### Backend (FastAPI + Python)
- **Game Import**: Functional import logic for Chess.com public archives by username.
- **Analysis Engine**: Integration with **Stockfish** for move-by-move evaluation and storage.
- **Database Architecture**: SQLite-based system storing players, full game histories, and individual move evaluations.
- **Analysis Storage**: Persistent storage of move classifications, evaluations, and "key moments".
- **API Surface**: Frontend-friendly endpoints for game reviews, player statistics, and basic weakness detection.

### Frontend (React + Vite)
- **Modern UI**: A SaaS-inspired dark theme with responsive layouts.
- **Game List**: Browsable list of imported games with analysis status.
- **Interactive Review**: Functional board with move-by-move navigation and evaluation chart.
- **Multi-language Support**: English, French, and Arabic (فصحى) with full RTL support.
- **Move Classification**: Basic implementation of move badges based on point loss.
- **Coach Panel**: A placeholder panel providing deterministic, rule-based feedback (pre-AI implementation).

---

## 📋 Comprehensive Product Requirements

### 1. The Game Review Experience
The app aims to provide a diagnostic review for every game:
- **Move Classifications**: Brilliant, Great, Best, Excellent, Good, Book, Inaccuracy, Mistake, Miss, Blunder.
- **Navigation**: Start/End and Next/Previous controls, synchronized with board state.
- **Accuracy Estimates**: Weighted accuracy based on move quality across different game phases.
- **Key Moments**: Automatic detection of critical turning points where the evaluation shifted significantly.
- **Zero-Asset Copying**: The app uses its own original UI components, unique badges, and custom styling to avoid infringing on proprietary assets.

### 2. The AI Chess Coach Vision
The future AI Coach will be a deep integration that uses real chess terminology to explain moves. It will support **English, French, and Arabic فصحى**, with potential future support for regional dialects like Tunisian Arabic.

**Explanations will cover:**
- **Tactical Motifs**: Forks, Pins, Skewers, Discovered Attacks, Mating Nets, etc.
- **Strategic Concepts**: Outposts, Piece Activity, Space Advantage, Outsize Passed Pawns.
- **Pawn Structures**: Isolated Pawns, Doubled Pawns, Pawn Chains, Pawn Breaks.
- **User-Specific Context**: "You've missed this type of back-rank mate three times this week."

### 3. Knowledge Layer & Terminology
A planned `backend/app/knowledge/` module will store structured chess concepts to "prime" the AI Coach.
- **Glossary**: Standardized definitions for all major chess rules, phases, and concepts.
- **Tactical/Strategic Library**: A database of patterns Stockfish identifies that the AI then explains.
- **Prompt Engineering**: Dynamic builders to ensure the coach sounds pedagogical, not just analytical.

### 4. Personalized Puzzle Feature (Roadmap)
Rather than solving random puzzles, the app will generate "Blunder Corrections":
- **"You were here"**: The puzzle starts exactly 1 move before your biggest blunder in a previous game.
- **"Find the win"**: You are asked to find the tactical shot you missed in your own game.
- **Concept Reinforcement**: If you fail a puzzle, the AI coach explains the specific tactical motif involved.

### 5. Multi-Platform Support
- **Chess.com**: Currently active for all public usernames.
- **Lichess**: Planned for future integration.
- **Platform Agnostic**: The backend uses a generic `platform` field to ensure easy extension to any chessboard source.

---

## 🚧 Known Issues & Limitations
- **Work-in-Progress UI**: The Review page and Weakness page require further design polishing and interaction fixes.
- **Simplified Classification**: The current algorithm is purely point-loss based; it does not yet detect "Brilliant" or "Book" moves accurately.
- **Rule-Based Coach**: The current "Coach" is a simple script. Live LLM-powered coaching is currently being prototyped.
- **Local Requirements**: Requires a local Stockfish binary and manual `.env` configuration.
- **Single-User Focus**: Current architecture is optimized for local/single-device use.

---

## 📈 Roadmap

### Phase 1 — Foundation (Current)
- [x] Basic Import/Analyze workflow.
- [x] SQLite database schema.
- [x] React frontend framework.
- [x] Multi-language UI support.

### Phase 2 — Refinement
- [/] Reliable board replay & synchronized navigation.
- [ ] Improved Review layout & responsiveness.
- [ ] Bug fixes in Weakness detection logic.

### Phase 3 — Intelligent Analysis
- [ ] **Expected Points Algorithm**: More accurate classification based on winning probability.
- [ ] **Phase Detection**: Differentiating between Opening/Middlegame/Endgame.
- [ ] Book move detection via Opening databases.

### Phase 4 — AI Integration
- [ ] **Multilingual AI Coach**: Integration of Claude/OpenAI for move explanations.
- [ ] **Knowledge Base**: Building the chess terminology priming layer.
- [ ] History-aware coaching.

### Phase 5 — Training
- [ ] **Personalized Puzzles**: Logic to extract and present blunder-reversal puzzles.
- [ ] Progress tracking across specific tactical motifs.

### Phase 6 — Scale
- [ ] Lichess API integration.
- [ ] Production-ready database (PostgreSQL) and deployment strategy.

---

## 💻 Setup & Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- [Stockfish Engine](https://stockfishchess.org/download/): Place binary in the `engine/` folder.

### 1. Backend Setup (PowerShell)
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate
pip install -r requirements.txt
# Create your .env from .env.example
python -m uvicorn app.main:app --reload --port 8001
```

### 2. Frontend Setup (PowerShell)
```powershell
cd frontend
npm install
# Create your .env from .env.example
npm run dev
```

---

## 🛡️ Git Hygiene
The following files/directories should **never** be committed:
- `backend/.env`
- `frontend/.env`
- `backend/chess_coach.db`
- `venv/`
- `node_modules/`
- `dist/`
- `engine/` (containing Stockfish binary)

---

## ⚖️ Disclaimer
**Chess Coach AI** is an independent project. It uses public APIs and libraries and is not affiliated with, endorsed by, or partnered with Chess.com or Lichess. All UI designs and classification implementations are original interpretations and do not use proprietary assets or trade secrets from other platforms.

# U Scout - AI Football Scouting Platform

Smart Scouter is a full-stack AI-powered football (soccer) player scouting and analysis platform. It combines Transfermarkt dataset analysis with LLM-powered AI (Groq) to provide intelligent player evaluations, comparisons, and recommendations — designed for scouts and clubs looking for data-driven player discovery.

---

## Tech Stack

### Backend
- **Python 3.x** + **FastAPI** — REST API server
- **SQLite3** + **Pandas** — Data storage and querying
- **Groq API** (`llama-3.1-8b-instant`) — LLM for AI analysis
- **python-dotenv**, **httpx** — Config and async HTTP

### Frontend
- **React 19** + **Vite** — UI and build tooling
- **Tailwind CSS 4** — Styling with custom U Cluj theme
- **Lucide React** — Icons
- **react-world-flags** — Country flag rendering

---

## Features

- **Natural language player search** — Query players in Romanian (e.g. "atacanți români sub 23 de ani")
- **AI player reports** — Groq LLM generates detailed evaluations with attributes, stats, and career trajectory
- **Player comparison** — Side-by-side comparison of any two players
- **Advanced filters** — Position, age range, goals/assists sliders
- **Favorites & folders** — Organize and pin players to custom watchlists
- **Player image proxy** — Cached player photos served through the backend
- **Admin panel** — User management and email invitations

---

## Project Structure


---

## Setup

### Prerequisites
- Python 3.x
- Node.js
- Groq API key — [console.groq.com](https://console.groq.com)
- Transfermarkt datasets (CSV format)

### Backend

```bash
cd smart-scout-ai

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn pandas groq python-dotenv httpx

# Configure environment
echo "GROQ_API_KEY=your_key_here" > .env

# Build the database (first run only — takes a few minutes)
python main.py

# Start the API server
uvicorn api:app --reload --port 8000

cd smart_scouter_frontend

npm install
npm run dev


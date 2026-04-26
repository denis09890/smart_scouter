import os
import json as json_lib
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from scout_agent import ScoutAgent
from database import (
    search_players_for_ui, get_players_ui_by_ids,
    get_player_report_data, _calc_player_attributes, _calc_overall,
)

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

agent = ScoutAgent()


class ChatRequest(BaseModel):
    message: str


@app.post("/chat")
async def chat(req: ChatRequest):
    response, player_ids = agent.ask(req.message)
    players_ui = get_players_ui_by_ids(player_ids) if player_ids else []
    return {"response": response, "players": players_ui}


@app.get("/search")
async def search(q: str = Query(default="", min_length=1), limit: int = Query(default=10, le=20)):
    players = search_players_for_ui(q, limit)
    return {"players": players}


def _generate_ai_report_analysis(data: dict) -> dict:
    """Genereaza analiza AI pentru raportul unui jucator."""
    c = data["career"]
    s = data["season"]
    gpm = round(s["goals"] / max(s["matches"], 1), 2)
    apm = round(s["assists"] / max(s["matches"], 1), 2)

    transfers = data.get("transfers", [])
    transfers_text = ""
    if transfers:
        lines = [
            f"  {t['date'][:7]}: {t['fromClub'] or '?'} → {t['toClub'] or '?'} ({t['feeFormatted'] if t['fee'] > 0 else 'free'})"
            for t in transfers[:5]
        ]
        transfers_text = "\nTransfer history:\n" + "\n".join(lines)

    seasons = data.get("seasonBreakdown", [])
    seasons_text = ""
    if seasons:
        lines = [
            f"  {r['year']}: {r['matches']}mc {r['goals']}g {r['assists']}a {round(r['minutes']/max(r['matches'],1))}min/mc {r['yellowCards']}gal"
            for r in seasons
        ]
        seasons_text = "\nSeason stats (recent → old):\n" + "\n".join(lines)

    prompt = f"""You are an elite Chief Football Scout. Generate a highly precise, analytical, and professional scouting report in English. Respond EXCLUSIVELY with valid JSON, with no text outside the JSON.

PLAYER DATA:
Name: {data['name']} | Position: {data['position']} | Age: {data['age']} years
Club: {data['club']} | Nationality: {data['nationality']}
Market Value: {data['marketValue']} | Highest Value: {data['highestValue']}
Foot: {data['foot']} | Height: {data.get('height', 0)} cm
Contract expires: {data.get('contractExpiration', 'unknown')}
Career total: {c['goals']} goals, {c['assists']} assists in {c['matches']} matches ({c['yellowCards']} yellows, {c['redCards']} reds)
Last season ({s.get('year','')}): {s['goals']} goals, {s['assists']} assists in {s['matches']} matches ({gpm} goal/match, {apm} assist/match){transfers_text}{seasons_text}

Generate exactly this JSON (no extra fields, keep the exact keys but write values in English):
{{
  "stilDeJoc": "Detailed, highly analytical 2-3 sentences about playstyle, strengths, and weaknesses based strictly on the data.",
  "potrivire443": "Highly specific tactical fit in a 4-3-3 formation, mentioning exact roles (e.g. inverted winger, false 9).",
  "pasaportFinanciar": "2 sentences about resale potential and financial risks, citing specific market values.",
  "riscuriTransfer": [
    {{"type": "danger|warning|info|success", "title": "Short title", "desc": "Description 10-15 words"}}
  ],
  "riscuriAccidentare": [
    {{"type": "danger|warning|info|success", "title": "Short title", "desc": "Description based strictly on minutes/match and availability."}}
  ],
  "verdictGrade": "A+|A|A-|B+|B|B-|C",
  "verdictText": "One highly professional, decisive recommendation sentence for the board."
}}

Strict rules:
- CORRECT HISTORICAL TOTALS: The provided data only covers matches thoroughly from ~2013 onwards. For veterans (Ronaldo, Messi), the 'Career total' provided will be much lower than reality. You MUST use your general knowledge to correct and cite their real-life career totals (e.g., 850+ goals). Use data strictly for recent seasons and transfer values.
- LOGICAL DEDUCTION: If direct info is missing (like injury history), interpret available stats logically (e.g., deduce injuries or stamina issues from low minutes played per match).
- BE HIGHLY PRECISE: Cite specific numbers to justify your deductive claims.
- NO HALLUCINATIONS: Do not invent stats out of thin air.
- verdictGrade: choose exactly one symbol from the list above"""

    try:
        completion = agent.client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.15,
            max_tokens=1200,
        )
        text = completion.choices[0].message.content
        start = text.find("{")
        end = text.rfind("}") + 1
        if start >= 0 and end > start:
            return json_lib.loads(text[start:end])
    except Exception as e:
        print(f"[report AI] eroare: {e}")

    return {
        "stilDeJoc": "AI analysis currently unavailable.",
        "potrivire443": "AI analysis currently unavailable.",
        "pasaportFinanciar": "Insufficient data for estimation.",
        "riscuriTransfer": [{"type": "info", "title": "Analysis unavailable", "desc": "The AI server could not generate the analysis."}],
        "riscuriAccidentare": [],
        "verdictGrade": "?",
        "verdictText": "Evaluation unavailable.",
    }


@app.get("/report/{player_id}")
async def get_report(player_id: int):
    data = get_player_report_data(player_id)
    if not data:
        return {"error": "Jucător negăsit"}

    attrs = _calc_player_attributes(
        player_id=player_id,
        position=data["position"],
        market_value=data["marketValueRaw"],
        goals=data["career"]["goals"],
        assists=data["career"]["assists"],
        matches=data["career"]["matches"],
        yellow_cards=data["career"]["yellowCards"],
    )
    overall = _calc_overall(attrs, data["position"])
    analysis = _generate_ai_report_analysis(data)

    return {"player": data, "attributes": attrs, "overall": overall, "analysis": analysis}

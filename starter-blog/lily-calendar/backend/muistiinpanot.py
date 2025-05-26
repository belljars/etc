import sqlite3
from typing import List, Dict
from fastapi import APIRouter

DB_FILE = "muistiinpanot.db"
router = APIRouter()

def init_db():
    with sqlite3.connect(DB_FILE) as conn:
        cur = conn.cursor()
        cur.execute('''
            CREATE TABLE IF NOT EXISTS muistiinpanot (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                teksti TEXT NOT NULL,
                aikajana TEXT NOT NULL,
                paivays TEXT
            )
        ''')
        conn.commit()

@router.get("/muistiinpanot", response_model=List[Dict])
def get_notes():
    with sqlite3.connect(DB_FILE) as conn:
        cur = conn.cursor()
        cur.execute("SELECT id, teksti, aikajana, paivays FROM muistiinpanot")
        return [{"id": row[0], "teksti": row[1], "aikajana": row[2], "paivays": row[3]} for row in cur.fetchall()]

@router.post("/muistiinpanot", response_model=Dict)
def add_note(note: Dict):
    with sqlite3.connect(DB_FILE) as conn:
        cur = conn.cursor()
        cur.execute("INSERT INTO muistiinpanot (teksti, aikajana, paivays) VALUES (?, ?, ?)",
                    (note["teksti"], note["aikajana"], note.get("paivays")))
        conn.commit()
        return {"id": cur.lastrowid, **note}

@router.delete("/muistiinpanot/{note_id}", response_model=Dict)
def delete_note(note_id: int):
    with sqlite3.connect(DB_FILE) as conn:
        cur = conn.cursor()
        cur.execute("DELETE FROM muistiinpanot WHERE id = ?", (note_id,))
        conn.commit()
        return {"deleted": note_id}

init_db()
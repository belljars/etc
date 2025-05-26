import sqlite3
from typing import List, Dict
from fastapi import APIRouter

TODO_DB_FILE = "todo.db"
todo_router = APIRouter()

def init_todo_db():
    with sqlite3.connect(TODO_DB_FILE) as conn:
        cur = conn.cursor()
        cur.execute('''
            CREATE TABLE IF NOT EXISTS todo (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                teksti TEXT NOT NULL,
                valmis INTEGER DEFAULT 0
            )
        ''')
        conn.commit()

@todo_router.get("/todo", response_model=List[Dict])
def get_todos():
    with sqlite3.connect(TODO_DB_FILE) as conn:
        cur = conn.cursor()
        cur.execute("SELECT id, teksti, valmis FROM todo")
        return [{"id": row[0], "teksti": row[1], "valmis": bool(row[2])} for row in cur.fetchall()]

@todo_router.post("/todo", response_model=Dict)
def add_todo(todo: Dict):
    with sqlite3.connect(TODO_DB_FILE) as conn:
        cur = conn.cursor()
        cur.execute("INSERT INTO todo (teksti) VALUES (?)", (todo["teksti"],))
        conn.commit()
        return {"id": cur.lastrowid, "teksti": todo["teksti"], "valmis": False}

@todo_router.delete("/todo/{todo_id}", response_model=Dict)
def delete_todo(todo_id: int):
    with sqlite3.connect(TODO_DB_FILE) as conn:
        cur = conn.cursor()
        cur.execute("DELETE FROM todo WHERE id = ?", (todo_id,))
        conn.commit()
        return {"deleted": todo_id}

@todo_router.delete("/todo", response_model=Dict)
def delete_all_todos():
    with sqlite3.connect(TODO_DB_FILE) as conn:
        cur = conn.cursor()
        cur.execute("DELETE FROM todo")
        conn.commit()
        return {"deleted": "all"}

@todo_router.put("/todo", response_model=Dict)
def finish_all_todos():
    with sqlite3.connect(TODO_DB_FILE) as conn:
        cur = conn.cursor()
        cur.execute("UPDATE todo SET valmis = 1")
        conn.commit()
        return {"finished": "all"}

@todo_router.put("/todo/{todo_id}", response_model=Dict)
def toggle_todo(todo_id: int):
    with sqlite3.connect(TODO_DB_FILE) as conn:
        cur = conn.cursor()
        cur.execute("UPDATE todo SET valmis = NOT valmis WHERE id = ?", (todo_id,))
        conn.commit()
        cur.execute("SELECT valmis FROM todo WHERE id = ?", (todo_id,))
        valmis = cur.fetchone()[0]
        return {"id": todo_id, "valmis": bool(valmis)}

init_todo_db()
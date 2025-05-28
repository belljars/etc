import sqlite3
from typing import List, Tuple, Optional

DB_FILE = "juhla_paivat.db"

def alusta_tietokanta():
    with sqlite3.connect(DB_FILE) as conn:
        cur = conn.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS juhla_paivat (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                pvm TEXT NOT NULL,
                nimi TEXT NOT NULL
            )
        """)
        conn.commit()

def lisaa_juhla_pv(pvm: str, nimi: str):
    with sqlite3.connect(DB_FILE) as conn:
        cur = conn.cursor()
        cur.execute("INSERT INTO juhla_paivat (pvm, nimi) VALUES (?, ?)", (pvm, nimi))
        conn.commit()

def hae_juhla_paivat() -> List[Tuple[str, str]]:
    with sqlite3.connect(DB_FILE) as conn:
        cur = conn.cursor()
        cur.execute("SELECT pvm, nimi FROM juhla_paivat ORDER BY pvm")
        return cur.fetchall()

def hae_juhla_pv_pvm(pvm: str) -> Optional[str]:
    with sqlite3.connect(DB_FILE) as conn:
        cur = conn.cursor()
        cur.execute("SELECT nimi FROM juhla_paivat WHERE pvm = ?", (pvm,))
        row = cur.fetchone()
        return row[0] if row else None

if __name__ == "__main__":
    import sys
    alusta_tietokanta()
    if len(sys.argv) == 3 and sys.argv[1] == "lisaa":

        pvm = sys.argv[2]
        nimi = input("Anna juhlapäivän nimi: ")
        lisaa_juhla_pv(pvm, nimi)
        print(f"Lisätty: {pvm} - {nimi}")
    elif len(sys.argv) == 2 and sys.argv[1] == "lista":
        paivat = hae_juhla_paivat()
        for pvm, nimi in paivat:
            print(f"{pvm}: {nimi}")
    else:
        print("Käyttö:")
        print("  python juhla_paivat.py lisaa YYYY-MM-DD")
        print("  python juhla_paivat.py lista")
# Ohjelma luoo ja hallinnoi juhlapäiviä SQLite-tietokannan avulla

import sqlite3
from typing import List, Tuple, Optional
from datetime import datetime
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__)) # Tämä on tiedoston sijainti
os.makedirs(os.path.join(BASE_DIR, "database"), exist_ok=True) # Luoo hakemisto, jos sitä ei ole
DB_FILE = os.path.join(BASE_DIR, "database", "juhla_paivat.db") # Tietokannan tiedosto


# Määrittelee juhlapäivät ja niiden laskentafunktiot

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


# Funktio lisää juhlapäivän tietokantaan

def lisaa_juhla_pv(pvm: str, nimi: str):
    with sqlite3.connect(DB_FILE) as conn:
        cur = conn.cursor()
        cur.execute("INSERT INTO juhla_paivat (pvm, nimi) VALUES (?, ?)", (pvm, nimi))
        conn.commit()


# Funktio poistaa tapahtumia tietokannasta

def hae_juhla_paivat() -> List[Tuple[str, str]]:
    with sqlite3.connect(DB_FILE) as conn:
        cur = conn.cursor()
        cur.execute("SELECT pvm, nimi FROM juhla_paivat ORDER BY pvm")
        return cur.fetchall()


# Funktiot hakevat, poistavat ja päivittävät juhlapäiviä tietokannasta

def hae_juhla_pv_pvm(pvm: str) -> Optional[str]:
    with sqlite3.connect(DB_FILE) as conn:
        cur = conn.cursor()
        cur.execute("SELECT nimi FROM juhla_paivat WHERE pvm = ?", (pvm,))
        row = cur.fetchone()
        return row[0] if row else None

def poista_juhla_pv(pvm: str) -> bool:
    with sqlite3.connect(DB_FILE) as conn:
        cur = conn.cursor()
        cur.execute("DELETE FROM juhla_paivat WHERE pvm = ?", (pvm,))
        deleted = cur.rowcount > 0
        conn.commit()
        return deleted

def paivita_juhla_pv(pvm: str, uusi_nimi: str) -> bool:
    with sqlite3.connect(DB_FILE) as conn:
        cur = conn.cursor()
        cur.execute("UPDATE juhla_paivat SET nimi = ? WHERE pvm = ?", (uusi_nimi, pvm))
        updated = cur.rowcount > 0
        conn.commit()
        return updated


# Funktio validoi päivämäärän muodon ja sisällön
def validoi_pvm(pvm: str) -> bool:
    try:
        if pvm.startswith("xxxx-"):

            # Hyväksyy muodon xxxx-MM-DD tai xxxx-MM-xx

            parts = pvm.split("-")
            if len(parts) == 3 and len(parts[1]) == 2 and len(parts[2]) == 2:

                # Tarkistaa, että kuukausi on 01-12 ja päivä on xx tai validi päivä

                month = int(parts[1])
                if 1 <= month <= 12:
                    if parts[2] == "xx":
                        return True
                    else:

                        # Validoi, että päivä on validi

                        datetime.strptime(f"2000-{parts[1]}-{parts[2]}", "%Y-%m-%d")
                        return True
            return False
        else:
            datetime.strptime(pvm, "%Y-%m-%d")
            return True
    except ValueError:
        return False

if __name__ == "__main__":
    import sys
    alusta_tietokanta()


    if len(sys.argv) < 2:
        print("Käyttö:")
        print("  python juhla_paivat.py lisaa YYYY-MM-DD")
        print("  python juhla_paivat.py poista YYYY-MM-DD")
        print("  python juhla_paivat.py paivita YYYY-MM-DD")
        print("  python juhla_paivat.py lista")
        sys.exit(1)

    komento = sys.argv[1]
    
    if komento == "lisaa" and len(sys.argv) == 3:
        pvm = sys.argv[2]
        if not validoi_pvm(pvm):
            print("Virheellinen päivämäärä. Käytä muotoa YYYY-MM-DD")
            sys.exit(1)
        nimi = input("Anna juhlapäivän nimi: ")
        lisaa_juhla_pv(pvm, nimi)
        print(f"Lisätty: {pvm} - {nimi}")
    
    elif komento == "poista" and len(sys.argv) == 3:
        pvm = sys.argv[2]
        if poista_juhla_pv(pvm):
            print(f"Poistettu juhlapäivä: {pvm}")
        else:
            print(f"Juhlapäivää ei löytynyt: {pvm}")
    
    elif komento == "paivita" and len(sys.argv) == 3:
        pvm = sys.argv[2]
        uusi_nimi = input("Anna uusi nimi: ")
        if paivita_juhla_pv(pvm, uusi_nimi):
            print(f"Päivitetty: {pvm} - {uusi_nimi}")
        else:
            print(f"Juhlapäivää ei löytynyt: {pvm}")
    
    elif komento == "lista":
        paivat = hae_juhla_paivat()
        for pvm, nimi in paivat:
            print(f"{pvm}: {nimi}")
    
    else:
        print("Tuntematon komento tai väärä määrä parametreja")
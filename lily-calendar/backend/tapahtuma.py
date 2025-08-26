import sqlite3
from datetime import datetime
from typing import List, Optional, Dict
from fastapi import FastAPI
import uuid
from pydantic import BaseModel
import os


# Määrittelee tietokannan sijainnin ja luo FastAPI-sovelluksen

BASE_DIR = os.path.dirname(os.path.abspath(__file__)) # Tämä on tiedoston sijainti
DB_FILE = os.path.join(BASE_DIR, "database", "tapahtumat.db") # Tietokannan tiedosto
app = FastAPI() # FastAPI-sovellus, joka käsittelee tapahtumia


# Tapahtuma-luokka, joka luo tapahtuman ja muuntaa sen sanakirjaksi

class Tapahtuma:
    def __init__(
        self, nimi: str, alku_pvm: str, alku_aika: str, loppu_pvm: str, loppu_aika: str,
        kuvaus: Optional[str] = None, luokkaus: Optional[str] = None, tarkeys: int = 0, id: Optional[str] = None,
        sarja_id: Optional[str] = None
    ):
        self.nimi = nimi
        self.alku_pvm = alku_pvm
        self.alku_aika = alku_aika
        self.loppu_pvm = loppu_pvm
        self.loppu_aika = loppu_aika
        self.kuvaus = kuvaus
        self.luokkaus = luokkaus
        self.tarkeys = tarkeys if tarkeys is not None else 0
        self.id = id or self._luo_id()
        self.sarja_id = sarja_id


    # Luoo satunnainen UUID id:lle, jos sitä ei annettu

    def _luo_id(self) -> str:
        return str(uuid.uuid4())


    # Muuntaa tapahtuman sanakirjaksi, jota voidaan käyttää JSON-vastauksena

    def muunna_sanakirjaksi(self) -> Dict:
        return {
            'id': self.id,
            'nimi': self.nimi,
            'alku_pvm': self.alku_pvm,
            'alku_aika': self.alku_aika,
            'loppu_pvm': self.loppu_pvm,
            'loppu_aika': self.loppu_aika,
            'kuvaus': self.kuvaus or '',
            'luokkaus': self.luokkaus or '',
            'tarkeys': self.tarkeys,
            'sarja_id': self.sarja_id
        }


# Alustaa tietokannan ja luo tarvittavat taulut jos niitä ei ole

def _alusta_tietokanta() -> None:
    with sqlite3.connect(DB_FILE) as conn:
        cur = conn.cursor()
        cur.execute('''
            CREATE TABLE IF NOT EXISTS tapahtumat (
                id TEXT PRIMARY KEY,
                nimi TEXT NOT NULL,
                alku_pvm TEXT NOT NULL,
                alku_aika TEXT NOT NULL,
                loppu_pvm TEXT NOT NULL,
                loppu_aika TEXT NOT NULL,
                kuvaus TEXT,
                luokkaus TEXT,
                tarkeys INTEGER DEFAULT 0,
                sarja_id TEXT
            )
        ''')


        # Tarkistaa, että kaikki tarvittavat sarakkeet ovat olemassa

        cur.execute("PRAGMA table_info(tapahtumat)")
        columns = [row[1] for row in cur.fetchall()]
        if "luokkaus" not in columns:
            cur.execute("ALTER TABLE tapahtumat ADD COLUMN luokkaus TEXT")
        if "tarkeys" not in columns:
            cur.execute("ALTER TABLE tapahtumat ADD COLUMN tarkeys INTEGER DEFAULT 0")
        if "sarja_id" not in columns:
            cur.execute("ALTER TABLE tapahtumat ADD COLUMN sarja_id TEXT")
        conn.commit()


# Lisää tapahtuma tietokantaan ja tarkistaa päivämäärien ja aikojen oikeellisuuden

def lisaa_tapahtuma(nimi: str, alku_pvm: str, alku_aika: str,
                    loppu_pvm: str, loppu_aika: str, kuvaus: Optional[str] = None,
                    luokkaus: Optional[str] = None, tarkeys: int = 0, sarja_id: Optional[str] = None) -> Tapahtuma:
    try:
        alku_dt = datetime.strptime(f"{alku_pvm} {alku_aika}", "%Y-%m-%d %H:%M")
        if loppu_pvm and loppu_aika:
            loppu_dt = datetime.strptime(f"{loppu_pvm} {loppu_aika}", "%Y-%m-%d %H:%M")
            if loppu_dt < alku_dt:
                raise ValueError("Loppuaika ei voi olla ennen alkuaikaa")
    except ValueError as e:
        raise ValueError(f"Virheellinen päivämäärä/aika: {e}")


    # Luoo uuden tapahtuma-olion ja lisää se tietokantaan

    tapahtuma_id = str(uuid.uuid4())
    tapahtuma = Tapahtuma(nimi, alku_pvm, alku_aika, loppu_pvm, loppu_aika, kuvaus, luokkaus, tarkeys, id=tapahtuma_id, sarja_id=sarja_id)
    with sqlite3.connect(DB_FILE) as conn:
        cur = conn.cursor()
        cur.execute('''
            INSERT INTO tapahtumat (id, nimi, alku_pvm, alku_aika, loppu_pvm, loppu_aika, kuvaus, luokkaus, tarkeys, sarja_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (tapahtuma.id, tapahtuma.nimi, tapahtuma.alku_pvm, tapahtuma.alku_aika,
              tapahtuma.loppu_pvm, tapahtuma.loppu_aika, tapahtuma.kuvaus, tapahtuma.luokkaus, tapahtuma.tarkeys, tapahtuma.sarja_id))
        conn.commit()
    return tapahtuma


# Poistaa tapahtuman tietokannasta ja palauttaa True, jos tapahtuma poistettiin onnistuneesti

def poista_tapahtuma(tapahtuma_id: str) -> bool:
    with sqlite3.connect(DB_FILE) as conn:
        cur = conn.cursor()
        cur.execute('DELETE FROM tapahtumat WHERE id = ?', (tapahtuma_id,))
        conn.commit()
        return cur.rowcount > 0


# Muokkaa tapahtumaa tietokannassa ja tarkistaa päivämäärien ja aikojen oikeellisuuden

def muokkaa_tapahtuma(tapahtuma_id: str, **muutokset) -> Optional[Tapahtuma]:
    with sqlite3.connect(DB_FILE) as conn:
        cur = conn.cursor()
        tapahtuma = hae_tapahtuma(tapahtuma_id)
        if not tapahtuma:
            return None


        for avain, arvo in muutokset.items():
            if avain in tapahtuma.muunna_sanakirjaksi() and avain != 'id':
                tapahtuma.__dict__[avain] = arvo if arvo is not None else (0 if avain == "tarkeys" else '')


        try:
            alku_dt = datetime.strptime(f"{tapahtuma.alku_pvm} {tapahtuma.alku_aika}", "%Y-%m-%d %H:%M")
            if tapahtuma.loppu_pvm and tapahtuma.loppu_aika:
                loppu_dt = datetime.strptime(f"{tapahtuma.loppu_pvm} {tapahtuma.loppu_aika}", "%Y-%m-%d %H:%M")
                if loppu_dt < alku_dt:
                    raise ValueError("Loppuaika ei voi olla ennen alkuaikaa")
        except ValueError as e:
            raise ValueError(f"Virheellinen päivämäärä/aika: {e}")


        cur.execute('''
            UPDATE tapahtumat
            SET nimi = ?, alku_pvm = ?, alku_aika = ?, loppu_pvm = ?, loppu_aika = ?, kuvaus = ?, luokkaus = ?, tarkeys = ?, sarja_id = ?
            WHERE id = ?
        ''', (tapahtuma.nimi, tapahtuma.alku_pvm, tapahtuma.alku_aika,
              tapahtuma.loppu_pvm, tapahtuma.loppu_aika, tapahtuma.kuvaus, tapahtuma.luokkaus, tapahtuma.tarkeys, tapahtuma.sarja_id, tapahtuma.id))
        conn.commit()
        return tapahtuma


# Hakee kaikki tapahtumat tietokannasta ja palauttaa ne listana Tapahtuma-olioina

def hae_tapahtumat() -> List[Tapahtuma]:
    with sqlite3.connect(DB_FILE) as conn:
        cur = conn.cursor()
        cur.execute('SELECT * FROM tapahtumat')
        rows = cur.fetchall()
        return [
            Tapahtuma(row[1], row[2], row[3], row[4], row[5], row[6], row[7], row[8] if len(row) > 8 else 0, id=row[0], sarja_id=row[9] if len(row) > 9 else None)
            for row in rows
        ]


# Hakee yksittäisen tapahtuman ID:n perusteella ja palauttaa sen Tapahtuma-oliona

def hae_tapahtuma(tapahtuma_id: str) -> Optional[Tapahtuma]:
    with sqlite3.connect(DB_FILE) as conn:
        cur = conn.cursor()
        cur.execute('SELECT * FROM tapahtumat WHERE id = ?', (tapahtuma_id,))
        row = cur.fetchone()
        if row:
            return Tapahtuma(row[1], row[2], row[3], row[4], row[5], row[6], row[7], row[8] if len(row) > 8 else 0, id=row[0], sarja_id=row[9] if len(row) > 9 else None)
    return None


# FastAPI-reitit tapahtumien hallintaan

@app.get("/debug/tapahtumat")
def debug_get_all_events():
    return [event.muunna_sanakirjaksi() for event in hae_tapahtumat()]


# FastAPI-malli tapahtuman syötteelle

class TapahtumaInput(BaseModel):
    nimi: str
    alku_pvm: str
    alku_aika: str
    loppu_pvm: str
    loppu_aika: str
    kuvaus: str = ""
    luokkaus: str = ""
    tarkeys: int = 0


# FastAPI-reitti kaikkien tapahtumien hakemiseen

@app.post("/tapahtumat")
async def create_event(event: TapahtumaInput):
    tapahtuma = lisaa_tapahtuma(
        event.nimi,
        event.alku_pvm,
        event.alku_aika,
        event.loppu_pvm,
        event.loppu_aika,
        event.kuvaus,
        event.luokkaus,
        event.tarkeys
    )
    return tapahtuma.muunna_sanakirjaksi()


# FastAPI-reitti yksittäisen tapahtuman hakemiseen ID:n perusteella

@app.delete("/tapahtumat/{tapahtuma_id}")
def delete_event(tapahtuma_id: str):
    return {"success": True}


# FastAPI-reitti tapahtuman muokkaamiseen ID:n perusteella

_alusta_tietokanta()
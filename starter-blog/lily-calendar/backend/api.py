from fastapi import FastAPI, HTTPException, Body, Query, Path
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from typing import List, Optional

import tapahtuma as tapahtuma
import toistuva

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TapahtumaModel(BaseModel):
    nimi: str
    alku_pvm: str
    alku_aika: Optional[str] = None
    loppu_pvm: Optional[str] = None
    loppu_aika: Optional[str] = None
    kuvaus: Optional[str] = None
    luokkaus: Optional[str] = None
    tarkeys: Optional[int] = 0

class ToistuvaTapahtumaModel(TapahtumaModel):
    toistuva: str
    maara: int

@app.get("/")
def read_root():
    return {"message": "Lukujärjestys kalenteri API"}

@app.get("/tapahtumat", response_model=List[dict])
def get_all_events(
    alku_pvm: Optional[str] = Query(None),
    loppu_pvm: Optional[str] = Query(None),
    luokkaus: Optional[str] = Query(None)
):
    events = tapahtuma.hae_tapahtumat()
    if alku_pvm:
        events = [e for e in events if e.alku_pvm == alku_pvm]
    if loppu_pvm:
        events = [e for e in events if e.loppu_pvm == loppu_pvm]
    if luokkaus:
        events = [e for e in events if (e.luokkaus or "") == luokkaus]
    return [event.muunna_sanakirjaksi() for event in events]

@app.get("/tapahtumat/{event_id}", response_model=dict)
def get_event(event_id: str):
    event = tapahtuma.hae_tapahtuma(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Tapahtuma ei löydetty.")
    return event.muunna_sanakirjaksi()

@app.post("/tapahtumat", response_model=dict)
def create_event(event: TapahtumaModel):
    import sqlite3

    if event.luokkaus:
        with sqlite3.connect(tapahtuma.DB_FILE) as conn:
            cur = conn.cursor()
            cur.execute("SELECT DISTINCT luokkaus FROM tapahtumat WHERE luokkaus IS NOT NULL AND luokkaus != ''")
            categories = [row[0] for row in cur.fetchall()]
            if event.luokkaus not in categories and len(categories) >= 15:
                raise HTTPException(status_code=400, detail="Maksimi 15 luokkausta sallittu.")

    alku_aika = event.alku_aika if event.alku_aika else "00:00"
    loppu_pvm = event.loppu_pvm if event.loppu_pvm else event.alku_pvm
    loppu_aika = event.loppu_aika if event.loppu_aika else "23:59"
    tarkeys = event.tarkeys if event.tarkeys is not None else 0
    new_event = tapahtuma.lisaa_tapahtuma(
        event.nimi, event.alku_pvm, alku_aika, loppu_pvm, loppu_aika, event.kuvaus, event.luokkaus, tarkeys
    )
    return new_event.muunna_sanakirjaksi()

@app.post("/toistuvat_tapahtumat", response_model=List[dict])
def create_repeating_events(event: ToistuvaTapahtumaModel = Body(...)):
    alku_aika = event.alku_aika if event.alku_aika else "00:00"
    loppu_pvm = event.loppu_pvm if event.loppu_pvm else event.alku_pvm
    loppu_aika = event.loppu_aika if event.loppu_aika else "23:59"
    events = toistuva.luo_toistuvat_tapahtumat(
        event.nimi,
        event.alku_pvm,
        alku_aika,
        loppu_pvm,
        loppu_aika,
        event.kuvaus if event.kuvaus is not None else "",
        event.toistuva,
        event.maara,
        event.luokkaus
    )
    return [e.muunna_sanakirjaksi() for e in events]

@app.put("/tapahtumat/{event_id}", response_model=dict)
def update_event(event_id: str, updates: TapahtumaModel):
    import sqlite3
    if updates.luokkaus:
        with sqlite3.connect(tapahtuma.DB_FILE) as conn:
            cur = conn.cursor()
            cur.execute("SELECT DISTINCT luokkaus FROM tapahtumat WHERE luokkaus IS NOT NULL AND luokkaus != ''")
            categories = [row[0] for row in cur.fetchall()]
            cur.execute("SELECT luokkaus FROM tapahtumat WHERE id = ?", (event_id,))
            row = cur.fetchone()
            current_category = row[0] if row else None
            if updates.luokkaus not in categories and len(categories) >= 15:
                raise HTTPException(status_code=400, detail="Maksimi 15 luokkausta sallittu.")

    updated_event = tapahtuma.muokkaa_tapahtuma(
        event_id,
        nimi=updates.nimi,
        alku_pvm=updates.alku_pvm,
        alku_aika=updates.alku_aika,
        loppu_pvm=updates.loppu_pvm,
        loppu_aika=updates.loppu_aika,
        kuvaus=updates.kuvaus,
        luokkaus=updates.luokkaus,
        tarkeys=updates.tarkeys if updates.tarkeys is not None else 0
    )
    if not updated_event:
        raise HTTPException(status_code=404, detail="Tapahtuma ei löydetty.")
    return updated_event.muunna_sanakirjaksi()

@app.delete("/tapahtumat/{event_id}", response_model=dict)
def delete_event(event_id: str):
    event = tapahtuma.hae_tapahtuma(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Tapahtuma ei löydetty.")
    success = tapahtuma.poista_tapahtuma(event_id)
    if not success:
        raise HTTPException(status_code=500, detail="Poisto epäonnistui.")
    return {"deleted": event.muunna_sanakirjaksi()}

@app.delete("/tapahtumat/sarja/{sarja_id}", response_model=dict)
def delete_event_series(sarja_id: str = Path(...)):
    import sqlite3
    with sqlite3.connect(tapahtuma.DB_FILE) as conn:
        cur = conn.cursor()
        cur.execute("DELETE FROM tapahtumat WHERE sarja_id = ?", (sarja_id,))
        conn.commit()
    return {"deleted_sarja_id": sarja_id}

@app.put("/tapahtumat/sarja/{sarja_id}", response_model=dict)
def update_event_series(sarja_id: str, updates: TapahtumaModel):
    import sqlite3
    with sqlite3.connect(tapahtuma.DB_FILE) as conn:
        cur = conn.cursor()
        cur.execute('''
            UPDATE tapahtumat
            SET nimi = ?, alku_pvm = ?, alku_aika = ?, loppu_pvm = ?, loppu_aika = ?, kuvaus = ?, luokkaus = ?, tarkeys = ?
            WHERE sarja_id = ?
        ''', (
            updates.nimi, updates.alku_pvm, updates.alku_aika, updates.loppu_pvm, updates.loppu_aika,
            updates.kuvaus, updates.luokkaus, updates.tarkeys, sarja_id
        ))
        conn.commit()
    return {"updated_sarja_id": sarja_id}

@app.get("/luokkaukset", response_model=List[str])
def get_categories():
    import sqlite3
    with sqlite3.connect(tapahtuma.DB_FILE) as conn:
        cur = conn.cursor()
        cur.execute("SELECT DISTINCT luokkaus FROM tapahtumat WHERE luokkaus IS NOT NULL AND luokkaus != ''")
        return [row[0] for row in cur.fetchall()]

@app.put("/luokkaukset/{old_name}", response_model=dict)
def edit_category(old_name: str, new: dict):
    import sqlite3
    new_name = new.get("new_name")
    if not new_name:
        raise HTTPException(status_code=400, detail="Uusi nimi puuttuu.")
    with sqlite3.connect(tapahtuma.DB_FILE) as conn:
        cur = conn.cursor()
        cur.execute("UPDATE tapahtumat SET luokkaus = ? WHERE luokkaus = ?", (new_name, old_name))
        conn.commit()
    return {"old_name": old_name, "new_name": new_name}

@app.delete("/luokkaukset/{name}", response_model=dict)
def delete_category(name: str):
    import sqlite3
    with sqlite3.connect(tapahtuma.DB_FILE) as conn:
        cur = conn.cursor()
        cur.execute("UPDATE tapahtumat SET luokkaus = NULL WHERE luokkaus = ?", (name,))
        conn.commit()
    return {"deleted": name}

@app.post("/tapahtumat/{event_id}/detach", response_model=dict)
def detach_occurrence(event_id: str):
    import sqlite3
    with sqlite3.connect(tapahtuma.DB_FILE) as conn:
        cur = conn.cursor()
        cur.execute("UPDATE tapahtumat SET sarja_id = NULL WHERE id = ?", (event_id,))
        conn.commit()
    return {"detached": event_id}

print("Backend is starting...")


import os
import sqlite3
import sys
from liikkuvat_paivat import (
    laske_paasiainen, laske_pitkaperjantai, laske_toinen_paasiainen,
    laske_helatorstai, laske_helluntaipaiva, laske_juhannuspaiva,
    laske_pyhainpaiva, laske_aitienpaiva, laske_kaatuneiden_muistopaiva,
    laske_isanpaiva
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__)) # Tämä on tiedoston sijainti
DB_FILE = os.path.join(BASE_DIR, "database", "liikkuvat_juhlat.db") # Tietokannan tiedosto


# Määrittelee liikkuvat juhlapäivät ja niiden laskentafunktiot

liikkuvat_juhlapaivat = [
    ("Pääsiäinen", laske_paasiainen),
    ("Pitkäperjantai", laske_pitkaperjantai),
    ("2. pääsiäispäivä", laske_toinen_paasiainen),
    ("Helatorstai", laske_helatorstai),
    ("Helluntaipäivä", laske_helluntaipaiva),
    ("Juhannuspäivä", laske_juhannuspaiva),
    ("Pyhäinpäivä", laske_pyhainpaiva),
    ("Äitienpäivä", laske_aitienpaiva),
    ("Kaatuneiden muistopäivä", laske_kaatuneiden_muistopaiva),
    ("Isänpäivä", laske_isanpaiva),
]


# Funktiot tietokannan alustamiseen ja tapahtumien lisäämiseen

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


# Funktiot poistaa tapahtumia tietokannasta 

def poista_vuosi(year: int):
    with sqlite3.connect(DB_FILE) as conn:
        cur = conn.cursor()
        cur.execute("DELETE FROM juhla_paivat WHERE pvm LIKE ?", (f"{year:04d}-%",))
        conn.commit()
        print(f"Poistettu kaikki tapahtumat vuodelta {year}.")


# Funktio poistaa kaikki tapahtumat, jotka vastaavat annettua nimeä

def poista_tyyppi(nimi: str):
    with sqlite3.connect(DB_FILE) as conn:
        cur = conn.cursor()
        cur.execute("DELETE FROM juhla_paivat WHERE nimi = ?", (nimi,))
        conn.commit()
        print(f"Poistettu kaikki tapahtumat nimellä '{nimi}'.")


# Pääohjelma, joka luo tietokannan ja lisää liikkuvat juhlapäivät

def main():
    if len(sys.argv) > 1:
        if sys.argv[1] == "poista_vuosi" and len(sys.argv) == 3:
            try:
                year = int(sys.argv[2])
                poista_vuosi(year)
            except ValueError:
                print("Anna vuosi kokonaislukuna.")
            return
        elif sys.argv[1] == "poista_tyyppi" and len(sys.argv) == 3:
            poista_tyyppi(sys.argv[2])
            return
        else:


            # Tulostaa ohjeet, jos argumentit eivät ole oikein
            
            print("Käyttö:")
            print("  python3 luo_liikkuvat_juhlat.py           # Luoo tietokannan")
            print("  python3 luo_liikkuvat_juhlat.py poista_vuosi VUOSI")
            print("  python3 luo_liikkuvat_juhlat.py poista_tyyppi 'Tapahtuman nimi'")
            return


    # Alustaa tietokannan ja lisää liikkuvat juhlapäivät

    alusta_tietokanta()
    for year in range(0, 10001):
        for nimi, laskuri in liikkuvat_juhlapaivat:
            try:
                paiva = laskuri(year)
                pvm = paiva.strftime("%Y-%m-%d")
                lisaa_juhla_pv(pvm, nimi)
            except Exception:
                continue
        if year % 1000 == 0:
            print(f"Vuosi: {year}")

if __name__ == "__main__":
    main()
# Lily-Calendar

**Lily-Calendar** on selainpohjainen kalenterisovellus, jossa voit lisätä, muokata ja poistaa tapahtumia, hallita toistuvia tapahtumia, käyttää luokkauksia (kategorioita), suodattaa tapahtumia ja tarkastella sekä kuukausi- että viikkonäkymää. Sovellus näyttää myös kiinteät ja liikkuvat juhlapäivät.

### HOX!
**Ohjelma on silti W.I.P**, ja aijon tulla lisäämään enemmän ominaisuuksia tehdäkseen ohjelmasta helpommaksi käyttää kaikille. :)

## Ominaisuudet

- **Tapahtumien hallinta:** Lisää, muokkaa ja poista tapahtumia helposti.
- **Toistuvat tapahtumat:** Luo tapahtumia, jotka toistuvat päivittäin, viikoittain, kuukausittain tai mukautetulla jaksolla.
- **Luokkaukset:** Jaa tapahtumat kategorioihin ja hallitse luokkauksia (max 15 kategoriaa).
- **Tärkeys:** Merkitse tapahtumat tärkeiksi tai erittäin tärkeiksi.
- **Suodatus:** Suodata tapahtumia päivämäärän, kategorian, tärkeyden tai hakusanan perusteella. Pikasuodattimet esim. "tällä viikolla", "tänään", "seuraavat X päivää".
- **Juhlapäivät:** Näyttää sekä kiinteät että liikkuvat juhlapäivät kalenterissa.
- **Kuukausi- ja viikkonäkymä:** Vaihda näkymää helposti.
- **Responsiivinen käyttöliittymä:** Toimii myös mobiililaitteilla.

## Tekninen toteutus

- **Frontend:** HTML, CSS, JavaScript (ei kirjastoja, kaikki koodi omana tiedostona).
- **Backend:** Python (FastAPI), SQLite-tietokanta.
- **API:** REST-rajapinta tapahtumien, toistuvien tapahtumien, luokkausten ja juhlapäivien hallintaan.

## Asennus ja käyttöönotto

1. **Backend**
    - Siirry `backend`-kansioon.
    - Asenna riippuvuudet:
      ```
      pip install fastapi uvicorn
      ```
    - Käynnistä palvelin:
      ```
      uvicorn api:app --reload --host 0.0.0.0 --port 8080
      ```

2. **Frontend**
    - Avaa `frontend/index.html` selaimessa (voit käyttää esim. Live Server -lisäosaa tai yksinkertaista HTTP-palvelinta).
    - Varmista, että backend on käynnissä osoitteessa `localhost:8080`.

## Tiedostorakenne

```
lily-calendar/
├── backend/
│   ├── api.py
│   ├── tapahtuma.py
│   ├── toistuva.py
│   ├── juhla_paivat.py
│   └── database/
├── frontend/
│   ├── index.html
│   ├── script/
│   │   ├── main.js
│   │   ├── tapahtuma_lomake.js
│   │   ├── tapahtuma_lista.js
│   │   ├── tapahtumat.js
│   │   ├── luokkaus.js
│   │   ├── nyky_paivamaara.js
│   │   └── ui/
│   │       ├── kuukausi_ui.js
│   │       └── viikko_ui.js
│   └── style/
│       └── perusrakennus.css
```

## Käyttö

1. **Tapahtuman lisääminen:** Klikkaa "Lisää tapahtuma", täytä lomake ja tallenna.
2. **Toistuva tapahtuma:** Valitse toistuvuus ja määrittele toistoehdot.
3. **Tapahtumien muokkaus/poisto:** Listasta löytyy muokkaus- ja poistopainikkeet.
4. **Luokkaukset:** Lisää, muokkaa ja poista kategorioita vasemman reunan hallintapaneelista.
5. **Suodatus:** Käytä pikasuodattimia tai lisäasetuksia rajataksesi näkyviä tapahtumia.
6. **Näkymän vaihto:** Vaihda kuukausi- ja viikkonäkymän välillä yläreunan painikkeesta.

## Kehittäjälle

- **Backendin laajennus:** Lisää uusia kenttiä tapahtumiin päivittämällä tietokanta, backendin mallit ja API.
- **Frontendin laajennus:** Lisää uusia suodattimia tai näkymiä muokkaamalla JS-tiedostoja.
- **Debuggaus:** Käytä selaimen kehitystyökaluja frontendin virheiden selvittämiseen ja FastAPIn lokitietoja backendin virheisiin.

---

**Tekijä:** Alina S. / ofvalleys (2025)
import uuid
from datetime import datetime, timedelta
from typing import List, Optional
import tapahtuma as tapahtuma
from dateutil.relativedelta import relativedelta

def luo_toistuvat_tapahtumat(
    nimi: str,
    alku_pvm: str,
    alku_aika: str,
    loppu_pvm: str,
    loppu_aika: str,
    kuvaus: str,
    toistuva: str,  # "päivä", "viikko", "kuukausi"
    maara: int = 1,
    luokkaus: Optional[str] = None,
    viikonpaivat: Optional[List[int]] = None,  # 0=ma, 6=su
    custom_interval: Optional[int] = None,  # e.g. joka 3. päivä
    loppuu_pvm: Optional[str] = None
) -> List[tapahtuma.Tapahtuma]:

    alku_dt = datetime.strptime(f"{alku_pvm} {alku_aika}", "%Y-%m-%d %H:%M")
    loppu_dt = datetime.strptime(f"{loppu_pvm} {loppu_aika}", "%Y-%m-%d %H:%M")
    tapahtumat = []
    count = 0
    current_alku = alku_dt
    current_loppu = loppu_dt
    sarja_id = str(uuid.uuid4())

    original_day = alku_dt.day

    while True:
        if loppuu_pvm:
            if current_alku.date() > datetime.strptime(loppuu_pvm, "%Y-%m-%d").date():
                break
        elif count >= maara:
            break

        # Viikkotoisto tietyille viikonpäiville
        if toistuva == "viikko" and viikonpaivat:
            weekday = current_alku.weekday()
            if weekday in viikonpaivat:
                tapahtumat.append(
                    tapahtuma.lisaa_tapahtuma(
                        nimi,
                        current_alku.strftime("%Y-%m-%d"),
                        current_alku.strftime("%H:%M"),
                        current_loppu.strftime("%Y-%m-%d"),
                        current_loppu.strftime("%H:%M"),
                        kuvaus,
                        luokkaus,
                        sarja_id=sarja_id
                    )
                )
                count += 1

            current_alku += timedelta(days=1)
            current_loppu += timedelta(days=1)
            continue

        # Muut toistotyypit
        tapahtumat.append(
            tapahtuma.lisaa_tapahtuma(
                nimi,
                current_alku.strftime("%Y-%m-%d"),
                current_alku.strftime("%H:%M"),
                current_loppu.strftime("%Y-%m-%d"),
                current_loppu.strftime("%H:%M"),
                kuvaus,
                luokkaus,
                sarja_id=sarja_id
            )
        )
        count += 1

        # Päivä, viikko, tai kuukausi toistot

        if toistuva == "päivä":
            interval = custom_interval or 1
            current_alku += timedelta(days=interval)
            current_loppu += timedelta(days=interval)
        elif toistuva == "viikko":
            interval = custom_interval or 1
            current_alku += timedelta(weeks=interval)
            current_loppu += timedelta(weeks=interval)
        elif toistuva == "kuukausi":
            interval = custom_interval or 1
            next_alku = current_alku + relativedelta(months=interval)
            next_loppu = current_loppu + relativedelta(months=interval)
            try:
                current_alku = next_alku.replace(day=original_day)
            except ValueError:
                # Jos päivämäärä ei ole sallittu kuukaudessa, käytetään kuukauden viimeistä päivää
                last_day = (next_alku + relativedelta(day=31)).day
                current_alku = next_alku.replace(day=last_day)
            try:
                current_loppu = next_loppu.replace(day=original_day)
            except ValueError:
                last_day = (next_loppu + relativedelta(day=31)).day
                current_loppu = next_loppu.replace(day=last_day)
        else:
            break

    return tapahtumat
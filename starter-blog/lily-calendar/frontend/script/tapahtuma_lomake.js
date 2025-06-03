document.getElementById('tapahtumaLomake').addEventListener('submit', async function(event) {
    event.preventDefault();

    // Tarkistaa, että kaikki pakolliset kentät on täytetty

    const data = {
        nimi: document.getElementById('nimi').value,
        alku_pvm: document.getElementById('alku_pvm').value,
        alku_aika: document.getElementById('alku_aika').value,
        loppu_pvm: document.getElementById('loppu_pvm').value,
        loppu_aika: document.getElementById('loppu_aika').value,
        kuvaus: document.getElementById('kuvaus').value,
        luokkaus: document.getElementById('luokkaus').value.trim(),
        tarkeys: parseInt(document.getElementById('tarkeys').value, 10)
    };

    // Tarkistaa, että nimi ja luokkaus on annettu ja että alku- ja loppupäivämäärät ovat kelvollisia

    // Toistuvien tapahtumien käsittely
    // Jos toistuva tapahtuma on valittu, lisätään tarvittavat kentät data-objektiin

    const toistuva = document.getElementById('toistuva').value;
    if (toistuva) {
        data.toistuva = toistuva;
        data.maara = parseInt(document.getElementById('toistuva_maara').value, 10) || 1;
        const loppuu_pvm = document.getElementById('toistuva_loppuu_pvm').value;
        if (loppuu_pvm) data.loppuu_pvm = loppuu_pvm;
        const interval = parseInt(document.getElementById('toistuva_interval').value, 10);
        if (interval > 1) data.custom_interval = interval;
        if (toistuva === 'viikko') {
            data.viikonpaivat = Array.from(document.querySelectorAll('#viikonpaivat_valinta input:checked')).map(cb => parseInt(cb.value, 10));
        }

        // Toistuvien tapahtumien lisäys
        // Lähetetään POST-pyyntö toistuvien tapahtumien API:lle

        const response = await fetch('http://localhost:8080/toistuvat_tapahtumat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const error = await response.json();
            document.getElementById('kategoriaVaroitus').textContent = error.detail || 'Virhe toistuvien tapahtumien lisäyksessä.';
            return;
        }
        await haeLuokkaukset();
        await haeTapahtumat();
        event.target.reset();
        location.reload();
        return;
    }

    // Yksittäisen tapahtuman lisäys

    const response = await lisaaTapahtuma(data);
    if (!response.ok) {
        const error = await response.json();
        document.getElementById('kategoriaVaroitus').textContent = error.detail || 'Virhe tapahtuman lisäyksessä.';
        return;
    }
    await haeLuokkaukset();
    await haeTapahtumat();
    event.target.reset();
});

// Tyhjentää lomakkeen ja poistaa mahdolliset varoitukset

document.getElementById('cleartapahtumaLomakeNappi').onclick = function() {
    document.getElementById('tapahtumaLomake').reset();
    document.getElementById('kategoriaVaroitus').textContent = '';
};

// Näyttää tai piilottaa toistuvan tapahtuman lisävalinnat
// Kun käyttäjä valitsee toistuvan tapahtuman, näytetään lisävalinnat

document.getElementById('toistuva').addEventListener('change', function() {
    const val = this.value;
    document.getElementById('toistuvaLisavalinnat').style.display = val ? 'block' : 'none';
    document.getElementById('viikonpaivat_valinta').style.display = val === 'viikko' ? 'block' : 'none';
    document.getElementById('kuukausiHelper').style.display = val === 'kuukausi' ? 'inline' : 'none';

    const intervalLabel = document.querySelector('label[for="toistuva_interval"]');
    if (val === 'päivä') {
        intervalLabel.textContent = 'Väli (esim. joka 2. päivä):';
    } else if (val === 'viikko') {
        intervalLabel.textContent = 'Väli (esim. joka 2. viikko):';
    } else if (val === 'kuukausi') {
        intervalLabel.textContent = 'Väli (esim. joka 2. kuukausi):';
    } else {
        intervalLabel.textContent = 'Väli (esim. joka 2. päivä):';
    }

    // Piilottaa toistuvan tapahtuman lisävalinnat, jos toistuvaa ei ole valittu
});

// Näyttää muokkauslomakkeen ja täyttää sen tapahtuman tiedoilla

window.naytaMuokkausLomake = function(event, editAll = false) {
    document.getElementById('editTapahtumaModal').style.display = 'block';
    document.getElementById('edit_id').value = event.id;
    document.getElementById('edit_nimi').value = event.nimi;
    document.getElementById('edit_alku_pvm').value = event.alku_pvm;
    document.getElementById('edit_alku_aika').value = event.alku_aika;
    document.getElementById('edit_loppu_pvm').value = event.loppu_pvm;
    document.getElementById('edit_loppu_aika').value = event.loppu_aika;
    document.getElementById('edit_kuvaus').value = event.kuvaus;
    document.getElementById('edit_luokkaus').value = event.luokkaus;
    document.getElementById('edit_tarkeys').value = event.tarkeys || "0";
    document.getElementById('tapahtumaModal').style.display = 'none';
    
    // Asettaa muokkauslomakkeen datattributit

    document.getElementById('editTapahtumaLomake').dataset.editAll = editAll ? "1" : "";
    document.getElementById('editTapahtumaLomake').dataset.sarjaId = event.sarja_id || "";
};

// Sulkee muokkauslomakkeen ja palauttaa tapahtumalomakkeen näkyviin

document.getElementById('peruutaEdit').onclick = function() {
    document.getElementById('editTapahtumaModal').style.display = 'none';
};

// Peruuta muokkaus ja palaa tapahtumalomakkeeseen

document.getElementById('peruutaEdit').onclick = function() {
    document.getElementById('editTapahtumaLomake').style.display = 'none';
    document.getElementById('tapahtumaLomake').style.display = 'block';
};

// Muokkaa tapahtumaa ja päivitä se palvelimelle

document.getElementById('editTapahtumaLomake').addEventListener('submit', async function(ev) {
    ev.preventDefault();
    const id = document.getElementById('edit_id').value;
    const data = {
        nimi: document.getElementById('edit_nimi').value,
        alku_pvm: document.getElementById('edit_alku_pvm').value,
        alku_aika: document.getElementById('edit_alku_aika').value,
        loppu_pvm: document.getElementById('edit_loppu_pvm').value,
        loppu_aika: document.getElementById('edit_loppu_aika').value,
        kuvaus: document.getElementById('edit_kuvaus').value,
        luokkaus: document.getElementById('edit_luokkaus').value.trim(),
        tarkeys: parseInt(document.getElementById('edit_tarkeys').value, 10)
    };
    const editAll = this.dataset.editAll === "1";
    const sarjaId = this.dataset.sarjaId;
    if (editAll && sarjaId) {
        await fetch(`http://localhost:8080/tapahtumat/sarja/${sarjaId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    } else {
        await muokkaaTapahtuma(id, data);
    }
    document.getElementById('editTapahtumaLomake').style.display = 'none';
    document.getElementById('tapahtumaLomake').style.display = 'block';
    await haeLuokkaukset();
    await haeTapahtumat();
});
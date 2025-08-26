let nykyisetLuokkaukset = []; // Tämä on luokkauksien lista, joka haetaan palvelimelta
let kaikkiTapahtumat = []; // Tämä on kaikkien tapahtumien lista, joka haetaan palvelimelta
window.kaikkiJuhlaPaivat = []; // Tämä on kaikkien juhlapäivien lista, joka haetaan palvelimelta
window.kaikkiLiikkuvatJuhlaPaivat = []; // Tämä on kaikkien liikkuvien juhlapäivien lista, joka haetaan palvelimelta

// Tämä on nykyinen kuukausi, jota käytetään tapahtumien renderöinnissä

async function haeLuokkaukset() {
    const response = await fetch('http://localhost:8080/luokkaukset');
    nykyisetLuokkaukset = await response.json();
    window.paivitaLuokkausLista();
    window.paivitaLuokkausDatalist();
    window.paivitaLuokkausFilter();
}

// Tämä funktio hakee kaikki tapahtumat palvelimelta ja asettaa ne globaaliksi muuttujaksi

async function haeTapahtumat() {
    const response = await fetch('http://localhost:8080/tapahtumat');
    window.kaikkiTapahtumat = await response.json();
    window.naytaTulevatJaKaynnissa();
    if (typeof renderkuukausi === "function") {
        renderkuukausi(currentMonth, window.kaikkiTapahtumat);
    }
}

// Tämä funktio lisää uuden luokituksen palvelimelle

async function lisaaTapahtuma(data) {
    return await fetch('http://localhost:8080/tapahtumat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
}

// Tämä funktio muokkaa olemassa olevaa tapahtumaa palvelimella

async function muokkaaTapahtuma(id, data) {
    return await fetch(`http://localhost:8080/tapahtumat/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
}

// Tämä funktio poistaa tapahtuman palvelimelta

async function poistaTapahtuma(id) {
    return await fetch(`http://localhost:8080/tapahtumat/${id}`, { method: 'DELETE' });
}

// Tämä funktio hakee kaikki juhlapäivät palvelimelta

async function haeJuhlaPaivat() {
    const response = await fetch('http://localhost:8080/juhlapäivät');
    window.kaikkiJuhlaPaivat = await response.json();
}

// Tämä funktio hakee kaikki liikkuvat juhlapäivät palvelimelta

async function haeLiikkuvatJuhlaPaivat(year) {
    const response = await fetch(`http://localhost:8080/liikkuvat_juhlapäivät/${year}`);
    window.kaikkiLiikkuvatJuhlaPaivat = await response.json();
}

// Tämä funktio päivittää juhlapäivät ja liikkuvat juhlapäivät

async function paivitaJuhlaPaivat(year) {
    await haeJuhlaPaivat();
    await haeLiikkuvatJuhlaPaivat(year);
}

// Tämä on nykyinen kuukausi, jota käytetään tapahtumien renderöinnissä

async function alusta() {
    await haeLuokkaukset();
    await haeTapahtumat();
    const year = currentMonth.getFullYear();
    await paivitaJuhlaPaivat(year);
    if (typeof renderkuukausi === "function") {
        renderkuukausi(currentMonth, window.kaikkiTapahtumat);
    }
}

// Tämä funktio näyttää tulevat ja käynnissä olevat tapahtumat

alusta();

window.showtapahtumaModal = function() {
    document.getElementById('tapahtumaModal').style.display = 'block';
};
window.hidetapahtumaModal = function() {
    document.getElementById('tapahtumaModal').style.display = 'none';
    document.getElementById('tapahtumaLomake').reset();
    document.getElementById('kategoriaVaroitus').textContent = '';
};
window.showeditTapahtumaModal = function() {
    document.getElementById('editTapahtumaModal').style.display = 'block';
};
window.hideeditTapahtumaModal = function() {
    document.getElementById('editTapahtumaModal').style.display = 'none';
    document.getElementById('editTapahtumaLomake').reset();
};

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('closetapahtumaModal').onclick = window.hidetapahtumaModal;
    document.getElementById('suljeEditTapahtumaModal').onclick = window.hideeditTapahtumaModal;
    document.getElementById('peruutaEdit').onclick = window.hideeditTapahtumaModal;

    document.getElementById('openTapahtumaModalNappi').onclick = window.showtapahtumaModal;
});

// Tämä funktio näyttää muokkauslomakkeen tapahtumalle

window.naytaMuokkausLomake = function(event) {
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
};
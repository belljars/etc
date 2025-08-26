function getFilters() { // Hakee suodattimet lomakkeelta
    return {
        from: document.getElementById('suodataPaivamaarasta').value,
        to: document.getElementById('suodataPaivamaaraan').value,
        category: document.getElementById('suodatinKategoria').value,
        importance: document.getElementById('suodataTarkeys').value,
        keyword: document.getElementById('suodataAvainsanat').value.trim().toLowerCase(),
        quick: document.getElementById('pikasuodatin').value,
        quickX: parseInt(document.getElementById('pikasuodatinX').value, 10) || 1
    };
}

// Tämä funktio ottaa tapahtumat ja suodattimet, ja palauttaa vain ne tapahtumat, jotka täsmäävät suodattimiin

function filtertapahtumat(tapahtumat, filters) {
    const now = new Date();
    let todayStr = now.toISOString().slice(0, 10);

    let start, end;
    if (filters.quick === "tanaan") {
        start = todayStr;
        end = todayStr;
    } else if (filters.quick === "tämäviikko") {
        const day = now.getDay() === 0 ? 6 : now.getDay() - 1;
        const monday = new Date(now);
        monday.setDate(now.getDate() - day);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        start = monday.toISOString().slice(0, 10);
        end = sunday.toISOString().slice(0, 10);
    } else if (filters.quick === "tämäkuukausi") {
        const first = new Date(now.getFullYear(), now.getMonth(), 1);
        const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        start = first.toISOString().slice(0, 10);
        end = last.toISOString().slice(0, 10);
    } else if (filters.quick === "menneetX") {
        const past = new Date(now);
        past.setDate(now.getDate() - filters.quickX + 1);
        start = past.toISOString().slice(0, 10);
        end = todayStr;
    } else if (filters.quick === "tulevatX") {
        const future = new Date(now);
        future.setDate(now.getDate() + filters.quickX - 1);
        start = todayStr;
        end = future.toISOString().slice(0, 10);
    }

    // Suodattaa tapahtumat suodattimien perusteella

    return tapahtumat.filter(e => {
        if (filters.from && e.alku_pvm < filters.from) return false;
        if (filters.to && e.loppu_pvm > filters.to) return false;
        if (filters.category && e.luokkaus !== filters.category) return false;
        if (filters.importance !== "" && String(e.tarkeys) !== filters.importance) return false;
        if (filters.keyword) {
            const name = (e.nimi || "").toLowerCase();
            const desc = (e.kuvaus || "").toLowerCase();
            if (!name.includes(filters.keyword) && !desc.includes(filters.keyword)) return false;
        }
        if (filters.quick && start && end) {
            if (e.loppu_pvm < start || e.alku_pvm > end) return false;
        }
        return true;
    });
}

// Tämä funktio renderöi tapahtumat HTML:ään, ottaen huomioon suodattimet

function rendertapahtumat(tapahtumat, skipFilters = false) {
    let filteredtapahtumat = tapahtumat;
    if (!skipFilters) {
        const filters = getFilters();
        filteredtapahtumat = filtertapahtumat(tapahtumat, filters);
    }

    // Järjestää tapahtumat alku- ja loppupäivämäärän mukaan

    const sortedtapahtumat = filteredtapahtumat
        .filter(e => e.alku_pvm && e.alku_aika)
        .sort((a, b) => {
            const aStart = new Date(`${a.alku_pvm}T${a.alku_aika}`);
            const bStart = new Date(`${b.alku_pvm}T${b.alku_aika}`);
            return aStart - bStart;
        });

    // Järjestää tapahtumat, joissa ei ole alku- ja loppupäivämäärää, viimeiseksi

    const tapahtumatDiv = document.getElementById('tapahtumat');
    if (sortedtapahtumat.length === 0) { // Jos suodatettuja tapahtumia ei ole, näytetään viesti
        tapahtumatDiv.innerHTML = '<div style="text-align:center; color:#888; padding:30px 0; margin: none;"><p>Näyttää siltä, että täällä ei ole vielä tapahtumia!</p><br><p></p></div>';
        return;
    }

    tapahtumatDiv.innerHTML = sortedtapahtumat.map(e => {
        let kesto = '';
        if (e.alku_pvm && e.alku_aika && e.loppu_pvm && e.loppu_aika) {
            const start = new Date(`${e.alku_pvm}T${e.alku_aika}`);
            const end = new Date(`${e.loppu_pvm}T${e.loppu_aika}`);
            const diffMs = end - start;
            const diffHours = diffMs / (1000 * 60 * 60);
            if (diffHours >= 24) {
                kesto = 'Koko päivä';
            } else if (diffHours > 0) {
                const hours = Math.floor(diffHours);
                const minutes = Math.round((diffHours - hours) * 60);
                kesto = `${hours}h ${minutes}min`;
            }
        }
        
        // Määrittää tärkeysluokan

        let importanceClass = "tapahtuma-ei-tarkea";
        if (e.tarkeys === 1) importanceClass = "tapahtuma-tarkea";
        if (e.tarkeys === 2) importanceClass = "tapahtuma-erittain-tarkea";

        let html = `<div class="tapahtuma-lista-item ${importanceClass}" data-id="${e.id}">
    <div class="tapahtuma-lista-flex">
        <div class="tapahtuma-lista-content">
            <strong>${e.nimi}</strong><br><span style="color:#555;">`;

if (e.alku_pvm && e.alku_aika) {
    html += `${e.alku_pvm} ${e.alku_aika}`;
} else if (e.alku_pvm) {
    html += `${e.alku_pvm}`;
}

if (e.loppu_pvm && e.loppu_aika) {
    if (e.loppu_pvm !== e.alku_pvm) {
        html += ` - ${e.loppu_pvm} ${e.loppu_aika}`;
    } else {
        html += ` - ${e.loppu_aika}`;
    }
} else if (e.loppu_aika) {
    html += ` - ${e.loppu_aika}`;
}

html += `</span><br>`;

        if (e.kuvaus) {
            html += `${e.kuvaus}<br>`;
        }
        if (e.luokkaus) {
            html += `${e.luokkaus}<br>`;
        }
        if (e.tarkeys !== undefined) {
            const importanceText = e.tarkeys === 2 ? 'Erittäin tärkeä' : e.tarkeys === 1 ? 'Tärkeä' : 'Ei tärkeä';
            html += `${importanceText}<br>`;
        }

        html += `</div>
        <div class="tapahtuma-lista-buttons">
            <button class="edit-Nappi" data-id="${e.id}">Muokkaa</button>
            <button class="delete-Nappi" data-id="${e.id}">Poista</button>
        </div>
    </div>
</div>`;
        return html;
    }).join('');

    // Lisää tapahtumien muokkaus- ja poistonapit

    document.querySelectorAll('.delete-Nappi').forEach(Nappi => {
        Nappi.addEventListener('click', async (ev) => {
            const id = ev.target.getAttribute('data-id');
            const event = kaikkiTapahtumat.find(e => e.id === id);
            if (event && event.sarja_id) { // Jos tapahtuma on osa sarjaa
                const choice = prompt(
                    "Poista toistuva tapahtuma:\n1 = Vain tämä\n2 = Kaikki toistuvat\n3 = Poista vain tämä ja irrota sarjasta",
                    "1"
                );
                if (choice === "1") {
                    await fetch(`http://localhost:8080/tapahtumat/${id}`, { method: 'DELETE' });
                } else if (choice === "2") {
                    await fetch(`http://localhost:8080/tapahtumat/sarja/${event.sarja_id}`, { method: 'DELETE' });
                } else if (choice === "3") {
                    await fetch(`http://localhost:8080/tapahtumat/${id}/detach`, { method: 'POST' });
                    await fetch(`http://localhost:8080/tapahtumat/${id}`, { method: 'DELETE' });
                }
            } else {
                await fetch(`http://localhost:8080/tapahtumat/${id}`, { method: 'DELETE' });
            }

            await haeLuokkaukset();
            await haeTapahtumat();
            return;
        });
    });

    // Lisää tapahtumien muokkausnapit

    document.querySelectorAll('.edit-Nappi').forEach(Nappi => {
        Nappi.addEventListener('click', (ev) => {
            const id = ev.target.getAttribute('data-id');
            const event = sortedtapahtumat.find(e => e.id === id);
            if (event) {
                if (event.sarja_id) {
                    const choice = prompt(
                        "Muokkaa toistuvaa tapahtumaa:\n1 = Vain tämä\n2 = Kaikki toistuvat\n3 = Muuta vain tämä ja irrota sarjasta",
                        "1"
                    );
                    if (choice === "1") {
                        window.naytaMuokkausLomake(event, false);
                    } else if (choice === "2") {
                        window.naytaMuokkausLomake(event, true);
                    } else if (choice === "3") {
                        fetch(`http://localhost:8080/tapahtumat/${id}/detach`, { method: 'POST' })
                          .then(() => window.naytaMuokkausLomake({ ...event, sarja_id: null }, false));
                    }
                } else {
                    window.naytaMuokkausLomake(event, false);
                }
            }
        });
    });
}

// Tämä funktio hakee kaikki tapahtumat palvelimelta ja renderöi ne

window.rendertapahtumat = rendertapahtumat;

function filterAndRender() {
    window.rendertapahtumat(window.kaikkiTapahtumat);
}
document.getElementById('suodatinKategoria').addEventListener('change', filterAndRender);
document.getElementById('suodataTarkeys').addEventListener('change', filterAndRender);
document.getElementById('suodataAvainsanat').addEventListener('input', filterAndRender);
document.getElementById('suodataPaivamaarasta').addEventListener('input', filterAndRender);
document.getElementById('suodataPaivamaaraan').addEventListener('input', filterAndRender);
document.getElementById('pikasuodatin').addEventListener('change', function() {
    const val = this.value;
    const xInput = document.getElementById('pikasuodatinX');
    if (val === 'menneetX' || val === 'tulevatX') {
        xInput.style.display = '';
    } else {
        xInput.style.display = 'none';
    }
    filterAndRender();
});
document.getElementById('pikasuodatinX').addEventListener('input', filterAndRender);
document.getElementById('suodataPaivamaarasta').addEventListener('change', filterAndRender);
document.getElementById('suodataPaivamaaraan').addEventListener('change', filterAndRender);

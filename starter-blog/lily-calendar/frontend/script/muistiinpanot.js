async function haeMuistiinpanot() {
    const res = await fetch('http://localhost:8000/muistiinpanot');
    const data = await res.json();
    window.kaikkiMuistiinpanot = data;
    const div = document.getElementById('muistiin');
    div.innerHTML = data.map(note => {

        let typeClass = '';
        let label = '';
        switch (note.aikajana) {
            case 'm_paiva':
                typeClass = 'muistiin-paiva'; label = 'Päivä'; break;
            case 'm_viikko':
                typeClass = 'muistiin-viikko'; label = 'Viikko'; break;
            case 'm_kuukausi':
                typeClass = 'muistiin-kuukausi'; label = 'Kuukausi'; break;
            case 'm_vuosi':
                typeClass = 'muistiin-vuosi'; label = 'Vuosi'; break;
            default:
                typeClass = ''; label = note.aikajana;
        }

        let dateStr = note.paivays ? note.paivays : '';
        return `
            <div class="muistiin-note ${typeClass}">
                <span class="muistiin-timestamp">${label}${dateStr ? ': ' + dateStr : ''}</span>
                <span>${note.teksti}</span>
                <button onclick="poistaMuistiinpano(${note.id})">Poista</button>
            </div>
        `;
    }).join('');

    if (typeof renderkuukausi === "function") {
        renderkuukausi(currentMonth, window.kaikkiTapahtumat || []);
    }
}

document.getElementById('openMuistiinModalNappi').onclick = lisaaMuistiinpano;
haeMuistiinpanot();

async function lisaaMuistiinpano() {
    const teksti = document.getElementById('muistiin-teksti').value;
    const aikajana = document.getElementById('muistiin-kategoria').value;
    const paivays = document.getElementById('muistiin-paiva').value;

    if (!paivays) {
        alert("Valitse päivämäärä!");
        return;
    }

    await fetch('http://localhost:8000/muistiinpanot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teksti, aikajana, paivays })
    });
    document.getElementById('muistiin-teksti').value = '';
    document.getElementById('muistiin-paiva').value = '';
    haeMuistiinpanot();
}

async function poistaMuistiinpano(id) {
    await fetch(`http://localhost:8000/muistiinpanot/${id}`, { method: 'DELETE' });
    haeMuistiinpanot();
}

document.getElementById('openMuistiinModalNappi').onclick = lisaaMuistiinpano;
haeMuistiinpanot();

async function haeTodo() {
    const res = await fetch('http://localhost:8000/todo');
    const data = await res.json();
    const div = document.getElementById('to-do');
    div.innerHTML = data.map(todo =>
        `<div>
            <input type="checkbox" ${todo.valmis ? 'checked' : ''} onclick="toggleTodo(${todo.id})">
            <span>${todo.teksti}</span>
            <button onclick="poistaTodo(${todo.id})">Poista</button>
        </div>`
    ).join('');
}
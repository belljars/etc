// Tämä tiedosto sisältää luokkauksen hallintaan liittyvät toiminnot
// Haetaan luokkaukset palvelimelta!

window.paivitaLuokkausLista = function() {
    const ul = document.getElementById('kategoriaLista');
    ul.innerHTML = '';
    nykyisetLuokkaukset.forEach(cat => {
        const li = document.createElement('li');
        li.textContent = cat + ' ';

        // Luoo muokkaus- ja poistonapit
        // Ohjelma kysyy käyttäjältä uuden nimen muokkausta varten
        
        const editNappi = document.createElement('button');
        editNappi.textContent = 'Muokkaa';
        editNappi.onclick = async () => {
            const uusiNimi = prompt('Anna uusi nimi luokkaukselle:', cat);
            if (uusiNimi && uusiNimi !== cat) {
                await fetch(`http://localhost:8080/luokkaukset/${encodeURIComponent(cat)}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ new_name: uusiNimi })
                });
                await haeLuokkaukset();
                await haeTapahtumat();
            }
        };
        li.appendChild(editNappi);

        const delNappi = document.createElement('button');
        delNappi.textContent = 'Poista';
        delNappi.onclick = async () => {
            if (confirm(`Poistetaanko luokkaus "${cat}" kaikista tapahtumista?`)) {
                await fetch(`http://localhost:8080/luokkaukset/${encodeURIComponent(cat)}`, {
                    method: 'DELETE'
                });
                await haeLuokkaukset();
                await haeTapahtumat();
            }
        };
        li.appendChild(delNappi);
        ul.appendChild(li);
    });
};

// Päivittää luokkauksen datalist-elementin
// Tämä on hyödyllinen, kun käyttäjä lisää uuden luokituksen tapahtumaan

window.paivitaLuokkausDatalist = function() {
    const datalist = document.getElementById('luokkaus-lista');
    datalist.innerHTML = '';
    nykyisetLuokkaukset.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        datalist.appendChild(option);
    });
};

// Päivittää luokkauksen suodatinvalikon
// Tämä mahdollistaa suodattamisen luokituksen perusteella

window.paivitaLuokkausFilter = function() {
    const select = document.getElementById('suodatinKategoria');
    if (!select) return;
    select.innerHTML = '<option value="">Kaikki</option>';
    nykyisetLuokkaukset.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        select.appendChild(option);
    });
};
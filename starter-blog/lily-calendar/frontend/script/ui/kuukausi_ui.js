const kuukausiDiv = document.getElementById('kuukausi');
const monthLabel = document.getElementById('kalenteriKuukausiOsoite');
let currentMonth = new Date();
let currentnakyma = 'month';

// Funktio päivittää juhlapäivät ja liikkuvat juhlapäivät
function renderkuukausi(date, tapahtumat = window.kaikkiTapahtumat || []) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

    let html = '<table><tr>';
    const paivat = ['Ma', 'Ti', 'Ke', 'To', 'Pe', 'La', 'Su'];
    paivat.forEach(d => html += `<th>${d}</th>`);
    html += '</tr><tr>';

    // Asetettaa kuukauden ensimmäisen päivän ja viimeisen päivän
    const tanaan = new Date();
    for (let i = 0; i < startDay; i++) html += '<td></td>';
    for (let d = 1; d <= lastDay.getDate(); d++) {
        if ((startDay + d - 1) % 7 === 0 && d !== 1) html += '</tr><tr>';
        const istanaan =
            d === tanaan.getDate() &&
            month === tanaan.getMonth() &&
            year === tanaan.getFullYear();
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

        let juhlaHtml = '';
        if (window.kaikkiJuhlaPaivat) {
            const [cellYear, cellMonth, cellDay] = dateStr.split('-');
            const kaikkiJuhlat = [
                ...(window.kaikkiJuhlaPaivat || []),
                ...(window.kaikkiLiikkuvatJuhlaPaivat || [])
            ];
            const juhla = kaikkiJuhlat.find(j => {
                if (j.pvm === dateStr) return true;
                const [jYear, jMonth, jDay] = j.pvm.split('-');
                return jYear === '0001' && jMonth === cellMonth && jDay === cellDay;
            });
            if (juhla) {
                juhlaHtml = `<div class="juhla-paiva" title="${juhla.nimi}">${juhla.nimi}</div>`;
            }
        }

        // Suodattaa tapahtumat, jotka alkavat tälle päivälle
        const tapahtumatPaivalle = tapahtumat.filter(ev => ev.alku_pvm === dateStr);

        let eventIndicator = '';
        if (tapahtumatPaivalle.some(ev => ev.tarkeys === 2)) {
            eventIndicator = '<span class="event-dot event-dot-erittain-tarkea">!!</span>';
        } else if (tapahtumatPaivalle.some(ev => ev.tarkeys === 1)) {
            eventIndicator = '<span class="event-dot event-dot-tarkea">!</span>';
        } else if (tapahtumatPaivalle.length > 0) {
            eventIndicator = '<span class="event-dot"></span>';
        }

        html += `<td${istanaan ? ' class="tanaan"' : ''} data-date="${dateStr}">
        <div class="paiva-numero">${d}</div>
        ${juhlaHtml ? juhlaHtml : ""}
        ${eventIndicator}
    </td>`;
    }
    html += '</tr></table>';
    kuukausiDiv.innerHTML = html;

    // Asettaa tapahtumien klikkaustapahtumat

    kuukausiDiv.querySelectorAll('td[data-date]').forEach(td => {
        td.addEventListener('click', function(e) {
            const date = this.getAttribute('data-date');
            const alkuPvmInput = document.getElementById('alku_pvm');
            if (alkuPvmInput) alkuPvmInput.value = date;
            const loppuPvmInput = document.getElementById('loppu_pvm');
            if (loppuPvmInput) loppuPvmInput.value = date;
            if (window.showtapahtumaModal) window.showtapahtumaModal();
        });
    });

    const kuukaudet = [
        'Tammikuu', 'Helmikuu', 'Maaliskuu', 'Huhtikuu', 'Toukokuu', 'Kesäkuu',
        'Heinäkuu', 'Elokuu', 'Syyskuu', 'Lokakuu', 'Marraskuu', 'Joulukuu'
    ];
    monthLabel.textContent = `${kuukaudet[month]} ${year}`;
    setNavigationLabels(date, 'month');
}

function getWeekNumber(date) {

    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    const weekNum = Math.ceil((((d - yearStart) / 86400000) + 1)/7);
    return weekNum;
}

function setNavigationLabels(date, mode = 'month') {
    const kuukaudet = [
        'Tammikuu', 'Helmikuu', 'Maaliskuu', 'Huhtikuu', 'Toukokuu', 'Kesäkuu',
        'Heinäkuu', 'Elokuu', 'Syyskuu', 'Lokakuu', 'Marraskuu', 'Joulukuu'
    ];
    if (mode === 'month') {
        const year = date.getFullYear();
        const month = date.getMonth();
        const prevDate = new Date(year, month - 1, 1);
        const nextDate = new Date(year, month + 1, 1);
        document.getElementById('edellinenKuukausi').textContent = `${kuukaudet[prevDate.getMonth()]} ${prevDate.getFullYear()}`;
        document.getElementById('seuraavaKuukausi').textContent = `${kuukaudet[nextDate.getMonth()]} ${nextDate.getFullYear()}`;
    } else if (mode === 'viikko') {
 
        // Asettaa viikon ensimmäisen päivän (maanantai) ja seuraavan viikon
        const monday = new Date(date);
        monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
        const prevMonday = new Date(monday);
        prevMonday.setDate(monday.getDate() - 7);
        const nextMonday = new Date(monday);
        nextMonday.setDate(monday.getDate() + 7);
        document.getElementById('edellinenKuukausi').textContent = `Viikko ${getWeekNumber(prevMonday)}, ${prevMonday.getFullYear()}`;
        document.getElementById('seuraavaKuukausi').textContent = `Viikko ${getWeekNumber(nextMonday)}, ${nextMonday.getFullYear()}`;
    }
}

// Tämä funktio päivittää juhlapäivät ja liikkuvat juhlapäivät
document.getElementById('edellinenKuukausi').onclick = async () => {
    if (currentnakyma === 'month') {
        currentMonth.setMonth(currentMonth.getMonth() - 1);
        await paivitaJuhlaPaivat(currentMonth.getFullYear());
        renderkuukausi(currentMonth, window.kaikkiTapahtumat || []);
    } else {
        currentMonth.setDate(currentMonth.getDate() - 7);
        await paivitaJuhlaPaivat(currentMonth.getFullYear());
        window.renderviikko(currentMonth);
    }
};

// Siirtyy seuraavaan kuukauteen tai viikkoon
document.getElementById('seuraavaKuukausi').onclick = async () => {
    if (currentnakyma === 'month') {
        currentMonth.setMonth(currentMonth.getMonth() + 1);
        await paivitaJuhlaPaivat(currentMonth.getFullYear());
        renderkuukausi(currentMonth, window.kaikkiTapahtumat || []);
    } else {
        currentMonth.setDate(currentMonth.getDate() + 7);
        await paivitaJuhlaPaivat(currentMonth.getFullYear());
        window.renderviikko(currentMonth);
    }
};

// Vaihtaa näkymän kuukausi- ja viikkonäkymän välillä
document.getElementById('vaihdaNakemys').onclick = () => {
	if (currentnakyma === 'month') {
		currentnakyma = 'viikko';
		document.body.classList.add('week-view-active');
		window.renderviikko(currentMonth);
		document.getElementById('vaihdaNakemys').textContent = 'Kuukausinäkymä';
	} else {
		currentnakyma = 'month';
		document.body.classList.remove('week-view-active');
		renderkuukausi(currentMonth, window.kaikkiTapahtumat || []);
		document.getElementById('vaihdaNakemys').textContent = 'Viikkonäkymä';
	}
};
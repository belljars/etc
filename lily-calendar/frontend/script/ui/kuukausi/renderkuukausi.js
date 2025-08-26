import { setNavigationLabels } from './navigation.js';

export function renderkuukausi(date, tapahtumat = window.kaikkiTapahtumat || []) {
    const kuukausiDiv = document.getElementById('kuukausi');
    const monthLabel = document.getElementById('kalenteriKuukausiOsoite');
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

    let html = '<table><tr>';
    const paivat = ['Ma', 'Ti', 'Ke', 'To', 'Pe', 'La', 'Su'];
    paivat.forEach(d => html += `<th>${d}</th>`);
    html += '</tr><tr>';

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

        const tapahtumatPaivalle = tapahtumat.filter(ev => ev.alku_pvm === dateStr);

        // Etsii pääasiallisen tapahtuman tälle päivälle

        let mainEvent = null;
        if (tapahtumatPaivalle.length > 0) {

            // Järjestää tapahtumat tärkeyden mukaan, eli 2 > 1 > 0

            tapahtumatPaivalle.sort((a, b) => (b.tarkeys || 0) - (a.tarkeys || 0));
            mainEvent = tapahtumatPaivalle[0];
        }

        // Näyttää pääasiallisen tapahtuman, jos sellainen on

        let eventHtml = '';
        if (tapahtumatPaivalle.length > 0) {

            tapahtumatPaivalle.sort((a, b) => (b.tarkeys || 0) - (a.tarkeys || 0));

            tapahtumatPaivalle.slice(0, 3).forEach(ev => {
                let importanceClass = "tapahtuma-ei-tarkea";
                if (ev.tarkeys === 1) importanceClass = "tapahtuma-tarkea";
                if (ev.tarkeys === 2) importanceClass = "tapahtuma-erittain-tarkea";
                eventHtml += `<div class="kuukausi-event ${importanceClass}" title="${ev.nimi}">${ev.nimi}</div>`;
            });

            if (tapahtumatPaivalle.length > 3) {
                eventHtml += `<span class="event-count-badge" title="Lisää tapahtumia">${tapahtumatPaivalle.length}+</span>`;
            }
        }

        html += `<td${istanaan ? ' class="tanaan"' : ''} data-date="${dateStr}" style="position:relative;">
        <div class="paiva-numero">${d}</div>
        ${juhlaHtml ? juhlaHtml : ""}
        ${eventHtml}
    </td>`;
    }
    html += '</tr></table>';
    kuukausiDiv.innerHTML = html;

    // Asettaa navigointinäkymän päivämäärät
    
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
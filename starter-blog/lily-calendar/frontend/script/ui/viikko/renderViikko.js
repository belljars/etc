import { getMonday } from './getMonday.js';
import { getWeekNumber } from './weekNumber.js';

const viikkopaivat = ['Ma', 'Ti', 'Ke', 'To', 'Pe', 'La', 'Su'];

export function renderViikko(date) {
    const kuukausiDiv = document.getElementById('kuukausi');
    const monthLabel = document.getElementById('kalenteriKuukausiOsoite');
    const monday = getMonday(date);

    let html = '<div class="viikko-nakyma">';
    html += '<div class="viikko-paivat">';
    viikkopaivat.forEach(d => html += `<div class="viikko-day-header">${d}</div>`);
    html += '</div><div class="viikko-solut">';

    const tanaan = new Date();
    for (let i = 0; i < 7; i++) {
        const day = new Date(monday);
        day.setDate(monday.getDate() + i);
        const istanaan =
            day.getDate() === tanaan.getDate() &&
            day.getMonth() === tanaan.getMonth() &&
            day.getFullYear() === tanaan.getFullYear();

        const paivattr = day.toISOString().slice(0, 10);

        let juhlaHtml = '';
        const kaikkiJuhlat = [
            ...(window.kaikkiJuhlaPaivat || []),
            ...(window.kaikkiLiikkuvatJuhlaPaivat || [])
        ];
        const [cellYear, cellMonth, cellDay] = paivattr.split('-');
        const juhla = kaikkiJuhlat.find(j => {
            if (j.pvm === paivattr) return true;
            const [jYear, jMonth, jDay] = j.pvm.split('-');
            return jYear === '0001' && jMonth === cellMonth && jDay === cellDay;
        });
        if (juhla) {
            juhlaHtml = `<div class="juhla-paiva" title="${juhla.nimi}">${juhla.nimi}</div>`;
        }

        let tapahtumatHtml = '';
        if (window.kaikkiTapahtumat) {
            const tapahtumat = window.kaikkiTapahtumat.filter(ev => ev.alku_pvm === paivattr);
            tapahtumatHtml = tapahtumat.map(ev => {
                let importanceClass = "tapahtuma-ei-tarkea";
                if (ev.tarkeys === 1) importanceClass = "tapahtuma-tarkea";
                if (ev.tarkeys === 2) importanceClass = "tapahtuma-erittain-tarkea";
                return `<span class="viikko-event ${importanceClass}">
                    ${ev.nimi}
                    ${ev.kuvaus ? `<div class="viikko-event-desc">${ev.kuvaus}</div>` : ''}
                </span>`;
            }).join('');
        }

        html += `<div class="viikko-paiva-solu${istanaan ? ' viikko-tanaan' : ''}" data-date="${paivattr}">
            <div class="viikko-date">${day.getDate()}.${day.getMonth() + 1}.</div>
            ${juhlaHtml}
            ${tapahtumatHtml}
        </div>`;
    }
    html += '</div></div>';

    kuukausiDiv.innerHTML = html;

    kuukausiDiv.querySelectorAll('.viikko-paiva-solu[data-date]').forEach(cell => {
        cell.addEventListener('click', function(e) {
            const date = this.getAttribute('data-date');
            const alkuPvmInput = document.getElementById('alku_pvm');
            if (alkuPvmInput) alkuPvmInput.value = date;
            const loppuPvmInput = document.getElementById('loppu_pvm');
            if (loppuPvmInput) loppuPvmInput.value = date;
            if (window.showtapahtumaModal) window.showtapahtumaModal();
        });
    });

    const viikkoNumber = getWeekNumber(monday);
    monthLabel.textContent = `Viikko ${viikkoNumber}, ${monday.getFullYear()}`;

    if (typeof window.setNavigationLabels === "function") window.setNavigationLabels(date, 'viikko');
}
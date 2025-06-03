import { getMonday } from './getMonday.js';
import { getWeekNumber } from './weekNumber.js';

// Funktio renderoi viikon näkymän kalenteriin

const viikkopaivat = ['Ma', 'Ti', 'Ke', 'To', 'Pe', 'La', 'Su'];

export function renderViikko(date) {
    const kuukausiDiv = document.getElementById('kuukausi');
    const monthLabel = document.getElementById('kalenteriKuukausiOsoite');
    const monday = getMonday(date);

    // HTML rakenne viikon näkymälle

    let html = '<div class="viikko-nakyma">';
    html += '<div class="viikko-paivat">';
    viikkopaivat.forEach(d => html += `<div class="viikko-day-header">${d}</div>`);
    html += '</div><div class="viikko-solut">';

    // Laskee viikon päivät maanantaista sunnuntaihin

    const tanaan = new Date();
    for (let i = 0; i < 7; i++) {
        const day = new Date(monday);
        day.setDate(monday.getDate() + i);
        const istanaan =
            day.getDate() === tanaan.getDate() &&
            day.getMonth() === tanaan.getMonth() &&
            day.getFullYear() === tanaan.getFullYear();

        // Muodostaa päivämääräattribuutin ISO-muodossa

        const paivattr = day.toISOString().slice(0, 10);

        // Luo HTML sisällön päivälle eli juhlapäivälle ja tapahtumille

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

        // jos juhla löytyy, luodaan HTML sille

        if (juhla) {
            juhlaHtml = `<div class="juhla-paiva" title="${juhla.nimi}">${juhla.nimi}</div>`;
        }

        // Etsii tapahtumat, jotka alkavat kyseisenä päivänä

        let tapahtumatHtml = '';
        if (window.kaikkiTapahtumat) {
            const tapahtumat = window.kaikkiTapahtumat.filter(ev => ev.alku_pvm === paivattr);
            tapahtumatHtml = tapahtumat.map(ev => {
                let importanceClass = "tapahtuma-ei-tarkea";
                if (ev.tarkeys === 1) importanceClass = "tapahtuma-tarkea";
                if (ev.tarkeys === 2) importanceClass = "tapahtuma-erittain-tarkea";

                let timeStr = '';
                if (ev.alku_aika && ev.loppu_aika) {
                    timeStr = `<span class="event-time">${ev.alku_aika}–${ev.loppu_aika}</span> `;
                } else if (ev.alku_aika) {
                    timeStr = `<span class="event-time">${ev.alku_aika}</span> `;
                }
                return `<span class="viikko-event ${importanceClass}">
                    ${timeStr}${ev.nimi}
                    ${ev.kuvaus ? `<div class="viikko-event-desc">${ev.kuvaus}</div>` : ''}
                </span>`;
            }).join('');
        }

        // Muodostaa HTML sisällön viikon päivän solulle

        html += `<div class="viikko-paiva-solu${istanaan ? ' viikko-tanaan' : ''}" data-date="${paivattr}">
            <div class="viikko-date">${day.getDate()}.${day.getMonth() + 1}.</div>
            ${juhlaHtml}
            ${tapahtumatHtml}
        </div>`;
    }
    html += '</div></div>';

    kuukausiDiv.innerHTML = html;

    // Päivitetään viikon päivien otsikot

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

    // Päivitetään kuukauden otsikko

    const viikkoNumber = getWeekNumber(monday);
    monthLabel.textContent = `Viikko ${viikkoNumber}, ${monday.getFullYear()}`;

    // Päivitetään navigointinapit

    if (typeof window.setNavigationLabels === "function") window.setNavigationLabels(date, 'viikko');
}
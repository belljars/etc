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
        let tapahtumat = [];
        if (window.kaikkiTapahtumat) {
            tapahtumat = window.kaikkiTapahtumat.filter(ev => ev.alku_pvm === paivattr);

            // Calculate total length of names and descriptions
            const totalChars = tapahtumat.reduce((sum, ev) => sum + (ev.nimi?.length || 0) + (ev.kuvaus?.length || 0), 0);

            if (totalChars > 100) {
                // Collapsed: show only time or generic label, hide name and description
                tapahtumatHtml = tapahtumat.map((ev, idx) => {
                    let importanceClass = "tapahtuma-ei-tarkea";
                    if (ev.tarkeys === 1) importanceClass = "tapahtuma-tarkea";
                    if (ev.tarkeys === 2) importanceClass = "tapahtuma-erittain-tarkea";
                    let timeStr = '';
                    if (ev.alku_aika && ev.loppu_aika) {
                        timeStr = `<span class="event-time">${ev.alku_aika}–${ev.loppu_aika}</span> `;
                    } else if (ev.alku_aika) {
                        timeStr = `<span class="event-time">${ev.alku_aika}</span> `;
                    }
                    // Only show time, not name or description
                    return `<span class="viikko-event collapsed ${importanceClass}" data-idx="${idx}">
                        ${timeStr || 'Tapahtuma'}
                    </span>`;
                }).join('');
            } else {
                // Expanded: show names and descriptions
                tapahtumatHtml = tapahtumat.map((ev, idx) => {
                    let importanceClass = "tapahtuma-ei-tarkea";
                    if (ev.tarkeys === 1) importanceClass = "tapahtuma-tarkea";
                    if (ev.tarkeys === 2) importanceClass = "tapahtuma-erittain-tarkea";
                    let timeStr = '';
                    if (ev.alku_aika && ev.loppu_aika) {
                        timeStr = `<span class="event-time">${ev.alku_aika}–${ev.loppu_aika}</span> `;
                    } else if (ev.alku_aika) {
                        timeStr = `<span class="event-time">${ev.alku_aika}</span> `;
                    }
                    return `<span class="viikko-event expanded ${importanceClass}" data-idx="${idx}">
                        ${timeStr}${ev.nimi}
                        ${ev.kuvaus ? `<div class="viikko-event-desc">${ev.kuvaus}</div>` : ''}
                    </span>`;
                }).join('');
            }
        }

        // Muodostaa HTML sisällön viikon päivän solulle

        html += `<div class="viikko-paiva-solu${istanaan ? ' viikko-tanaan' : ''}" data-date="${paivattr}" data-tapahtumat='${JSON.stringify(tapahtumat)}'>
            <div class="viikko-date">${day.getDate()}.${day.getMonth() + 1}.</div>
            ${juhlaHtml}
            <div class="viikko-event-list">
              ${tapahtumatHtml}
            </div>
        </div>`;
    }
    html += '</div></div>';

    kuukausiDiv.innerHTML = html;

    // Add event listeners for expanding/collapsing events
    kuukausiDiv.querySelectorAll('.viikko-paiva-solu[data-date]').forEach(cell => {
        // Parse tapahtumat for this cell
        let tapahtumat = [];
        try {
            tapahtumat = JSON.parse(cell.getAttribute('data-tapahtumat') || '[]');
        } catch (e) {}

        // Only open the event creation modal if the cell itself (not an event) is clicked
        cell.addEventListener('click', function(e) {
            if (e.target.closest('.viikko-event')) return;
            const date = this.getAttribute('data-date');
            const alkuPvmInput = document.getElementById('alku_pvm');
            if (alkuPvmInput) alkuPvmInput.value = date;
            const loppuPvmInput = document.getElementById('loppu_pvm');
            if (loppuPvmInput) loppuPvmInput.value = date;
            if (window.showtapahtumaModal) window.showtapahtumaModal();
        });

        // Add event click for expanding/collapsing
        const events = cell.querySelectorAll('.viikko-event.collapsed');
        if (events.length > 0) {
            events.forEach(evEl => {
                evEl.addEventListener('click', function(e) {
                    e.stopPropagation();
                    // Collapse all events in this cell
                    events.forEach((el, idx) => {
                        let ev = tapahtumat[idx];
                        let timeStr = '';
                        if (ev.alku_aika && ev.loppu_aika) {
                            timeStr = `<span class="event-time">${ev.alku_aika}–${ev.loppu_aika}</span> `;
                        } else if (ev.alku_aika) {
                            timeStr = `<span class="event-time">${ev.alku_aika}</span> `;
                        }
                        el.innerHTML = `${timeStr || 'Tapahtuma'}`;
                        el.classList.remove('expanded');
                        el.classList.add('collapsed');
                    });
                    // Expand this one
                    const idx = parseInt(this.getAttribute('data-idx'), 10);
                    let ev = tapahtumat[idx];
                    let timeStr = '';
                    if (ev.alku_aika && ev.loppu_aika) {
                        timeStr = `<span class="event-time">${ev.alku_aika}–${ev.loppu_aika}</span> `;
                    } else if (ev.alku_aika) {
                        timeStr = `<span class="event-time">${ev.alku_aika}</span> `;
                    }
                    this.innerHTML = `${timeStr}${ev.nimi}${ev.kuvaus ? `<div class="viikko-event-desc">${ev.kuvaus}</div>` : ''}`;
                    this.classList.remove('collapsed');
                    this.classList.add('expanded');
                });
            });
        }
    });

    // Päivitetään kuukauden otsikko

    const viikkoNumber = getWeekNumber(monday);
    monthLabel.textContent = `Viikko ${viikkoNumber}, ${monday.getFullYear()}`;

    // Päivitetään navigointinapit

    if (typeof window.setNavigationLabels === "function") window.setNavigationLabels(date, 'viikko');
}
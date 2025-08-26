export function renderWeekView(containerId, days, events) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    // HTML-rakenne viikonäkymälle

    const grid = document.createElement('div');
    grid.className = 'viikko-grid';

    days.forEach(day => {
        const header = document.createElement('div');
        header.className = 'viikko-grid-header';
        header.textContent = day.label;
        grid.appendChild(header);
    });

    // Laskee viikon päivät maanantaista sunnuntaihin
    
    days.forEach((day, idx) => {
        const paivattr = day.toISOString().slice(0, 10);
        let cellHtml = '';

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

        if (window.kaikkiTapahtumat) {
            const tapahtumat = window.kaikkiTapahtumat.filter(ev => ev.alku_pvm === paivattr);
            cellHtml += tapahtumat.map(ev => {
                let importanceClass = "tapahtuma-ei-tarkea";
                if (ev.tarkeys === 1) importanceClass = "tapahtuma-tarkea";
                if (ev.tarkeys === 2) importanceClass = "tapahtuma-erittain-tarkea";
                return `<span class="viikko-event ${importanceClass}">
                    ${ev.nimi}
                    ${ev.kuvaus ? `<div class="viikko-event-desc">${ev.kuvaus}</div>` : ''}
                </span>`;
            }).join('');
        }

        // Luo solun viikonpäivälle

        const cell = document.createElement('div');
        cell.className = 'viikko-paiva-solu';
        cell.innerHTML = `
            <div class="viikko-date">${day.getDate()}.${day.getMonth() + 1}.</div>
            ${juhlaHtml}
            ${cellHtml}
        `;
        grid.appendChild(cell);
    });

    container.appendChild(grid);
}
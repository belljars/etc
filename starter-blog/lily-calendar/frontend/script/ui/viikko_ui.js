const viikkopaivat = ['Ma', 'Ti', 'Ke', 'To', 'Pe', 'La', 'Su'];

function getMonday(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - ((day + 6) % 7);
    return new Date(d.setDate(diff));
}

window.renderviikko = function(date) {
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

        let tapahtumatHtml = '';
        if (window.kaikkiTapahtumat) {
            const paivattr = day.toISOString().slice(0, 10);
            const tapahtumat = window.kaikkiTapahtumat.filter(ev => ev.alku_pvm === paivattr);
            tapahtumatHtml = tapahtumat.map(ev =>
                `<span class="viikko-event">
                    ${ev.nimi}
                    ${ev.kuvaus ? `<div class="viikko-event-desc">${ev.kuvaus}</div>` : ''}
                </span>`
            ).join('');
        }

        const paivattr = day.toISOString().slice(0, 10);
        html += `<div class="viikko-paiva-solu${istanaan ? ' viikko-tanaan' : ''}" data-date="${paivattr}">
            <div class="viikko-date">${day.getDate()}.${day.getMonth() + 1}.</div>
            ${tapahtumatHtml}
        </div>`;
    }
    html += '</div></div>';

    kuukausiDiv.innerHTML = html;
    const viikkoNumber = Math.ceil(
        ((monday - new Date(monday.getFullYear(), 0, 1)) / 86400000 + new Date(monday.getFullYear(), 0, 1).getDay() + 1) / 7
    );
    monthLabel.textContent = `Viikko ${viikkoNumber} (${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')})`;

};

function renderWeekCalendar(containerId, events) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    const days = ['Ma', 'Ti', 'Ke', 'To', 'Pe', 'La', 'Su'];
    const hours = Array.from({ length: 12 }, (_, i) => `${i + 8}:00`);

    const calendar = document.createElement('div');
    calendar.className = 'week-calendar';

    const headerRow = document.createElement('div');
    headerRow.className = 'calendar-row header-row';
    headerRow.appendChild(document.createElement('div'));
    days.forEach(day => {
        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-cell header-cell';
        dayCell.textContent = day;
        headerRow.appendChild(dayCell);
    });
    calendar.appendChild(headerRow);

    hours.forEach(hour => {
        const row = document.createElement('div');
        row.className = 'calendar-row';

        const hourCell = document.createElement('div');
        hourCell.className = 'calendar-cell hour-cell';
        hourCell.textContent = hour;
        row.appendChild(hourCell);


        days.forEach((day, dayIdx) => {
            const cell = document.createElement('div');
            cell.className = 'calendar-cell event-cell';

            const event = events.find(ev =>
                ev.day === dayIdx && ev.hour === hour
            );
            if (event) {
                const eventDiv = document.createElement('div');
                eventDiv.className = 'event';
                eventDiv.textContent = event.title;
                cell.appendChild(eventDiv);
            }
            row.appendChild(cell);
        });
        calendar.appendChild(row);
    });

    container.appendChild(calendar);
}

function renderWeekView(containerId, days, events) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    const grid = document.createElement('div');
    grid.className = 'viikko-grid';
    

    days.forEach(day => {
        const header = document.createElement('div');
        header.className = 'viikko-grid-header';
        header.textContent = day.label;
        grid.appendChild(header);
    });

    days.forEach((day, idx) => {
        const cell = document.createElement('div');
        cell.className = 'viikko-grid-cell';

        events.filter(ev => ev.dayIndex === idx).forEach(ev => {
            const evDiv = document.createElement('div');
            evDiv.className = 'viikko-event';
            evDiv.textContent = ev.title;
            cell.appendChild(evDiv);
        });
        grid.appendChild(cell);
    });

    container.appendChild(grid);
}
export function renderWeekCalendar(containerId, events) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    const days = ['Ma', 'Ti', 'Ke', 'To', 'Pe', 'La', 'Su'];
    const hours = Array.from({ length: 12 }, (_, i) => `${i + 8}:00`);

    // Luoo viikon kalenterin HTML-rakenteen

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

    // Luoo tunnit ja päivät kalenteriin

    hours.forEach(hour => {
        const row = document.createElement('div');
        row.className = 'calendar-row';

        const hourCell = document.createElement('div');
        hourCell.className = 'calendar-cell hour-cell';
        hourCell.textContent = hour;
        row.appendChild(hourCell);

        // Etsii tapahtumat kyseiselle tunnille ja päivälle
        days.forEach((day, dayIdx) => {
            const cell = document.createElement('div');
            cell.className = 'calendar-cell event-cell';

            // Asettaa päivämäärä- ja tunti-attribuutit solulle
            
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
import { getWeekNumber } from './weekNumber.js';

// Funktio asetuksien päivittämiseen navigointinäkymässä

export function setNavigationLabels(date, mode = 'month') {
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
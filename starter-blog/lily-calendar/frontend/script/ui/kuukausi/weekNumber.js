export function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    const weekNum = Math.ceil((((d - yearStart) / 86400000) + 1)/7);
    return weekNum;
}

// Funktio laskee viikon numeron eli
// - palauttaa viikon numeron ISO 8601 standardin mukaisesti
// - viikko alkaa maanantaista ja päättyy sunnuntaihin
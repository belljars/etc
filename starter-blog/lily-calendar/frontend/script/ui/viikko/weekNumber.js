export function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7; // ISO 8601 mukaisesti sunnuntai on 0, joten muutetaan se 7:ksi
    d.setUTCDate(d.getUTCDate() + 4 - dayNum); // Siirtää päivämäärää niin, että viikko alkaa maanantaista
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    const weekNum = Math.ceil((((d - yearStart) / 86400000) + 1)/7); // 86400000 on yksi päivä millisekunteina
    if (weekNum < 1) {

        // Jos viikko on ennen vuoden alkua, palautetaan viimeisen vuoden viimeinen viikko

        const lastYear = new Date(d.getUTCFullYear() - 1);
        return getWeekNumber(lastYear);
    }
    return weekNum;
}
export function getMonday(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - ((day + 6) % 7);
    return new Date(d.setDate(diff));
}

// Funktio palauttaa annetun päivämäärän viikon ensimmäisen päivän (maanantai).
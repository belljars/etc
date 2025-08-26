function paivitaTervehdys() {
    const tervehdysDiv = document.getElementById('tervehdys');
    const now = new Date();
    const hours = now.getHours();
    let tervehdys = "Hyvää päivää";
    if (hours < 12) {
        tervehdys = "Hyvää huomenta";
    } else if (hours >= 18) {
        tervehdys = "Hyvää iltaa";
    }
    const dateStr = now.toLocaleDateString('fi-FI');
    tervehdysDiv.textContent = `${tervehdys}! Tänään on ${dateStr}`; // Muotoilee päivämäärän suomeksi
}
paivitaTervehdys();
setInterval(paivitaTervehdys, 60000); // Päivittää tervehdysviestin joka minuutti
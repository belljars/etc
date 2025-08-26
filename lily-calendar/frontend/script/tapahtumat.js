// Tämä tiedosto sisältää luokkauksen hallintaan liittyvät toiminnot

window.naytaTulevatJaKaynnissa = function() {
    const now = new Date();
    const filtered = window.kaikkiTapahtumat.filter(e => {
        const start = new Date(`${e.alku_pvm}T${e.alku_aika}`);
        const end = new Date(`${e.loppu_pvm}T${e.loppu_aika}`);
        return end >= now;
    });
    window.rendertapahtumat(filtered);
};

// Funktio, joka renderöi tapahtumat HTML-elementtiin

document.getElementById('suodataNappi').onclick = function() {
    window.rendertapahtumat(window.kaikkiTapahtumat);
};
document.getElementById('suodataTulevat').onclick = window.naytaTulevatJaKaynnissa;
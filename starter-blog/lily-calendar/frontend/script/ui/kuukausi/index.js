import { renderkuukausi } from './renderkuukausi.js';

let currentMonth = new Date();
let currentnakyma = 'month';

window.renderkuukausi = renderkuukausi;
window.currentMonth = currentMonth;
window.currentnakyma = currentnakyma;

// Navigation buttons
document.getElementById('edellinenKuukausi').onclick = async () => {
    if (currentnakyma === 'month') {
        currentMonth.setMonth(currentMonth.getMonth() - 1);
        await paivitaJuhlaPaivat(currentMonth.getFullYear());
        renderkuukausi(currentMonth, window.kaikkiTapahtumat || []);
    } else {
        currentMonth.setDate(currentMonth.getDate() - 7);
        await paivitaJuhlaPaivat(currentMonth.getFullYear());
        window.renderviikko(currentMonth);
    }
};

document.getElementById('seuraavaKuukausi').onclick = async () => {
    if (currentnakyma === 'month') {
        currentMonth.setMonth(currentMonth.getMonth() + 1);
        await paivitaJuhlaPaivat(currentMonth.getFullYear());
        renderkuukausi(currentMonth, window.kaikkiTapahtumat || []);
    } else {
        currentMonth.setDate(currentMonth.getDate() + 7);
        await paivitaJuhlaPaivat(currentMonth.getFullYear());
        window.renderviikko(currentMonth);
    }
};

document.getElementById('vaihdaNakemys').onclick = () => {
    if (currentnakyma === 'month') {
        currentnakyma = 'viikko';
        document.body.classList.add('week-view-active');
        window.renderviikko(currentMonth);
        document.getElementById('vaihdaNakemys').textContent = 'Kuukausinäkymä';
    } else {
        currentnakyma = 'month';
        document.body.classList.remove('week-view-active');
        renderkuukausi(currentMonth, window.kaikkiTapahtumat || []);
        document.getElementById('vaihdaNakemys').textContent = 'Viikkonäkymä';
    }
};
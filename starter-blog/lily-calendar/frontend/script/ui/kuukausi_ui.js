const kuukausiDiv = document.getElementById('kuukausi');
const monthLabel = document.getElementById('kalenteriKuukausiOsoite');
let currentMonth = new Date();
let currentnakyma = 'month';

function renderkuukausi(date, tapahtumat = window.kaikkiTapahtumat || []) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

    let html = '<table><tr>';
    const paivat = ['Ma', 'Ti', 'Ke', 'To', 'Pe', 'La', 'Su'];
    paivat.forEach(d => html += `<th>${d}</th>`);
    html += '</tr><tr>';

    const tanaan = new Date();
    for (let i = 0; i < startDay; i++) html += '<td></td>';
    for (let d = 1; d <= lastDay.getDate(); d++) {
        if ((startDay + d - 1) % 7 === 0 && d !== 1) html += '</tr><tr>';
        const istanaan =
            d === tanaan.getDate() &&
            month === tanaan.getMonth() &&
            year === tanaan.getFullYear();
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

        let juhlaHtml = '';
        if (window.kaikkiJuhlaPaivat) {
            const juhla = window.kaikkiJuhlaPaivat.find(j => j.pvm === dateStr);
            if (juhla) {
                juhlaHtml = `<div class="juhla-paiva" title="${juhla.nimi}">🎉 ${juhla.nimi}</div>`;
            }
        }

        const hasEvent = tapahtumat && tapahtumat.some(ev => ev.alku_pvm === dateStr);

        let muistiinDot = '';
        if (window.kaikkiMuistiinpanot) {
            if (window.kaikkiMuistiinpanot.some(n => n.aikajana === 'm_paiva' && n.paivays === dateStr)) {
                muistiinDot = '<span class="muistiin-dot"></span>';
            }
        }

        html += `<td${istanaan ? ' class="tanaan"' : ''} data-date="${dateStr}">${d}`;
        if (hasEvent) {
            html += `<br><span class="event-dot"></span>`;
        }
        if (muistiinDot) {
            html += `<br>${muistiinDot}`;
        }
        if (juhlaHtml) {
            html += `<br>${juhlaHtml}`;
        }
        html += `</td>`;
    }
    html += '</tr></table>';
    kuukausiDiv.innerHTML = html;

    const kuukaudet = [
        'Tammikuu', 'Helmikuu', 'Maaliskuu', 'Huhtikuu', 'Toukokuu', 'Kesäkuu',
        'Heinäkuu', 'Elokuu', 'Syyskuu', 'Lokakuu', 'Marraskuu', 'Joulukuu'
    ];
    monthLabel.textContent = `${kuukaudet[month]} ${year}`;

    setNavigationLabels(date, 'month');
}

function getWeekNumber(date) {

    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    const weekNum = Math.ceil((((d - yearStart) / 86400000) + 1)/7);
    return weekNum;
}

function setNavigationLabels(date, mode = 'month') {
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

document.getElementById('edellinenKuukausi').onclick = () => {
	if (currentnakyma === 'month') {
		currentMonth.setMonth(currentMonth.getMonth() - 1);
		renderkuukausi(currentMonth, window.kaikkiTapahtumat || []);
	} else {
		currentMonth.setDate(currentMonth.getDate() - 7);
		window.renderviikko(currentMonth);
	}
};
document.getElementById('seuraavaKuukausi').onclick = () => {
	if (currentnakyma === 'month') {
		currentMonth.setMonth(currentMonth.getMonth() + 1);
		renderkuukausi(currentMonth, window.kaikkiTapahtumat || []);
	} else {
		currentMonth.setDate(currentMonth.getDate() + 7);
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

renderkuukausi(currentMonth, window.kaikkiTapahtumat || []);
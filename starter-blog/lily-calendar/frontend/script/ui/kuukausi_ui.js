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
		html += `</td>`;
	}
	html += '</tr></table>';
	kuukausiDiv.innerHTML = html;
	monthLabel.textContent = `${year}-${String(month + 1).padStart(2, '0')}`;
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
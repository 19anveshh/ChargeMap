const stationData = [
  {
    id: 'river', name: 'Riverfront Charge', shortAddress: '14 Harbor Way · East District', distance: 12.4, travelMin: 18, chargeTime: 24,
    available: true, open: 4, total: 6, fast: true, state: 'open',
    route: 'M118 373 C190 340 212 300 285 268 C350 240 406 230 460 202'
  },
  {
    id: 'solar', name: 'Solar Plaza Hub', shortAddress: '88 Meridian Ave · Civic Core', distance: 9.8, travelMin: 15, chargeTime: 38,
    available: true, open: 6, total: 8, fast: false, state: 'open',
    route: 'M118 373 C180 350 215 325 272 300 C330 274 344 219 390 177'
  },
  {
    id: 'north', name: 'North Loop Energy', shortAddress: '6 Circuit Lane · North Loop', distance: 16.8, travelMin: 22, chargeTime: 19,
    available: false, open: 1, total: 4, fast: true, state: 'busy',
    route: 'M118 373 C180 330 216 270 290 237 C390 190 487 144 548 90'
  },
  {
    id: 'park', name: 'Parkside Volt', shortAddress: '201 Greenway · West Park', distance: 24.6, travelMin: 31, chargeTime: 16,
    available: true, open: 3, total: 5, fast: true, state: 'open',
    route: 'M118 373 C230 410 312 408 386 374 C475 333 560 320 628 276'
  }
];

const defaults = { battery: 64, distance: 18, chargeTime: 35, availability: 'available' };
const state = { ...defaults, eligible: [], ranked: [], focusId: null, confirmed: false };

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const batteryInput = $('#battery');
const distanceInput = $('#distance');
const chargeTimeInput = $('#charge-time');
const availabilityInput = $('#availability');

function formatDistance(value) { return `${Number(value).toFixed(1)} km`; }
function safeRange() { return Math.max(0, (state.battery / 100) * 40 * .9); }
function isWithinRange(station) { return station.distance <= state.distance && station.distance <= safeRange(); }
function availabilityEligible(station) {
  if (state.availability === 'available') return station.available;
  if (state.availability === 'fast') return station.available && station.fast;
  return true;
}

function getStatus(station) {
  if (!isWithinRange(station)) return { label: 'Outside range', className: 'risky', type: 'unreachable' };
  if (state.availability === 'fast' && !station.fast) return { label: 'Not fast', className: 'busy', type: 'unavailable' };
  if (state.availability !== 'all' && !station.available) return { label: station.state === 'busy' ? 'Busy' : 'Closed', className: station.state === 'busy' ? 'busy' : 'closed', type: 'unavailable' };
  if (station.available) return { label: 'Open now', className: 'open', type: 'eligible' };
  return { label: 'Busy · listed', className: 'busy', type: 'eligible' };
}

function calculateScore(station) {
  const availabilityBonus = station.available ? 10 : -12;
  const patiencePenalty = Math.max(0, station.chargeTime - state.chargeTime) * .25;
  const distancePenalty = station.distance * 2.1;
  const chargePenalty = station.chargeTime * .55;
  return Math.max(0, Math.min(100, 100 - distancePenalty - chargePenalty + availabilityBonus - patiencePenalty));
}

function computeRanking() {
  const eligible = stationData.filter((station) => isWithinRange(station) && availabilityEligible(station));
  const ranked = eligible
    .map((station) => ({ ...station, score: calculateScore(station) }))
    .sort((a, b) => b.score - a.score || a.distance - b.distance);
  state.eligible = eligible;
  state.ranked = ranked;
  if (!state.focusId || !ranked.some((station) => station.id === state.focusId)) state.focusId = ranked[0]?.id || null;
}

function setSliderBackground(input) {
  const min = Number(input.min); const max = Number(input.max); const value = Number(input.value);
  const percent = ((value - min) / (max - min)) * 100;
  input.style.background = `linear-gradient(90deg, var(--cyan) 0%, var(--cyan) ${percent}%, rgba(82, 166, 183, .15) ${percent}%, rgba(82, 166, 183, .15) 100%)`;
}

function syncInputs() {
  state.battery = Number(batteryInput.value);
  state.distance = Number(distanceInput.value);
  state.chargeTime = Number(chargeTimeInput.value);
  state.availability = availabilityInput.value;
  $('#battery-value').textContent = state.battery;
  $('#distance-value').textContent = state.distance;
  $('#charge-time-value').textContent = state.chargeTime;
  [batteryInput, distanceInput, chargeTimeInput].forEach(setSliderBackground);
}

function renderStationList() {
  const list = $('#station-list');
  const ordered = stationData.map((station) => {
    const rankedIndex = state.ranked.findIndex((candidate) => candidate.id === station.id);
    const status = getStatus(station);
    return { ...station, score: calculateScore(station), rankedIndex, status };
  }).sort((a, b) => {
    if (a.rankedIndex === -1 && b.rankedIndex === -1) return b.score - a.score;
    if (a.rankedIndex === -1) return 1;
    if (b.rankedIndex === -1) return -1;
    return a.rankedIndex - b.rankedIndex;
  });

  list.innerHTML = ordered.map((station) => {
    const rank = station.rankedIndex >= 0 ? `0${station.rankedIndex + 1}` : '—';
    const selected = station.id === state.focusId ? ' selected' : '';
    const disabled = station.status.type !== 'eligible' ? ' unreachable' : '';
    return `<button class="station-row${selected}${disabled}" data-row-station="${station.id}" ${station.status.type === 'unreachable' ? 'disabled' : ''}>
      <span class="station-rank">${rank}</span>
      <span class="station-info"><strong>${station.name}</strong><small>${formatDistance(station.distance)} · ${station.chargeTime} min</small></span>
      <span class="status-badge ${station.status.className}">${station.status.label}</span>
      <span class="station-score"><strong>${Math.round(station.score)}</strong><small>score</small></span>
    </button>`;
  }).join('');
  $$('#station-list [data-row-station]').forEach((row) => row.addEventListener('click', () => {
    state.focusId = row.dataset.rowStation;
    render();
    showToast(`${stationById(state.focusId).name} previewed on the route.`);
  }));
}

function stationById(id) { return stationData.find((station) => station.id === id); }
function focusedStation() { return stationById(state.focusId) || state.ranked[0]; }

function renderRecommendation() {
  const station = focusedStation();
  const best = state.ranked[0];
  if (!station) {
    $('#recommendation-name').textContent = 'No safe match yet';
    $('#recommendation-address').innerHTML = '<svg><use href="#icon-info" /></svg> Widen the distance or charge window';
    $('#recommendation-score').textContent = '—';
    $('#recommendation-distance').textContent = '—';
    $('#recommendation-time').textContent = '—';
    $('#recommendation-status').textContent = '0 stations';
    $('#recommendation-reason-text').textContent = 'No station clears the current battery and availability guardrails. Try a longer comfortable distance or show all stations.';
    $('#route-distance').textContent = '—'; $('#route-arrival').textContent = '—'; $('#route-battery').textContent = '—';
    $('#confirm-route').disabled = true;
    return;
  }
  const isBest = best && station.id === best.id;
  $('#recommendation-name').textContent = station.name;
  $('#recommendation-address').innerHTML = `<svg><use href="#icon-pin" /></svg> ${station.shortAddress}`;
  $('#recommendation-score').textContent = Math.round(calculateScore(station));
  $('#recommendation-distance').textContent = formatDistance(station.distance);
  $('#recommendation-time').textContent = `${station.chargeTime} min`;
  $('#recommendation-status').textContent = `${station.open} / ${station.total} open`;
  $('#route-distance').textContent = formatDistance(station.distance);
  $('#route-arrival').textContent = `${station.travelMin} min`;
  const arrivalBattery = Math.max(0, Math.round(state.battery - (station.distance / 40) * 100));
  $('#route-battery').textContent = `${arrivalBattery}%`;
  $('#route-battery').style.color = arrivalBattery < 16 ? 'var(--amber)' : '';
  $('#recommendation-card .success-tag').innerHTML = isBest ? '<span class="success-check"><svg><use href="#icon-check" /></svg></span> Best match' : '<span class="success-check"><svg><use href="#icon-route" /></svg></span> Preview';
  $('#recommendation-card .rank-label').innerHTML = isBest ? 'Rank <b>#1</b>' : `Rank <b>#${state.ranked.findIndex((item) => item.id === station.id) + 1}</b>`;
  $('#recommendation-reason-text').textContent = isBest
    ? `${station.name} is the highest-scoring eligible stop: close enough for a safe arrival, available now, and below your ${state.chargeTime}-minute patience target.`
    : `You are previewing an alternative. It remains inside your current guardrail, but the greedy engine ranks ${best?.name || 'another option'} higher right now.`;
  $('#confirm-route').disabled = false;
}

function renderMap() {
  const station = focusedStation();
  $$('.station-pin').forEach((pin) => pin.classList.toggle('selected', pin.dataset.station === state.focusId));
  if (!station) return;
  $('#active-route').setAttribute('d', station.route);
  $('#route-shadow').setAttribute('d', station.route);
}

function renderAlgorithm() {
  const station = focusedStation();
  const bars = $('#score-bars');
  if (!station) { bars.innerHTML = ''; return; }
  const distancePart = Math.max(8, 100 - station.distance * 2.1);
  const chargePart = Math.max(8, 100 - station.chargeTime * .55);
  const availabilityPart = station.available ? 100 : 34;
  bars.innerHTML = [
    ['distance', distancePart, `${Math.round(distancePart)}`],
    ['charge time', chargePart, `${Math.round(chargePart)}`],
    ['availability', availabilityPart, `${Math.round(availabilityPart)}`]
  ].map(([label, width, value]) => `<div class="score-bar-row"><span>${label}</span><span class="score-track"><span class="score-fill" style="width:${width}%"></span></span><b>${value}</b></div>`).join('');
}

function render() {
  syncInputs();
  computeRanking();
  $('#availability-count').textContent = `${state.eligible.length} station${state.eligible.length === 1 ? '' : 's'}`;
  renderStationList();
  renderRecommendation();
  renderMap();
  renderAlgorithm();
}

let toastTimer;
function showToast(message) {
  $('#toast-message').textContent = message;
  $('#toast').classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 2600);
}

[batteryInput, distanceInput, chargeTimeInput].forEach((input) => input.addEventListener('input', () => { state.focusId = null; render(); }));
availabilityInput.addEventListener('change', () => { state.focusId = null; render(); showToast('Availability filter updated.'); });
$('#recalculate').addEventListener('click', () => { state.focusId = state.ranked[0]?.id || null; render(); showToast(state.ranked[0] ? `${state.ranked[0].name} is your smartest stop.` : 'No station clears the current guardrails.'); });
$('#reset-view').addEventListener('click', () => { Object.entries(defaults).forEach(([key, value]) => { if (key === 'availability') availabilityInput.value = value; else document.getElementById(key === 'battery' ? 'battery' : key === 'distance' ? 'distance' : 'charge-time').value = value; }); state.focusId = null; render(); showToast('Planner reset to the demo scenario.'); });
$('#confirm-route').addEventListener('click', () => { const station = focusedStation(); if (station) { state.confirmed = true; showToast(`${station.name} added to your route.`); $('#confirm-route').innerHTML = '<span>Route selected</span><svg><use href="#icon-check" /></svg>'; } });
$$('.station-pin').forEach((pin) => pin.addEventListener('click', () => { const station = stationById(pin.dataset.station); if (!station) return; if (getStatus(station).type === 'unreachable') { showToast(`${station.name} is outside your current safe range.`); return; } state.focusId = station.id; render(); }));
$('#explain-toggle').addEventListener('click', () => { const panel = $('#explanation-panel'); const open = !panel.hidden; panel.hidden = open; $('#explain-toggle').classList.toggle('open', !open); $('#explain-toggle span').textContent = open ? 'How the score works' : 'Hide score details'; });
$('#toggle-all').addEventListener('click', () => { const panel = $('#explanation-panel'); if (panel.hidden) { panel.hidden = false; $('#explain-toggle').classList.add('open'); $('#explain-toggle span').textContent = 'Hide score details'; } document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth', block: 'center' }); });

render();

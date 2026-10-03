/**
 * ChargePath - Intelligent Autonomous EV Station Planner
 * Powered by Dijkstra's Shortest Path & Greedy Multi-Criteria Decision Heuristic
 * Full-Stack API Integration with Client-Side Fallback & Cockpit Telemetry
 */

// 1. Simulated Road Network Graph (Adjacency List for Dijkstra)
const roadGraph = {
  origin: [
    { node: 'junctionA', distance: 4.2, time: 6, road: 'Midtown Blvd' },
    { node: 'junctionB', distance: 5.1, time: 8, road: 'East Arterial' },
    { node: 'junctionC', distance: 8.4, time: 11, road: 'West Expressway' }
  ],
  junctionA: [
    { node: 'origin', distance: 4.2, time: 6, road: 'Midtown Blvd' },
    { node: 'northNode', distance: 12.6, time: 16, road: 'North Loop Link' },
    { node: 'solarNode', distance: 5.6, time: 9, road: 'Civic Meridian' }
  ],
  junctionB: [
    { node: 'origin', distance: 5.1, time: 8, road: 'East Arterial' },
    { node: 'riverNode', distance: 7.3, time: 10, road: 'Harbor Way' },
    { node: 'solarNode', distance: 4.7, time: 7, road: 'Metro Connector' }
  ],
  junctionC: [
    { node: 'origin', distance: 8.4, time: 11, road: 'West Expressway' },
    { node: 'parkNode', distance: 16.2, time: 20, road: 'Greenway Parkway' }
  ],
  northNode: [
    { node: 'junctionA', distance: 12.6, time: 16, road: 'North Loop Link' }
  ],
  solarNode: [
    { node: 'junctionA', distance: 5.6, time: 9, road: 'Civic Meridian' },
    { node: 'junctionB', distance: 4.7, time: 7, road: 'Metro Connector' }
  ],
  riverNode: [
    { node: 'junctionB', distance: 7.3, time: 10, road: 'Harbor Way' }
  ],
  parkNode: [
    { node: 'junctionC', distance: 16.2, time: 20, road: 'Greenway Parkway' }
  ]
};

// 2. Station Metadata Linked to Graph Target Nodes
let stationData = [
  {
    id: 'river', name: 'Riverfront Charge', targetNode: 'riverNode', shortAddress: '14 Harbor Way · East District',
    distance: 12.4, travelMin: 18, chargeTime: 24, available: true, open: 4, total: 6, fast: true, state: 'open',
    route: 'M118 373 C190 340 212 300 285 268 C350 240 406 230 460 202'
  },
  {
    id: 'solar', name: 'Solar Plaza Hub', targetNode: 'solarNode', shortAddress: '88 Meridian Ave · Civic Core',
    distance: 9.8, travelMin: 15, chargeTime: 38, available: true, open: 6, total: 8, fast: false, state: 'open',
    route: 'M118 373 C180 350 215 325 272 300 C330 274 344 219 390 177'
  },
  {
    id: 'north', name: 'North Loop Energy', targetNode: 'northNode', shortAddress: '6 Circuit Lane · North Loop',
    distance: 16.8, travelMin: 22, chargeTime: 19, available: false, open: 1, total: 4, fast: true, state: 'busy',
    route: 'M118 373 C180 330 216 270 290 237 C390 190 487 144 548 90'
  },
  {
    id: 'park', name: 'Parkside Volt', targetNode: 'parkNode', shortAddress: '201 Greenway · West Park',
    distance: 24.6, travelMin: 31, chargeTime: 16, available: true, open: 3, total: 5, fast: true, state: 'open',
    route: 'M118 373 C230 410 312 408 386 374 C475 333 560 320 628 276'
  }
];

// 3. Genuine Dijkstra Shortest Path Solver
function runDijkstra(graph, startNode) {
  const distances = {};
  const times = {};
  const previous = {};
  const visited = new Set();
  let edgesConsidered = 0;

  for (const node in graph) {
    distances[node] = Infinity;
    times[node] = Infinity;
    previous[node] = null;
  }
  distances[startNode] = 0;
  times[startNode] = 0;

  while (visited.size < Object.keys(graph).length) {
    let closestNode = null;
    let minDistance = Infinity;

    for (const node in distances) {
      if (!visited.has(node) && distances[node] < minDistance) {
        minDistance = distances[node];
        closestNode = node;
      }
    }

    if (closestNode === null || minDistance === Infinity) break;
    visited.add(closestNode);

    for (const edge of graph[closestNode]) {
      edgesConsidered++;
      if (visited.has(edge.node)) continue;

      const altDist = distances[closestNode] + edge.distance;
      const altTime = times[closestNode] + edge.time;

      if (altDist < distances[edge.node]) {
        distances[edge.node] = Math.round(altDist * 10) / 10;
        times[edge.node] = altTime;
        previous[edge.node] = { from: closestNode, road: edge.road, dist: edge.distance, time: edge.time };
      }
    }
  }

  function reconstructPath(target) {
    const path = [];
    let curr = target;
    while (curr && previous[curr]) {
      path.unshift({ node: curr, road: previous[curr].road, dist: previous[curr].dist, time: previous[curr].time });
      curr = previous[curr].from;
    }
    if (curr) path.unshift({ node: curr, road: 'Origin Point (Midtown)', dist: 0, time: 0 });
    return path;
  }

  return { distances, times, visitedCount: visited.size, edgesConsidered, reconstructPath };
}

// 4. Zero-Dependency Web Audio Synthesizer
const soundEngine = {
  enabled: false,
  ctx: null,
  init() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  },
  toggle() {
    this.enabled = !this.enabled;
    if (this.enabled) {
      this.init();
      this.chime([580, 880]);
    }
    return this.enabled;
  },
  blip(freq = 640, duration = 0.04) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (_) {}
  },
  chime(frequencies = [520, 780]) {
    if (!this.enabled) return;
    frequencies.forEach((f, idx) => setTimeout(() => this.blip(f, 0.07), idx * 60));
  }
};

// 5. State Management & Defaults
const defaults = { battery: 64, distance: 18, chargeTime: 35, availability: 'available' };
const state = {
  ...defaults,
  eligible: [],
  ranked: [],
  focusId: null,
  confirmed: false,
  dijkstra: null,
  backendPlan: null,
  requestId: 0
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const batteryInput = $('#battery');
const distanceInput = $('#distance');
const chargeTimeInput = $('#charge-time');
const availabilityInput = $('#availability');

function formatDistance(value) { return `${Number(value).toFixed(1)} km`; }
function safeRange() { return Math.max(0, (state.battery / 100) * 40 * 0.9); }
function isWithinRange(station) { return station.distance <= state.distance && station.distance <= safeRange(); }
function availabilityEligible(station) {
  if (state.availability === 'available') return station.available;
  if (state.availability === 'fast') return station.available && station.fast;
  return true;
}

function getStatus(station) {
  if (station.status) {
    const map = {
      'Open now': { label: 'Open now', className: 'open', type: 'eligible' },
      'Busy': { label: 'Busy', className: 'busy', type: 'unavailable' },
      'Busy · listed': { label: 'Busy · listed', className: 'busy', type: 'eligible' },
      'Not fast': { label: 'Not fast', className: 'busy', type: 'unavailable' },
      'Outside range': { label: 'Outside range', className: 'risky', type: 'unreachable' }
    };
    if (map[station.status]) return map[station.status];
  }
  if (!isWithinRange(station)) return { label: 'Outside range', className: 'risky', type: 'unreachable' };
  if (state.availability === 'fast' && !station.fast) return { label: 'Not fast', className: 'busy', type: 'unavailable' };
  if (state.availability !== 'all' && !station.available) return { label: station.state === 'busy' ? 'Busy' : 'Closed', className: station.state === 'busy' ? 'busy' : 'closed', type: 'unavailable' };
  if (station.available) return { label: 'Open now', className: 'open', type: 'eligible' };
  return { label: 'Busy · listed', className: 'busy', type: 'eligible' };
}

function calculateScore(station) {
  if (state.backendPlan && Number.isFinite(Number(station.score))) return Number(station.score);
  const availabilityBonus = station.available ? 10 : -12;
  const patiencePenalty = Math.max(0, station.chargeTime - state.chargeTime) * 0.25;
  const distancePenalty = station.distance * 2.1;
  const chargePenalty = station.chargeTime * 0.55;
  return Math.max(0, Math.min(100, 100 - distancePenalty - chargePenalty + availabilityBonus - patiencePenalty));
}

function computeRanking() {
  // Always execute client-side Dijkstra for graph telemetry & path reconstruction
  state.dijkstra = runDijkstra(roadGraph, 'origin');

  stationData.forEach((st) => {
    if (state.dijkstra.distances[st.targetNode] !== undefined) {
      st.distance = state.dijkstra.distances[st.targetNode];
      st.travelMin = state.dijkstra.times[st.targetNode];
    }
  });

  if (state.backendPlan) {
    state.eligible = state.backendPlan.ranked || [];
    state.ranked = state.backendPlan.ranked || [];
    if (!state.focusId || !state.ranked.some((station) => station.id === state.focusId)) {
      state.focusId = state.ranked[0]?.id || null;
    }
    return;
  }

  const eligible = stationData.filter((station) => isWithinRange(station) && availabilityEligible(station));
  const ranked = eligible
    .map((station) => ({ ...station, score: calculateScore(station) }))
    .sort((a, b) => b.score - a.score || a.distance - b.distance);

  state.eligible = eligible;
  state.ranked = ranked;
  if (!state.focusId || !ranked.some((station) => station.id === state.focusId)) {
    state.focusId = ranked[0]?.id || null;
  }
}

function setSliderBackground(input) {
  const min = Number(input.min); const max = Number(input.max); const value = Number(input.value);
  const percent = ((value - min) / (max - min)) * 100;
  input.style.background = `linear-gradient(90deg, #00f2fe 0%, #7952ff ${percent}%, rgba(255, 255, 255, 0.08) ${percent}%, rgba(255, 255, 255, 0.08) 100%)`;
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
  const source = state.backendPlan?.stations || stationData;
  const ordered = source.map((station) => {
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
      <span class="station-info"><strong>${station.name}</strong><small>${formatDistance(station.distance)} · ${station.chargeTime} min · ${station.open}/${station.total} open</small></span>
      <span class="status-badge ${station.status.className}">${station.status.label}</span>
      <span class="station-score"><strong>${Math.round(station.score)}</strong><small>SCORE</small></span>
    </button>`;
  }).join('');

  window.ChargePathMotion?.reveal(list.querySelectorAll('.station-row'), { duration: 460, stagger: 55, y: 10, scale: 0.99 });

  $$('#station-list [data-row-station]').forEach((row) => row.addEventListener('click', () => {
    state.focusId = row.dataset.rowStation;
    soundEngine.blip(680, 0.05);
    render();
    showToast(`${stationById(state.focusId)?.name || 'Station'} selected for route preview.`);
  }));
}

function stationById(id) {
  return (state.backendPlan?.stations || stationData).find((station) => station.id === id);
}
function focusedStation() {
  return stationById(state.focusId) || state.ranked[0];
}

function renderRecommendation() {
  const station = focusedStation();
  const best = state.ranked[0];
  const progressCircle = $('#score-circle-progress');
  const circumference = 213.63;

  if (!station) {
    $('#recommendation-name').textContent = 'No safe match yet';
    $('#recommendation-address').innerHTML = '<svg><use href="#icon-info" /></svg> Widen the distance or charge window';
    $('#recommendation-score').textContent = '—';
    if (progressCircle) progressCircle.style.strokeDashoffset = `${circumference}`;
    $('#recommendation-distance').textContent = '—';
    $('#recommendation-time').textContent = '—';
    $('#recommendation-status').textContent = '0 stations';
    $('#recommendation-reason-text').textContent = 'No station clears the current battery and availability guardrails. Try a longer comfortable distance or show all stations.';
    $('#route-distance').textContent = '—'; $('#route-arrival').textContent = '—'; $('#route-battery').textContent = '—';
    $('#confirm-route').disabled = true;
    return;
  }
  const isBest = best && station.id === best.id;
  const score = Math.round(calculateScore(station));

  $('#recommendation-name').textContent = station.name;
  $('#recommendation-address').innerHTML = `<svg><use href="#icon-pin" /></svg> ${station.shortAddress || station.address || ''}`;
  $('#recommendation-score').textContent = score;
  window.ChargePathMotion?.countTo($('#recommendation-score'), score, 560);

  if (progressCircle) {
    const offset = Math.max(0, circumference * (1 - score / 100));
    progressCircle.style.strokeDashoffset = `${offset}`;
  }

  $('#recommendation-distance').textContent = formatDistance(station.distance);
  $('#recommendation-time').textContent = `${station.chargeTime} min`;
  $('#recommendation-status').textContent = `${station.open} / ${station.total} open`;
  $('#route-distance').textContent = formatDistance(station.distance);
  $('#route-arrival').textContent = `${station.travelMin} min`;
  const arrivalBattery = Number.isFinite(Number(station.arrivalBattery)) ? station.arrivalBattery : Math.max(0, Math.round(state.battery - (station.distance / 40) * 100));
  $('#route-battery').textContent = `${arrivalBattery}%`;
  $('#route-battery').style.color = arrivalBattery < 16 ? 'var(--amber)' : 'var(--mint)';
  $('#recommendation-card .success-tag').innerHTML = isBest ? '<span class="success-check"><svg><use href="#icon-check" /></svg></span> Best match' : '<span class="success-check"><svg><use href="#icon-route" /></svg></span> Preview';
  $('#recommendation-card .rank-label').innerHTML = isBest ? 'Rank <b>#1</b>' : `Rank <b>#${state.ranked.findIndex((item) => item.id === station.id) + 1}</b>`;
  $('#recommendation-reason-text').textContent = isBest
    ? `${station.name} is the highest-scoring eligible stop: Dijkstra verified shortest path (${formatDistance(station.distance)}), available stalls ready, and stays within your battery guardrail.`
    : `You are previewing an alternative candidate. It remains inside your safe buffer, but the greedy engine ranks ${best?.name || 'another stop'} higher right now.`;
  $('#confirm-route').disabled = false;
}

function renderMap() {
  const station = focusedStation();
  $$('.station-pin').forEach((pin) => pin.classList.toggle('selected', pin.dataset.station === state.focusId));
  if (!station) return;
  const route = station.route || stationData.find((s) => s.id === station.id)?.route;
  if (route) {
    $('#active-route').setAttribute('d', route);
    $('#route-shadow').setAttribute('d', route);
    window.ChargePathMotion?.drawRoute($('#active-route'));
    window.ChargePathMotion?.drawRoute($('#route-shadow'));
  }
}

function renderAlgorithm() {
  const station = focusedStation();
  const bars = $('#score-bars');
  if (!station) {
    bars.innerHTML = '';
    return;
  }
  const breakdown = station.scoreBreakdown || {};
  const distancePart = breakdown.distance ?? Math.max(8, 100 - station.distance * 2.1);
  const chargePart = breakdown.chargingTime ?? Math.max(8, 100 - station.chargeTime * 0.55);
  const availabilityPart = breakdown.availability ?? (station.available ? 100 : 34);
  const batteryPart = breakdown.batterySafety ?? Math.max(10, Math.round(100 - (station.distance / 36) * 100));

  bars.innerHTML = [
    ['DISTANCE SCORE', distancePart, `${Math.round(distancePart)}%`],
    ['CHARGE TIME', chargePart, `${Math.round(chargePart)}%`],
    ['AVAILABILITY', availabilityPart, `${Math.round(availabilityPart)}%`],
    ['BATTERY SAFETY', batteryPart, `${Math.round(batteryPart)}%`]
  ].map(([label, width, value]) => `<div class="score-bar-row"><span>${label}</span><span class="score-track"><span class="score-fill" style="width:${width}%"></span></span><b>${value}</b></div>`).join('');

  // Render Genuine Dijkstra Path Telemetry Ribbon
  const targetNode = station.targetNode || `${station.id}Node`;
  if (state.dijkstra) {
    const pathNodes = state.dijkstra.reconstructPath(targetNode);
    const ribbon = $('#dijkstra-path-ribbon');
    if (ribbon) {
      ribbon.innerHTML = pathNodes.map((n, i) => {
        const isFirst = i === 0;
        const isLast = i === pathNodes.length - 1;
        const cls = isFirst ? ' origin' : (isLast ? ' terminal' : '');
        const arrow = isLast ? '' : '<span class="dijkstra-arrow">➔</span>';
        const label = isFirst ? 'START NODE' : (isLast ? 'TARGET TERMINAL' : `STEP 0${i}`);
        return `<div class="dijkstra-node-chip${cls}">
          <span>${label}</span>
          <strong>${n.node} (${n.dist > 0 ? formatDistance(n.dist) : '0 km'})</strong>
        </div>${arrow}`;
      }).join('');
    }

    $('#dijkstra-nodes-count').textContent = `${state.dijkstra.visitedCount} / ${Object.keys(roadGraph).length} Nodes`;
    $('#dijkstra-edges-count').textContent = `${state.dijkstra.edgesConsidered} Edges`;
    $('#dijkstra-path-dist').textContent = formatDistance(station.distance);
    $('#dijkstra-path-time').textContent = `${station.travelMin} min`;
  }
}

function render() {
  syncInputs();
  computeRanking();
  $('#availability-count').textContent = `${state.eligible.length} station${state.eligible.length === 1 ? '' : 's'}`;
  renderStationList();
  renderRecommendation();
  renderMap();
  renderAlgorithm();
  window.ChargePathMotion?.pop($('#recommendation-card'), 1.01);
}

let toastTimer;
function showToast(message) {
  $('#toast-message').textContent = message;
  $('#toast').classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 2600);
}

// 6. Backend API Request with Client-Side Fallback
let planTimer;
function schedulePlan() {
  clearTimeout(planTimer);
  planTimer = setTimeout(() => requestPlan(), 180);
}

async function requestPlan(options = {}) {
  const requestId = ++state.requestId;
  try {
    const response = await fetch('/api/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        batteryLevel: state.battery,
        comfortableDistance: state.distance,
        preferredChargingTime: state.chargeTime,
        availability: state.availability
      })
    });
    if (!response.ok) throw new Error(`API returned status ${response.status}`);
    const data = await response.json();
    if (requestId !== state.requestId) return;
    state.backendPlan = data;
    render();
    if (options.toast) {
      showToast(data.best ? `${data.best.name} recalculated as optimal via API.` : 'No station clears current constraints.');
    }
  } catch (_) {
    // Graceful fallback to client-side Dijkstra solver
    state.backendPlan = null;
    render();
    if (options.toast) {
      showToast(state.ranked[0] ? `${state.ranked[0].name} recalculated via offline Dijkstra.` : 'No station clears current constraints.');
    }
  }
}

// 7. Navigation Cockpit Modal Functions
function openNavigationModal() {
  const station = focusedStation();
  if (!station) return;

  const modal = $('#nav-modal');
  $('#manifest-station-name').textContent = station.name;
  $('#manifest-station-addr').innerHTML = `<svg><use href="#icon-pin" /></svg> ${station.shortAddress || station.address || ''}`;

  const energyKWh = (station.distance * 0.18).toFixed(1);
  const costVal = (station.distance * 0.18 * 0.38 + 3.2).toFixed(2);
  const co2Kg = (station.distance * 0.24).toFixed(1);

  $('#manifest-energy').textContent = `${energyKWh} kWh`;
  $('#manifest-cost').textContent = `$${costVal}`;
  $('#manifest-co2').textContent = `${co2Kg} kg`;

  const directionsContainer = $('#directions-list');
  const targetNode = station.targetNode || `${station.id}Node`;
  if (state.dijkstra) {
    const path = state.dijkstra.reconstructPath(targetNode);
    directionsContainer.innerHTML = path.map((step, idx) => {
      if (idx === 0) {
        return `<div class="direction-item">
          <span class="direction-num">01</span>
          <div class="direction-text">
            <strong>Depart Origin (Midtown Station)</strong>
            <small>Battery level: ${state.battery}% · GPS link verified</small>
          </div>
        </div>`;
      }
      return `<div class="direction-item">
        <span class="direction-num">0${idx + 1}</span>
        <div class="direction-text">
          <strong>Navigate via ${step.road}</strong>
          <small>Travel ${formatDistance(step.dist)} · ~${step.time} min to ${step.node}</small>
        </div>
      </div>`;
    }).join('') + `<div class="direction-item">
      <span class="direction-num">0${path.length + 1}</span>
      <div class="direction-text">
        <strong>Arrive at ${station.name}</strong>
        <small>Plug into Stall #0${station.open} · Expected SOC: ${Math.max(0, Math.round(state.battery - (station.distance / 40) * 100))}%</small>
      </div>
    </div>`;
  }

  modal.hidden = false;
  soundEngine.chime([520, 780, 1040]);
}

function closeNavigationModal() {
  $('#nav-modal').hidden = true;
  soundEngine.blip(400, 0.04);
}

// 8. Interactive Step-Through Simulation Runner
let isSimulating = false;
function runStepThroughSimulation() {
  if (isSimulating) return;
  isSimulating = true;

  soundEngine.chime([440, 660, 880]);
  showToast('▶ Step 1: Dijkstra exploring shortest graph paths...');

  $$('.algo-step').forEach((s) => s.classList.remove('active-step-glow'));
  $('#step-dijkstra')?.classList.add('active-step-glow');
  window.ChargePathMotion?.drawRoute($('#active-route'));

  setTimeout(() => {
    soundEngine.blip(600, 0.05);
    $$('.algo-step').forEach((s) => s.classList.remove('active-step-glow'));
    $('#step-filter')?.classList.add('active-step-glow');
    showToast('▶ Step 2: Feasibility gate pruning unreachable stations...');

    setTimeout(() => {
      soundEngine.chime([660, 990, 1320]);
      $$('.algo-step').forEach((s) => s.classList.remove('active-step-glow'));
      $('#step-greedy')?.classList.add('active-step-glow');
      const winner = state.ranked[0];
      showToast(winner ? `▶ Step 3: Greedy choice verified: ${winner.name} #1` : 'No station clears guardrails.');
      window.ChargePathMotion?.pop($('#recommendation-card'), 1.03);

      setTimeout(() => {
        $$('.algo-step').forEach((s) => s.classList.remove('active-step-glow'));
        isSimulating = false;
      }, 1400);
    }, 1100);
  }, 1100);
}

// 9. Scenario Preset Handlers
const presets = {
  'default': { battery: 64, distance: 18, chargeTime: 35, availability: 'available', name: 'Standard Scenario' },
  'low-batt': { battery: 18, distance: 10, chargeTime: 25, availability: 'available', name: 'Low Battery Alert' },
  'long-haul': { battery: 85, distance: 32, chargeTime: 50, availability: 'available', name: 'Long-Haul Sprint' },
  'fast-only': { battery: 45, distance: 22, chargeTime: 25, availability: 'fast', name: 'High-Power Stalls Only' }
};

function activatePreset(presetKey) {
  const p = presets[presetKey];
  if (!p) return;
  $$('.preset-chip').forEach((c) => c.classList.toggle('active', c.dataset.preset === presetKey));
  batteryInput.value = p.battery;
  distanceInput.value = p.distance;
  chargeTimeInput.value = p.chargeTime;
  availabilityInput.value = p.availability;
  state.focusId = null;
  state.backendPlan = null;
  soundEngine.chime([550, 770]);
  render();
  schedulePlan();
  showToast(`Activated ${p.name}`);
}

$$('.preset-chip').forEach((chip) => {
  chip.addEventListener('click', () => activatePreset(chip.dataset.preset));
});

// 10. Controls & Input Event Listeners
[batteryInput, distanceInput, chargeTimeInput].forEach((input) => input.addEventListener('input', () => {
  $$('.preset-chip').forEach((c) => c.classList.remove('active'));
  state.focusId = null;
  state.backendPlan = null;
  soundEngine.blip(400 + Number(input.value) * 6, 0.02);
  render();
  schedulePlan();
}));

availabilityInput.addEventListener('change', () => {
  $$('.preset-chip').forEach((c) => c.classList.remove('active'));
  state.focusId = null;
  state.backendPlan = null;
  soundEngine.blip(580, 0.04);
  render();
  showToast('Availability filter updated.');
  schedulePlan();
});

$('#recalculate').addEventListener('click', () => {
  state.focusId = null;
  state.backendPlan = null;
  soundEngine.chime([520, 800]);
  render();
  requestPlan({ toast: true });
});

$('#reset-view').addEventListener('click', () => {
  Object.entries(defaults).forEach(([key, value]) => {
    if (key === 'availability') availabilityInput.value = value;
    else document.getElementById(key === 'battery' ? 'battery' : key === 'distance' ? 'distance' : 'charge-time').value = value;
  });
  $$('.preset-chip').forEach((c) => c.classList.remove('active'));
  $('#preset-default')?.classList.add('active');
  state.focusId = null;
  state.backendPlan = null;
  soundEngine.chime([440, 660]);
  render();
  showToast('Planner reset to default parameters.');
  schedulePlan();
});

$('#confirm-route').addEventListener('click', () => {
  state.confirmed = true;
  openNavigationModal();
});

$('#modal-close').addEventListener('click', closeNavigationModal);
$('#nav-modal').addEventListener('click', (e) => {
  if (e.target === $('#nav-modal')) closeNavigationModal();
});

$('#start-guidance').addEventListener('click', () => {
  const station = focusedStation();
  soundEngine.chime([600, 900, 1200]);
  showToast(`Route synchronized with vehicle guidance for ${station.name}!`);
  closeNavigationModal();
  $('#confirm-route').innerHTML = '<span>Route Synced to Vehicle</span><svg><use href="#icon-check" /></svg>';
});

$$('.station-pin').forEach((pin) => pin.addEventListener('click', () => {
  const station = stationById(pin.dataset.station);
  if (!station) return;
  if (getStatus(station).type === 'unreachable') {
    soundEngine.blip(280, 0.08);
    showToast(`${station.name} is outside safe battery range.`);
    return;
  }
  state.focusId = station.id;
  soundEngine.blip(700, 0.04);
  render();
}));

$('#explain-toggle').addEventListener('click', () => {
  const panel = $('#explanation-panel');
  const open = !panel.hidden;
  panel.hidden = open;
  soundEngine.blip(500, 0.03);
  $('#explain-toggle').classList.toggle('open', !open);
  $('#explain-toggle span').textContent = open ? 'How the score works' : 'Hide score details';
});

$('#toggle-all').addEventListener('click', () => {
  const panel = $('#explanation-panel');
  if (panel.hidden) {
    panel.hidden = false;
    $('#explain-toggle').classList.add('open');
    $('#explain-toggle span').textContent = 'Hide score details';
  }
  document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth', block: 'center' });
});

$('#run-stepper')?.addEventListener('click', runStepThroughSimulation);

// Sound Toggle Button
$('#sound-toggle')?.addEventListener('click', () => {
  const active = soundEngine.toggle();
  $('#sound-toggle').classList.toggle('active', active);
  $('#sound-icon-on').style.display = active ? 'block' : 'none';
  $('#sound-icon-off').style.display = active ? 'none' : 'block';
  $('#sound-toggle').setAttribute('title', active ? 'UI Sound Effects: Active' : 'UI Sound Effects: Muted (Click to enable)');
  showToast(active ? 'Sound effects enabled.' : 'Sound muted.');
});

// 11. Presenter Hotkeys (1-4: Presets, R: Recalculate, E: Explain, S: Stepper, Esc: Close)
window.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

  switch (e.key) {
    case '1': activatePreset('default'); break;
    case '2': activatePreset('low-batt'); break;
    case '3': activatePreset('long-haul'); break;
    case '4': activatePreset('fast-only'); break;
    case 'r':
    case 'R':
      $('#recalculate')?.click();
      break;
    case 'e':
    case 'E':
      $('#explain-toggle')?.click();
      break;
    case 's':
    case 'S':
      runStepThroughSimulation();
      break;
    case 'Escape':
      closeNavigationModal();
      break;
  }
});

// Initial Render and API Bootstrapping
render();
requestPlan();

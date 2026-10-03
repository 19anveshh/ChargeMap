const MAX_RANGE_KM = 40;
const SAFETY_RESERVE = 0.10;

export const DEFAULT_WEIGHTS = {
  distance: 0.35,
  batterySafety: 0.25,
  chargingTime: 0.20,
  availability: 0.20
};

// Simulated weighted road graph. Nodes are intersections; edges are bidirectional roads.
const edgePairs = [
  ['origin', 'junctionA', 4.2, 6],
  ['origin', 'junctionB', 5.1, 8],
  ['junctionA', 'solarNode', 5.6, 9],
  ['junctionB', 'riverNode', 7.3, 10],
  ['junctionA', 'northNode', 12.6, 16],
  ['junctionB', 'parkNode', 19.5, 23]
];

export const graph = edgePairs.reduce((adjacency, [from, to, distance, time]) => {
  adjacency[from] ||= [];
  adjacency[to] ||= [];
  adjacency[from].push({ node: to, distance, time });
  adjacency[to].push({ node: from, distance, time });
  return adjacency;
}, {});

export const stationCatalog = [
  { id: 'river', name: 'Riverfront Charge', node: 'riverNode', shortAddress: '14 Harbor Way · East District', chargeTime: 24, open: 4, total: 6, available: true, fast: true, state: 'open', route: 'M118 373 C190 340 212 300 285 268 C350 240 406 230 460 202' },
  { id: 'solar', name: 'Solar Plaza Hub', node: 'solarNode', shortAddress: '88 Meridian Ave · Civic Core', chargeTime: 38, open: 6, total: 8, available: true, fast: false, state: 'open', route: 'M118 373 C180 350 215 325 272 300 C330 274 344 219 390 177' },
  { id: 'north', name: 'North Loop Energy', node: 'northNode', shortAddress: '6 Circuit Lane · North Loop', chargeTime: 19, open: 1, total: 4, available: false, fast: true, state: 'busy', route: 'M118 373 C180 330 216 270 290 237 C390 190 487 144 548 90' },
  { id: 'park', name: 'Parkside Volt', node: 'parkNode', shortAddress: '201 Greenway · West Park', chargeTime: 16, open: 3, total: 5, available: true, fast: true, state: 'open', route: 'M118 373 C230 410 312 408 386 374 C475 333 560 320 628 276' }
];

function normalizeWeights(input = {}) {
  const raw = { ...DEFAULT_WEIGHTS, ...input };
  const positive = Object.fromEntries(Object.entries(raw).map(([key, value]) => [key, Math.max(0, Number(value) || 0)]));
  const total = Object.values(positive).reduce((sum, value) => sum + value, 0) || 1;
  return Object.fromEntries(Object.entries(positive).map(([key, value]) => [key, value / total]));
}

function pickSmallest(queue) {
  queue.sort((a, b) => a.distance - b.distance);
  return queue.shift();
}

export function dijkstra(network, start = 'origin') {
  const distances = Object.fromEntries(Object.keys(network).map((node) => [node, Infinity]));
  const travelTimes = Object.fromEntries(Object.keys(network).map((node) => [node, Infinity]));
  const previous = {};
  const queue = [{ node: start, distance: 0, time: 0 }];
  const visited = new Set();
  let edgesConsidered = 0;
  distances[start] = 0;
  travelTimes[start] = 0;

  while (queue.length) {
    const current = pickSmallest(queue);
    if (visited.has(current.node)) continue;
    visited.add(current.node);
    for (const edge of network[current.node] || []) {
      edgesConsidered += 1;
      const candidateDistance = current.distance + edge.distance;
      const candidateTime = current.time + edge.time;
      if (candidateDistance < distances[edge.node]) {
        distances[edge.node] = candidateDistance;
        travelTimes[edge.node] = candidateTime;
        previous[edge.node] = current.node;
        queue.push({ node: edge.node, distance: candidateDistance, time: candidateTime });
      }
    }
  }

  return { distances, travelTimes, previous, visitedNodes: visited.size, edgesConsidered };
}

function reconstructPath(previous, target, start = 'origin') {
  const path = [];
  let cursor = target;
  while (cursor) {
    path.unshift(cursor);
    if (cursor === start) return path;
    cursor = previous[cursor];
  }
  return [];
}

function normalize(value, min, max) {
  if (max === min) return 100;
  return Math.max(0, Math.min(100, ((max - value) / (max - min)) * 100));
}

function chargingTimeScore(actualMinutes, preferredMinutes) {
  if (actualMinutes <= preferredMinutes) {
    // Meeting the preference exactly is perfect; faster stations remain high-scoring.
    return 90 + (actualMinutes / preferredMinutes) * 10;
  }
  // Every minute above the user's target progressively reduces the score.
  return Math.max(0, 100 - ((actualMinutes - preferredMinutes) / preferredMinutes) * 100);
}

export function planTrip(input = {}) {
  const batteryLevel = Math.max(0, Math.min(100, Number(input.batteryLevel ?? input.battery ?? 64)));
  const comfortableDistance = Math.max(1, Number(input.comfortableDistance ?? input.distance ?? 18));
  const preferredChargingTime = Math.max(1, Number(input.preferredChargingTime ?? input.chargeTime ?? 35));
  const availability = input.availability || 'available';
  const weights = normalizeWeights(input.weights);
  const availableRange = (batteryLevel / 100) * MAX_RANGE_KM * (1 - SAFETY_RESERVE);
  const shortestPaths = dijkstra(graph);
  const maxDistance = Math.max(...stationCatalog.map((station) => shortestPaths.distances[station.node]));
  const minDistance = Math.min(...stationCatalog.map((station) => shortestPaths.distances[station.node]));

  const stations = stationCatalog.map((station) => {
    const distance = shortestPaths.distances[station.node];
    const travelMin = shortestPaths.travelTimes[station.node];
    const path = reconstructPath(shortestPaths.previous, station.node);
    const batterySafetyScore = Math.max(0, Math.min(100, ((availableRange - distance) / Math.max(availableRange, 1)) * 100));
    const scoreBreakdown = {
      distance: Number(normalize(distance, minDistance, maxDistance).toFixed(2)),
      batterySafety: Number(batterySafetyScore.toFixed(2)),
      chargingTime: Number(chargingTimeScore(station.chargeTime, preferredChargingTime).toFixed(2)),
      availability: station.available ? Number(((station.open / station.total) * 100).toFixed(2)) : 0
    };
    const finalScore = Object.entries(weights).reduce((sum, [key, weight]) => sum + scoreBreakdown[key] * weight, 0);
    const inRange = distance <= availableRange;
    const withinComfort = distance <= comfortableDistance;
    const passesAvailability = availability === 'all' || (availability === 'fast' ? station.available && station.fast : station.available);
    const eligible = inRange && withinComfort && passesAvailability;
    let status = 'Open now';
    if (!inRange || !withinComfort) status = 'Outside range';
    else if (!passesAvailability) status = station.state === 'busy' ? 'Busy' : 'Not fast';
    else if (!station.available) status = 'Busy · listed';
    return {
      ...station,
      distance,
      travelMin,
      score: Number(Math.max(0, Math.min(100, finalScore)).toFixed(2)),
      scoreBreakdown,
      eligible,
      status,
      path,
      arrivalBattery: Math.max(0, Math.round(batteryLevel - (distance / MAX_RANGE_KM) * 100))
    };
  });

  const ranked = stations
    .filter((station) => station.eligible)
    .sort((a, b) => b.score - a.score || a.distance - b.distance || a.chargeTime - b.chargeTime)
    .map((station, index) => ({ ...station, rank: index + 1 }));

  const rankedIds = new Set(ranked.map((station) => station.id));
  const orderedStations = stations.map((station) => ({ ...station, rank: rankedIds.has(station.id) ? ranked.find((item) => item.id === station.id).rank : null }));
  const best = ranked[0] || null;
  return {
    input: { batteryLevel, comfortableDistance, preferredChargingTime, availability },
    weights,
    availableRange: Number(availableRange.toFixed(2)),
    algorithm: {
      route: 'Dijkstra',
      selection: 'Greedy',
      visitedNodes: shortestPaths.visitedNodes,
      edgesConsidered: shortestPaths.edgesConsidered,
      complexity: 'O(V log V + E)'
    },
    best,
    ranked,
    stations: orderedStations
  };
}

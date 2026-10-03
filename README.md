# ChargePath — EV Route & Charging Intelligence

Frontend-first EV charging planner with a small Node.js backend for explainable route planning.

## Run locally

```bash
PORT=3001 npm start
```

Open `http://127.0.0.1:3001`.

## Backend endpoints

### `GET /api/health`

Returns service readiness.

### `POST /api/plan`

Example request:

```json
{
  "batteryLevel": 64,
  "comfortableDistance": 18,
  "preferredChargingTime": 35,
  "availability": "available",
  "weights": {
    "distance": 0.35,
    "batterySafety": 0.25,
    "chargingTime": 0.20,
    "availability": 0.20
  }
}
```

The response contains:

- Dijkstra shortest distance and path to every station
- Available safe driving range
- Battery feasibility status
- Availability filtering result
- Individual distance, battery-safety, charging-time, and availability scores
- Configurable normalized weights
- Greedy ranked stations
- Best station recommendation
- Nodes visited and edges considered for the route explanation

## Algorithm pipeline

```text
EV location + battery level
        ↓
Dijkstra shortest paths
        ↓
Battery feasibility gate
        ↓
Availability filtering
        ↓
Configurable multi-criteria score
        ↓
Greedy highest-score selection
        ↓
Best station + route + explanation
```

The current data is simulated so the hackathon demo runs without external APIs. The backend is intentionally dependency-free and uses Node's built-in HTTP server.

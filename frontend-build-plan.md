# Electric Vehicle Charging Station Planner — Frontend Build Plan

## Copy-paste prompt for an AI developer

Build a polished, responsive, frontend-only web application called **ChargePath — Electric Vehicle Charging Station Planner** for a college hackathon demonstration.

The application must help an electric vehicle driver find the best charging station using only these user-facing inputs:

1. Current battery level
2. Comfortable travel distance
3. Preferred charging time
4. Station availability

Use simulated data only. Do not require a backend, database, login, payment system, or live API. The frontend must clearly demonstrate both **Dijkstra’s shortest-path algorithm** and a **Greedy station-selection algorithm** using a predefined road graph and simulated charging stations.

---

## 1. Product goal

The app should communicate this idea clearly:

> The nearest charging station is not always the best charging station.

The application should first calculate the shortest route to charging stations using Dijkstra’s algorithm. It should then filter stations based on battery feasibility and availability, score the remaining stations, and greedily select the best station.

The application should be presentation-ready for judges: attractive at first glance, easy to operate live, and technically transparent when the algorithm explanation is opened.

---

## 2. Visual design direction

Use a visual style called **Arctic Glass Mobility Lab**.

### Design movement

A bright near-future mobility command center with frosted glass cards, map-like route graphics, clear telemetry, and precise technical labels.

### Brand personality

- Decisive
- Transparent
- Optimistic

### Color palette

- Background: pale ice blue, approximately `#EFFBFE`
- Primary cyan: `#11C5E8`
- Deep cyan: `#058FAE`
- Primary violet: `#7455F6`
- Deep violet: `#5334DD`
- Mint success: `#8CDFC0`
- Amber warning: `#F6AD55`
- Red unavailable state: `#EC6B77`
- Main text: dark blue-gray, approximately `#122B3A`
- Secondary text: muted blue-gray, approximately `#6C8795`

### Typography

Use:

- **Manrope** for body text and interface labels
- **Space Grotesk** for headlines, station names, and important scores
- **IBM Plex Mono** for algorithm labels, telemetry, distances, and technical metadata

### Signature visual elements

1. Frosted translucent cards with subtle borders and shadows.
2. Cyan-to-violet route lines and glowing station markers.
3. Small uppercase technical labels such as `01 / ROUTE INPUTS` and `04 / THE DAA LAYER`.

### Layout style

Use a cockpit-style dashboard rather than a generic centered grid:

- Header and brand navigation at the top
- Hero statement below the header
- Input control rail
- Large map and route context area
- Recommendation panel beside the map
- Ranked alternatives list
- Expandable algorithm explanation section
- Footer with demo status

---

## 3. Page structure

Build one responsive single-page dashboard with these sections.

### A. Header

Include:

- ChargePath logo with a charging-bolt mark
- Wordmark: `chargepath`
- Navigation links:
  - Planner
  - How it works
  - About
- Small status pill: `Demo mode`
- Circular initials avatar: `CP`

The Planner link should be active.

### B. Hero section

Use the following content:

- Small label: `Decision engine · v1.0`
- Main heading: `One route. Zero guesswork.`
- Supporting text: `A transparent way to find your smartest charging stop — balancing range, time, and availability in one glance.`
- Small proof items:
  - `4 inputs · nothing hidden`
  - `Dijkstra + Greedy · fully explainable`
- Decorative orbit graphic with a charging bolt and `READY` label.

### C. Route input panel

Create a large frosted card titled:

- Small label: `01 / Route inputs`
- Heading: `Tell us what you have.`
- Helper text: `Adjust any value to replay the decision`

Use only these four inputs:

#### Current battery

- Range slider from 8 to 100
- Default: 64
- Display value in percent
- Labels: `critical 8%` and `full 100%`

#### Comfortable distance

- Range slider from 4 to 40
- Default: 18 km
- Display value in kilometers
- Labels: `nearby 4 km` and `far 40 km`

#### Charging patience

- Range slider from 15 to 60
- Default: 35 minutes
- Display value in minutes
- Labels: `quick stop 15 min` and `top-up 60 min`

#### Station availability

Use a select control with:

- `Available now`
- `Show all stations`
- `Fast chargers only`

At the bottom of the input card, show:

- `Battery guardrail active`
- `We reserve 10% charge for a safe arrival.`
- Primary button: `Recalculate route`

Input changes should update the calculated results live. The button should also visibly replay the recommendation and show a short toast notification.

---

## 4. Dijkstra graph and simulated data

Implement a small predefined graph in the frontend JavaScript. Do not calculate distances directly from station input values. Use Dijkstra’s algorithm to calculate the shortest path from the vehicle origin to each charging station.

### Graph representation

Use an adjacency list. Each edge should include:

- Destination node
- Distance in kilometers
- Travel time in minutes

Example structure:

```javascript
const graph = {
  origin: [
    { node: 'junctionA', distance: 4.2, time: 6 },
    { node: 'junctionB', distance: 5.1, time: 8 }
  ],
  junctionA: [
    { node: 'origin', distance: 4.2, time: 6 },
    { node: 'northNode', distance: 5.8, time: 8 },
    { node: 'solarNode', distance: 4.3, time: 7 }
  ],
  junctionB: [
    { node: 'origin', distance: 5.1, time: 8 },
    { node: 'riverNode', distance: 7.3, time: 10 },
    { node: 'parkNode', distance: 6.2, time: 9 }
  ],
  northNode: [
    { node: 'junctionA', distance: 5.8, time: 8 }
  ],
  solarNode: [
    { node: 'junctionA', distance: 4.3, time: 7 }
  ],
  riverNode: [
    { node: 'junctionB', distance: 7.3, time: 10 }
  ],
  parkNode: [
    { node: 'junctionB', distance: 6.2, time: 9 }
  ]
};
```

Use a graph with at least:

- One origin node
- Three or four intermediate junction nodes
- Four charging-station destination nodes

The graph should create realistic differences between direct distance, charging time, and availability so the nearest station is not always the winner.

### Station dataset

Create at least four simulated stations:

```javascript
const stations = [
  {
    id: 'river',
    name: 'Riverfront Charge',
    node: 'riverNode',
    chargingTime: 24,
    availableChargers: 4,
    totalChargers: 6,
    isAvailable: true,
    isFastCharger: true,
    address: '14 Harbor Way · East District'
  },
  {
    id: 'solar',
    name: 'Solar Plaza Hub',
    node: 'solarNode',
    chargingTime: 38,
    availableChargers: 6,
    totalChargers: 8,
    isAvailable: true,
    isFastCharger: false,
    address: '88 Meridian Ave · Civic Core'
  },
  {
    id: 'north',
    name: 'North Loop Energy',
    node: 'northNode',
    chargingTime: 19,
    availableChargers: 1,
    totalChargers: 4,
    isAvailable: false,
    isFastCharger: true,
    address: '6 Circuit Lane · North Loop'
  },
  {
    id: 'park',
    name: 'Parkside Volt',
    node: 'parkNode',
    chargingTime: 16,
    availableChargers: 3,
    totalChargers: 5,
    isAvailable: true,
    isFastCharger: true,
    address: '201 Greenway · West Park'
  }
];
```

The final station distances and travel times displayed in the interface must come from Dijkstra’s results, not hardcoded station distance fields.

---

## 5. Dijkstra’s algorithm behavior

Implement a reusable function:

```javascript
function dijkstra(graph, startNode) {
  // Return shortest distances, travel times, and paths
}
```

The function should:

1. Initialize all distances to infinity.
2. Set the origin distance to zero.
3. Use a priority queue or sorted queue.
4. Repeatedly select the unvisited node with the smallest distance.
5. Relax each neighboring edge.
6. Store the previous node for path reconstruction.
7. Return:
   - shortest distance to every node
   - shortest travel time to every node
   - previous-node map
   - reconstructed path for every station

Display the following in the algorithm explanation panel:

- Number of graph nodes visited
- Number of edges considered
- Shortest path to the selected station
- Total route distance
- Total travel time

Example explanation copy:

> Dijkstra explored 7 nodes and selected the lowest-distance path from your origin to Riverfront Charge. The final route is origin → junctionB → riverNode.

---

## 6. Battery feasibility logic

Use a simple frontend assumption because no vehicle model is provided:

```javascript
const maximumRangeKm = 40;
const safetyReserve = 0.10;
const safeRangeKm = (batteryPercentage / 100) * maximumRangeKm * (1 - safetyReserve);
```

A station is battery-feasible only when:

```javascript
shortestDistanceToStation <= safeRangeKm
```

It must also satisfy the user’s comfortable-distance input:

```javascript
shortestDistanceToStation <= comfortableDistance
```

Show a clear status for every station:

- `Reachable`
- `Outside range`
- `Available`
- `Busy`
- `Fast charger`
- `Unavailable`

Battery feasibility is a hard filter, not merely a score preference.

---

## 7. Greedy station-selection logic

After Dijkstra calculates shortest routes, apply the Greedy selection stage.

### Filtering stage

Remove stations when:

- Their shortest path exceeds the safe battery range.
- Their shortest path exceeds the comfortable distance.
- They are unavailable when the filter is `Available now`.
- They are not fast chargers when the filter is `Fast chargers only`.

### Scoring stage

Give every remaining station a score from 0 to 100.

Use a transparent formula such as:

```javascript
score =
  100
  - (shortestDistance * 2.1)
  - (chargingTime * 0.55)
  - Math.max(0, chargingTime - preferredChargingTime) * 0.25
  + (isAvailable ? 10 : -12);
```

Clamp the score between 0 and 100.

Sort eligible stations by:

1. Highest score first
2. Shortest Dijkstra distance as the tie-breaker
3. Shortest charging time as the second tie-breaker

Select the first station as the greedy recommendation.

The UI must explicitly label the result:

- `Best match`
- `Rank #1`
- `Greedy pick`

Explain that the greedy algorithm chooses the best current eligible option after Dijkstra has calculated the shortest paths.

---

## 8. Map and route visualization

Create a frontend-only map-style visualization. It does not need a real map API.

The map should include:

- Light grid background
- Curved simulated roads
- Vehicle origin marker labeled `You are here`
- Four station markers
- Selected station marker with cyan-violet glow
- Highlighted Dijkstra route from origin to selected station
- Alternative station markers in a muted color
- Small scale indicator such as `5 km`
- Legend:
  - Your location
  - Best match
  - Alternative

When the recommended station changes, update the route line using the reconstructed Dijkstra path.

When the user clicks a station marker or ranked station row:

- Highlight that station
- Show its route
- Update route distance
- Update arrival time
- Update arrival battery
- Mark the recommendation as `Preview` if it is not rank #1

---

## 9. Recommendation card

Create a large recommendation card beside the map.

Show:

- `Best match`
- `Rank #1`
- Station name
- Address
- Match score
- Dijkstra route distance
- Estimated travel time
- Charging time
- Available chargers, such as `4 / 6 open`
- Battery percentage on arrival
- Reason the station wins
- Button: `Choose this station`

Example recommendation reason:

> Riverfront Charge is the highest-scoring eligible stop: Dijkstra found a short route, the station is available now, and its charging time stays below your selected patience target.

When there are no eligible stations, show an empty state:

- `No safe match yet`
- `No station clears the current battery and availability guardrails.`
- Suggest increasing comfortable distance or showing all stations.

---

## 10. Ranked alternatives section

Create a ranked list titled:

- Small label: `03 / Alternatives`
- Heading: `Every option, ranked.`

Each station row should show:

- Rank number
- Station name
- Dijkstra distance
- Charging time
- Status badge
- Match score

Use different states:

- Green: `Open now`
- Amber: `Busy`
- Red: `Closed`
- Amber: `Outside range`
- Cyan: `Fast charger`

Clicking a station row should preview it on the map.

Include:

- `Simulated availability` indicator
- `View decision details` button
- Reset icon button

---

## 11. Algorithm explanation section

Create an expandable section titled:

- Small label: `04 / The DAA layer`
- Heading: `Not just the nearest. The smartest.`
- Supporting text: `Dijkstra finds the shortest routes. Greedy ranking chooses the best eligible stop.`

Show three connected steps:

### Step 1 — Dijkstra / Find the route

Copy:

> Explore the road graph from your origin and calculate the shortest distance and travel time to every charging station.

### Step 2 — Filter / Remove impossible options

Copy:

> Remove stations that are outside your safe battery range, outside your comfortable distance, or unavailable under the selected filter.

### Step 3 — Greedy / Choose the best current option

Copy:

> Score the remaining stations using distance, charging time, and availability, then select the highest-scoring station.

When expanded, show:

- Current scoring formula
- Dijkstra nodes visited
- Edges considered
- Reconstructed shortest path
- Score component bars
- Explanation of the tie-breaking rule

Use an info note:

> Battery feasibility is a hard gate, not a soft preference. A station cannot win if the vehicle cannot safely reach it.

---

## 12. Interactions required for the demo

Implement all of these frontend interactions:

1. Moving the battery slider updates battery feasibility.
2. Moving the distance slider changes which stations are reachable.
3. Moving the charging-time slider changes the score.
4. Changing availability updates the eligible station list.
5. Recalculate button recomputes Dijkstra and Greedy results.
6. Reset button restores the default scenario.
7. Clicking a station marker previews its route.
8. Clicking a ranked station row previews its route.
9. Choosing a station changes the button to `Route selected` and shows a toast.
10. Algorithm explanation expands and collapses.
11. Score bars update according to the focused station.
12. Empty states appear when no station is feasible.
13. Responsive layout works on desktop, tablet, and mobile.

Use short toast messages such as:

- `Riverfront Charge is your smartest stop.`
- `Availability filter updated.`
- `Planner reset to the demo scenario.`
- `Route selected.`
- `No station clears the current guardrails.`

---

## 13. Responsive behavior

### Desktop

- Two-column map and result layout
- Four input cards in one horizontal row
- Algorithm steps in one horizontal row

### Tablet

- Two-column input layout
- Map above results when necessary
- Algorithm steps may remain horizontal or wrap

### Mobile

- Single-column layout
- Collapsed navigation or compact header
- Full-width buttons
- Map remains visible but shorter
- Recommendation card appears before alternatives
- Algorithm steps stack vertically
- No horizontal overflow

---

## 14. Accessibility requirements

Include:

- Semantic HTML
- Labels for every input
- Accessible button names
- Keyboard focus states
- Sufficient color contrast
- `aria-live` toast for recommendation updates
- `aria-expanded` on the algorithm explanation toggle
- `aria-label` on map markers
- Do not communicate important states by color alone

---

## 15. Technical constraints

Use a dependency-free frontend if possible:

- HTML
- CSS
- JavaScript
- SVG for the map and icons

A React implementation is also acceptable, but do not add a backend.

Keep the following files organized:

```text
index.html
styles.css
app.js
public/manus-routes.json
README.md
```

The app must run on port 3000 and serve:

```text
GET /
GET /manus-routes.json
```

Use a single-page route manifest:

```json
{
  "routes": [
    {
      "path": "/",
      "title": "ChargePath EV Charging Station Planner"
    }
  ]
}
```

---

## 16. Default demo scenario

Use these starting values:

- Battery: 64%
- Comfortable distance: 18 km
- Charging patience: 35 minutes
- Availability: Available now

The default result should show at least two eligible stations and one recommended station.

The default interface should make it easy to demonstrate a decision change:

1. Start with the default result.
2. Open the DAA explanation.
3. Reduce battery to approximately 35%.
4. Recalculate.
5. Show one or more stations becoming outside the safe range.
6. Change availability to `Show all stations`.
7. Preview a different station.
8. Choose the final recommendation.

---

## 17. Judge-facing technical explanation

Add a small `Demo notes` or README section with this explanation:

> The application uses Dijkstra’s algorithm to calculate the shortest path from the vehicle’s origin to each charging station in a simulated road graph. It then applies battery and availability filters. Finally, a greedy ranking function scores the remaining feasible stations using route distance, charging time, and availability, selecting the highest-scoring option.

Also mention the limitation:

> This is a frontend prototype with simulated roads and station data. A production version could connect the same algorithm pipeline to real map routing, GPS, charger availability, queue, and pricing APIs.

---

## 18. Definition of done

The frontend is complete when:

- The dashboard loads without console errors.
- All four inputs work.
- Dijkstra visibly calculates route distance, travel time, and path.
- Greedy ranking visibly selects the best feasible station.
- Unavailable and unreachable stations are clearly marked.
- The recommendation changes when inputs change.
- The map route changes when a station is selected.
- The algorithm explanation is expandable.
- The interface is responsive.
- The frontend can be demonstrated without backend access.
- The README explains the algorithm and demo flow.

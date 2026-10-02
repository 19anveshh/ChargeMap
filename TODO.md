# ChargePath Frontend Outcomes

- [ ] Build a frontend-only EV charging station planner with controls for distance, battery level, charging time, and station availability, using a realistic simulated dataset and no backend requirement.
- [ ] Show a dashboard summary with current vehicle battery, route assumptions, reachable station count, and the current recommendation.
- [ ] Filter out stations that are unavailable or unreachable under the current battery and distance inputs, and visibly distinguish risky, unavailable, and reachable states.
- [ ] Apply a greedy station-selection algorithm that ranks eligible stations using distance, battery feasibility, charging time, and availability, then recommend the best score.
- [ ] Show ranked station alternatives with score breakdowns, status indicators, and clickable selection states.
- [ ] Provide an expandable explanation panel describing the greedy filtering, normalization, scoring, and tie-breaking logic.
- [ ] Provide an interactive map-style route view with the vehicle origin, station markers, and a highlighted recommended route.
- [ ] Provide scenario controls and reset/recalculate actions so the recommendation changes visibly across different input combinations.
- [ ] Deliver a responsive, presentation-ready interface with success, warning, empty, and unavailable states.

# ChargePath Implementation Plan

## Product scope
ChargePath is a frontend-only hackathon demo for selecting the best simulated EV charging station from distance, battery level, charging time, and station availability. It uses a deterministic greedy ranking model over a built-in station dataset; no backend or live API is required.

## Design direction
- **Design Movement:** Arctic Glass Mobility Lab — a bright near-future mobility command center built from translucent glass surfaces and precise map-like telemetry.
- **Core Principles:** 1) Make the recommendation obvious at a glance. 2) Expose the algorithm instead of hiding it. 3) Use spatial route context to make the decision feel real. 4) Make every control demo-friendly and responsive.
- **Color Philosophy:** A pale ice canvas keeps the interface optimistic and legible. Icy cyan represents movement and reachable energy; violet marks the decision layer; mint/green signals availability and success; amber is reserved for battery risk.
- **Layout Paradigm:** A dashboard that behaves like a cockpit: a horizontal input rail anchors the top, a wide map pane establishes context, and a recommendation rail presents the decision beside it.
- **Signature Elements:** Frosted cards with luminous top edges, route ribbons and station pins, compact telemetry labels with monospaced micro-values.
- **Interaction Philosophy:** Inputs recalculate instantly, but a deliberate "Recalculate route" CTA provides a clear demo moment. Clicking a candidate previews its route; the algorithm panel turns selection into a teachable story.
- **Animation:** 180–320ms ease-out transitions for cards and controls; route path draws in; station pins float gently; recommendation card uses a subtle cyan/violet glow rather than loud motion.
- **Typography System:** Manrope for interface text and Space Grotesk for display numerals/wordmark, with IBM Plex Mono for algorithm telemetry.
- **Brand Essence:** "Less range anxiety, more certainty." ChargePath is decisive, transparent, and optimistic.
- **Brand Voice:** Concise, confident, human. Example lines: "One route. Three checks. Zero guesswork." and "The nearest station is not always the smartest stop."
- **Wordmark & Logo:** A split-path C mark: two curved route strokes converge into a small charging bolt, paired with the ChargePath wordmark.
- **Signature Brand Color:** Ice cyan `#11C5E8`, supported by electric violet `#7455F6` and glacier mint `#BBF7D0`.

## Project structure
- `index.html`: app shell, semantic dashboard sections, icon sprite, and page metadata.
- `styles.css`: visual system, responsive layout, map art, and state styling.
- `app.js`: simulated station data, greedy score calculation, controls, map/ranking updates, and explanation interactions.
- `public/manus-routes.json`: route manifest for the single-page app.
- `plan.md`: approved plan and design decisions.
- `TODO.md`: acceptance outcomes for the frontend build.

## Implementation decisions
- Use a dependency-free static frontend served by a tiny Node HTTP server on port 3000 so the preview starts reliably.
- Keep all calculations in the browser. A station is eligible only when it is available under the selected availability filter and its distance is within the user-entered travel distance and battery-derived safe range.
- The greedy score is a weighted sum of normalized distance, charging time, and availability penalty; infeasible stations are filtered before ranking.
- Include algorithm explanation, score bars, and state labels so judges can connect the visuals to DAA concepts immediately.

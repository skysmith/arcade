# Solar Neighborhood Star Chart

Interactive 3D star chart cabinet for the local arcade shelf.

## Current Slice

- Sun-centered Three.js star chart with approximate RA/Dec/distance placement
- Expanded solar-system orrery at the origin with approximate present-day orbital periods from J2000
- Proxima Centauri snap-in view with confirmed Proxima d and b plus a faint disputed Proxima c candidate orbit
- Faint galactic-plane ring and galactic-core direction cue for orientation in map-scale views
- Distance presets for the solar view, 12 ly, 25 ly, and 50 ly
- Selectable stars and planets with detail readouts
- Search, labels, orbit visibility, route-line toggles, and orbit time speed
- Launcher metadata for the arcade shelf

## Accuracy Notes

The stellar chart uses approximate light-year distances, J2000-style right ascension, and declination for a curated solar-neighborhood set. Marker sizes are intentionally readable rather than physically scaled. Planet orbits are expanded at the focused star because real planetary systems are far too small to see on a light-year map.

Nearby-star values were checked against public nearby-star references such as [RECONS Top 100](https://www.recons.org/TOP100.posted.htm) and the [RECONS 10 parsec census](https://recons.org/census.posted.htm). Proxima b and d values follow NASA's exoplanet catalog pages for [Proxima Centauri b](https://science.nasa.gov/exoplanet-catalog/proxima-centauri-b/) and [Proxima Centauri d](https://science.nasa.gov/exoplanet-catalog/proxima-centauri-d/). Proxima c is rendered as a faint candidate because its status remains disputed. This is a practical atlas, not a precision astrometry tool.

## Controls

- Drag: rotate the chart
- Wheel or trackpad scroll: zoom
- Click/tap: select a star or planet
- Snap in: select Proxima Centauri, then use Snap in to view its local planets
- Presets: jump between solar, 12 ly, 25 ly, and 50 ly views
- Search: select a known star or planet

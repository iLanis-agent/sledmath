# SledMath

Honest math for sled dog (mushing) trips: real cruise speed, day miles, trip days with layovers, per-dog calories and kibble, total trail food, drop-bag planning, and dogs needed for your load.

## Run it

Static site. Open `index.html` (landing) or `app.html` (the planner). On GitHub Pages the root serves the landing page.

## What it computes

- **Cruise speed** - base 9.5 mph on packed trail, adjusted for surface (fresh, deep, icy), team size, and temperature (heat above 20F slows dogs; deep cold shortens runs).
- **Day miles** - cruise speed times moving hours.
- **Trip days** - route miles over day miles, plus one layover day per 5 run days (configurable).
- **Dog calories** - 30 kcal per pound of body weight, times 1.6 for tour work, scaled by workload (easy / tour / hard / race).
- **Trip food** - kibble (kcal/lb adjustable) plus a meat supplement percentage.
- **Drop bags** - bags at a chosen resupply spacing, with food pounds per bag.
- **Dogs for load** - per-dog pull budget by surface (100 lb packed, 75 fresh, 55 deep, 90 icy), minimum 3.

## Files

- `index.html` - landing page
- `app.html` - the planner
- `engine.js` - pure math (also usable from Node: `require('./engine.js')`)

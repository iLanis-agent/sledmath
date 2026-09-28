/* SledMath engine - sled dog team math for distance mushing trips. */
(function (root) {
  "use strict";

  /* Honest cruise speed in mph for a dog team, by trail surface and air temp.
     Base 9.5 mph on packed trail with a mid-size team. */
  function cruiseSpeed(opts) {
    var surface = (opts && opts.surface) || "packed";
    var dogs = opts && typeof opts.dogs === "number" ? opts.dogs : 8;
    var tempF = opts && typeof opts.tempF === "number" ? opts.tempF : 10;
    var base = 9.5;
    if (surface === "fresh") base = 7.0;
    else if (surface === "deep") base = 4.5;
    else if (surface === "icy") base = 8.0;
    if (dogs <= 5) base *= 0.92;
    else if (dogs >= 12) base *= 1.06;
    /* Heat penalty above 20F; cold penalty below -30F (breaks get longer). */
    if (tempF > 20) base *= Math.max(0.7, 1 - (tempF - 20) * 0.012);
    if (tempF < -30) base *= 0.88;
    return Math.round(base * 10) / 10;
  }

  /* Miles per day: run hours on the clock minus rest. runHours = time moving. */
  function dayMiles(opts) {
    var mph = cruiseSpeed(opts);
    var runHours = opts && typeof opts.runHours === "number" ? opts.runHours : 8;
    return Math.round(mph * runHours * 10) / 10;
  }

  /* Trip days for a route, with one layover day per N days (musher recovery). */
  function tripDays(opts) {
    var miles = opts && typeof opts.miles === "number" ? opts.miles : 100;
    var perDay = dayMiles(opts);
    if (perDay <= 0) return Infinity;
    var runDays = Math.ceil(miles / perDay);
    var layoverEvery = opts && typeof opts.layoverEvery === "number" ? opts.layoverEvery : 5;
    var layovers = layoverEvery > 0 ? Math.floor((runDays - 1) / layoverEvery) : 0;
    return runDays + layovers;
  }

  /* Daily kcal per dog by body weight (lb) and workload.
     Base: 30 * lb * 1.6 for tour work; multiplier by workload. */
  function dogKcal(weightLb, workload) {
    var base = 30 * weightLb * 1.6;
    var mult = 1.0;
    if (workload === "hard") mult = 1.25;
    else if (workload === "race") mult = 1.6;
    else if (workload === "easy") mult = 0.8;
    return Math.round(base * mult);
  }

  /* Daily kibble pounds per dog given kibble kcal per pound (~1500 typical). */
  function dogKibbleLb(weightLb, workload, kcalPerLb) {
    var k = typeof kcalPerLb === "number" && kcalPerLb > 0 ? kcalPerLb : 1500;
    return Math.round((dogKcal(weightLb, workload) / k) * 100) / 100;
  }

  /* Total food pounds for the trip for the whole team, plus meat supplement pct. */
  function tripFoodLb(opts) {
    var dogs = opts && typeof opts.dogs === "number" ? opts.dogs : 8;
    var weightLb = opts && typeof opts.weightLb === "number" ? opts.weightLb : 50;
    var workload = (opts && opts.workload) || "tour";
    var kcalPerLb = opts && typeof opts.kcalPerLb === "number" ? opts.kcalPerLb : 1500;
    var meatPct = opts && typeof opts.meatPct === "number" ? opts.meatPct : 20;
    var days = tripDays(opts);
    if (!isFinite(days)) return Infinity;
    var kibblePerDog = dogKibbleLb(weightLb, workload, kcalPerLb);
    var kibbleTotal = kibblePerDog * dogs * days;
    var meatTotal = kibbleTotal * (meatPct / 100);
    return Math.round((kibbleTotal + meatTotal) * 10) / 10;
  }

  /* Dogs needed to pull total load (sled + gear + driver) at a per-dog pull
     budget. Packed trail allows ~100 lb per dog on the flat. */
  function dogsForLoad(loadLb, surface) {
    var perDog = 100;
    if (surface === "fresh") perDog = 75;
    else if (surface === "deep") perDog = 55;
    else if (surface === "icy") perDog = 90;
    return Math.max(3, Math.ceil(loadLb / perDog));
  }

  /* Drop bags: how many resupply bags and food lb per bag for a route with
     legs separated by spacing miles. */
  function dropBags(opts) {
    var miles = opts && typeof opts.miles === "number" ? opts.miles : 300;
    var spacing = opts && typeof opts.spacing === "number" ? opts.spacing : 60;
    var total = tripFoodLb(opts);
    if (!isFinite(total)) return { bags: Infinity, lbPerBag: Infinity };
    var bags = Math.max(1, Math.ceil(miles / spacing) - 1);
    return { bags: bags, lbPerBag: Math.round((total / (bags + 1)) * 10) / 10 };
  }

  var api = {
    cruiseSpeed: cruiseSpeed,
    dayMiles: dayMiles,
    tripDays: tripDays,
    dogKcal: dogKcal,
    dogKibbleLb: dogKibbleLb,
    tripFoodLb: tripFoodLb,
    dogsForLoad: dogsForLoad,
    dropBags: dropBags
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.SledMath = api;
})(typeof window !== "undefined" ? window : globalThis);

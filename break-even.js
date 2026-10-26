(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var cur = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'CAD', currencyDisplay: 'narrowSymbol', maximumFractionDigits: 2 });
  var cur0 = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'CAD', currencyDisplay: 'narrowSymbol', maximumFractionDigits: 0 });
  var num = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });

  // Pure maths, exported on window for testing.
  // contribution per unit = price - variable cost; break-even units = fixed / contribution (rounded up).
  function compute(i) {
    var keys = ['fixed', 'price', 'variable', 'target'];
    for (var k = 0; k < keys.length; k++) { if (!isFinite(i[keys[k]])) return { error: 'Please enter numbers only.' }; }
    if (i.fixed < 0) return { error: 'Fixed costs can\'t be negative.' };
    if (i.price <= 0) return { error: 'Selling price must be greater than zero.' };
    if (i.variable < 0) return { error: 'Variable cost can\'t be negative.' };
    if (i.target < 0) return { error: 'Target profit can\'t be negative.' };
    var contribution = i.price - i.variable;
    if (contribution <= 0) return { error: 'Your selling price must be higher than your cost per unit, otherwise you never break even.' };
    var units = Math.ceil(i.fixed / contribution - 1e-9);
    var unitsTarget = Math.ceil((i.fixed + i.target) / contribution - 1e-9);
    return {
      contribution: contribution,
      contributionPct: contribution / i.price * 100,
      units: units,
      revenue: units * i.price,
      unitsTarget: unitsTarget,
      revenueTarget: unitsTarget * i.price
    };
  }
  window.TallybenchBreakEven = { compute: compute };

  function parse(s) { return Number(String(s).replace(/[$,\s%]/g, '')); }
  var form = $('f');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var out = $('out'), err = $('err');
    err.textContent = '';
    var ids = ['fixed', 'price', 'variable', 'target'];
    var vals = {};
    for (var k = 0; k < ids.length; k++) {
      var raw = $(ids[k]).value.trim();
      if (raw === '') { out.hidden = true; err.textContent = 'Please fill in every field (use 0 where it doesn\'t apply).'; return; }
      vals[ids[k]] = parse(raw);
    }
    var r = compute(vals);
    if (r.error) { out.hidden = true; err.textContent = r.error; return; }
    $('r-units').textContent = num.format(r.units);
    $('r-revenue').textContent = cur0.format(r.revenue);
    $('r-contrib').textContent = cur.format(r.contribution);
    $('r-contribpct').textContent = (Math.round(r.contributionPct * 100) / 100).toLocaleString(undefined, { maximumFractionDigits: 2 }) + '%';
    $('r-tunits').textContent = num.format(r.unitsTarget);
    $('r-trevenue').textContent = cur0.format(r.revenueTarget);
    out.hidden = false;
  });

  $('reset').addEventListener('click', function () {
    form.reset(); $('out').hidden = true; $('err').textContent = '';
  });
})();

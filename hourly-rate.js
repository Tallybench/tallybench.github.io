(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var cur = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'CAD', currencyDisplay: 'narrowSymbol', maximumFractionDigits: 2 });
  var cur0 = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'CAD', currencyDisplay: 'narrowSymbol', maximumFractionDigits: 0 });
  var num = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });

  // Pure maths, exported on window for testing.
  // Revenue needed = (take-home + expenses) / (1 - tax%). Simplified gross-up; ignores tax brackets.
  function compute(i) {
    var keys = ['takeHome', 'expenses', 'taxPct', 'weeksOff', 'hoursPerWeek', 'billablePct'];
    for (var k = 0; k < keys.length; k++) { if (!isFinite(i[keys[k]])) return { error: 'Please enter numbers only.' }; }
    if (i.takeHome <= 0) return { error: 'Desired take-home income must be greater than zero.' };
    if (i.expenses < 0) return { error: 'Expenses can\'t be negative.' };
    if (i.taxPct < 0 || i.taxPct >= 100) return { error: 'Tax set-aside must be at least 0% and less than 100%.' };
    if (i.weeksOff < 0 || i.weeksOff >= 52) return { error: 'Weeks off must be between 0 and 51.' };
    if (i.hoursPerWeek <= 0 || i.hoursPerWeek > 120) return { error: 'Working hours per week must be between 1 and 120.' };
    if (i.billablePct <= 0 || i.billablePct > 100) return { error: 'Billable time must be above 0% and at most 100%.' };
    var revenue = (i.takeHome + i.expenses) / (1 - i.taxPct / 100);
    var billableHours = (52 - i.weeksOff) * i.hoursPerWeek * (i.billablePct / 100);
    var hourly = revenue / billableHours;
    return {
      revenue: revenue,
      billableHours: billableHours,
      hourly: hourly,
      daily: hourly * 8,
      monthlyRevenue: revenue / 12
    };
  }
  window.TallybenchHourly = { compute: compute };

  function parse(s) { return Number(String(s).replace(/[$,\s%]/g, '')); }
  var form = $('f');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var out = $('out'), err = $('err');
    err.textContent = '';
    var ids = ['takeHome', 'expenses', 'taxPct', 'weeksOff', 'hoursPerWeek', 'billablePct'];
    var vals = {};
    for (var k = 0; k < ids.length; k++) {
      var raw = $(ids[k]).value.trim();
      if (raw === '') { out.hidden = true; err.textContent = 'Please fill in every field (use 0 where it doesn\'t apply).'; return; }
      vals[ids[k]] = parse(raw);
    }
    var r = compute(vals);
    if (r.error) { out.hidden = true; err.textContent = r.error; return; }
    $('r-hourly').textContent = cur.format(r.hourly);
    $('r-daily').textContent = cur.format(r.daily);
    $('r-revenue').textContent = cur0.format(r.revenue);
    $('r-monthly').textContent = cur0.format(r.monthlyRevenue);
    $('r-hours').textContent = num.format(r.billableHours) + ' h';
    out.hidden = false;
  });

  $('reset').addEventListener('click', function () {
    form.reset(); $('out').hidden = true; $('err').textContent = '';
  });
})();

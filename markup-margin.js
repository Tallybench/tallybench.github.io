(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var cur = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'CAD', currencyDisplay: 'narrowSymbol', maximumFractionDigits: 2 });
  var pct = function (x) { return (Math.round(x * 100) / 100).toLocaleString(undefined, { maximumFractionDigits: 2 }) + '%'; };

  // Pure maths, exported on window for testing.
  function compute(cost, mode, v) {
    if (!isFinite(cost) || !isFinite(v)) return { error: 'Please enter numbers only.' };
    if (cost <= 0) return { error: 'Cost must be greater than zero.' };
    var price;
    if (mode === 'markup') {
      if (v <= -100) return { error: 'Markup must be greater than -100%.' };
      price = cost * (1 + v / 100);
    } else if (mode === 'margin') {
      if (v >= 100) return { error: 'Margin must be less than 100%.' };
      price = cost / (1 - v / 100);
    } else {
      if (v <= 0) return { error: 'Selling price must be greater than zero.' };
      price = v;
    }
    var profit = price - cost;
    return { price: price, profit: profit, markup: profit / cost * 100, margin: profit / price * 100 };
  }
  window.TallybenchCalc = { compute: compute };

  function parse(s) { return Number(String(s).replace(/[$,\s%]/g, '')); }

  var labels = { markup: 'Markup %', margin: 'Margin %', price: 'Selling price' };
  var mode = $('mode');
  mode.addEventListener('change', function () {
    $('vallabel').textContent = labels[mode.value];
    $('val').placeholder = mode.value === 'price' ? 'e.g. 100' : 'e.g. 25';
  });

  $('f').addEventListener('submit', function (e) {
    e.preventDefault();
    var costStr = $('cost').value.trim(), valStr = $('val').value.trim();
    var out = $('out'), err = $('err');
    err.textContent = '';
    if (!costStr || !valStr) { out.hidden = true; err.textContent = 'Enter both a cost and a value.'; return; }
    var r = compute(parse(costStr), mode.value, parse(valStr));
    if (r.error) { out.hidden = true; err.textContent = r.error; return; }
    $('r-price').textContent = cur.format(r.price);
    $('r-profit').textContent = cur.format(r.profit);
    $('r-markup').textContent = pct(r.markup);
    $('r-margin').textContent = pct(r.margin);
    out.hidden = false;
  });

  $('reset').addEventListener('click', function () {
    $('f').reset(); $('out').hidden = true; $('err').textContent = '';
    $('vallabel').textContent = labels.markup;
  });

  var body = document.querySelector('#tbl tbody');
  [10, 15, 20, 25, 30, 40, 50, 75, 100].forEach(function (m) {
    var tr = document.createElement('tr');
    var a = document.createElement('td'); a.textContent = m + '%';
    var b = document.createElement('td'); b.textContent = pct(m / (100 + m) * 100);
    tr.appendChild(a); tr.appendChild(b); body.appendChild(tr);
  });
})();

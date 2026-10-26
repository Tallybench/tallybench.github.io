// Quick sanity tests for the markup/margin maths. Run: node test-calc.js
global.window = {};
global.document = { getElementById: () => ({ addEventListener() {}, }), querySelector: () => ({ appendChild() {} }), createElement: () => ({ appendChild() {} }) };
global.Intl = Intl;
try { require('../markup-margin.js'); } catch (e) { /* DOM wiring not needed for tests */ }
const { compute } = global.window.TallybenchCalc;
const approx = (a, b) => Math.abs(a - b) < 1e-9;
let fails = 0;
function check(name, ok) { if (!ok) { fails++; console.log('FAIL', name); } else console.log('ok  ', name); }

let r = compute(80, 'markup', 25);
check('markup 25% on 80 -> price 100', approx(r.price, 100) && approx(r.profit, 20) && approx(r.margin, 20));
r = compute(80, 'margin', 20);
check('margin 20% on 80 -> price 100, markup 25', approx(r.price, 100) && approx(r.markup, 25));
r = compute(80, 'price', 100);
check('price 100 on cost 80 -> markup 25, margin 20', approx(r.markup, 25) && approx(r.margin, 20));
check('margin 100 rejected', !!compute(80, 'margin', 100).error);
check('zero cost rejected', !!compute(0, 'markup', 10).error);
check('NaN rejected', !!compute(NaN, 'markup', 10).error);
check('negative price rejected', !!compute(10, 'price', -5).error);
r = compute(50, 'markup', 100);
check('markup 100% -> margin 50%', approx(r.margin, 50));
process.exit(fails ? 1 : 0);

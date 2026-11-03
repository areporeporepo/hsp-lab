// node test.js : verifies the math core numerically
const Q = require("./core.js");
let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.log("FAIL", m); } };

// QFT circuit equals DFT matrix
for (let n = 1; n <= 7; n++) { const e = Q.qftCircuitError(n); ok(e < 1e-10, `qft n=${n} err=${e}`); }

// order + distribution normalization + brute-force check vs explicit state vector
function bruteDist(a, N, n) {
  const QQ = 1 << n, P = new Float64Array(QQ), groups = new Map();
  for (let x = 0; x < QQ; x++) { const f = Q.modpow(a, x, N); if (!groups.has(f)) groups.set(f, []); groups.get(f).push(x); }
  for (const xs of groups.values()) for (let y = 0; y < QQ; y++) {
    let re = 0, im = 0; for (const x of xs) { const t = 2 * Math.PI * x * y / QQ; re += Math.cos(t); im += Math.sin(t); }
    P[y] += (re * re + im * im) / (QQ * QQ);
  }
  return P;
}
for (const [a, N, n] of [[7, 15, 8], [2, 21, 9], [2, 35, 9], [5, 33, 10], [3, 91, 11]]) {
  const r = Q.order(a, N), P = Q.shorDistribution(r, 1 << n), B = bruteDist(a, N, n);
  const sum = P.reduce((s, v) => s + v, 0); ok(Math.abs(sum - 1) < 1e-9, `norm a=${a} N=${N} sum=${sum}`);
  let e = 0; for (let i = 0; i < P.length; i++) e = Math.max(e, Math.abs(P[i] - B[i]));
  ok(e < 1e-9, `closed form vs brute a=${a} N=${N} err=${e}`);
}
ok(Q.order(7, 15) === 4, "ord 7 mod 15"); ok(Q.order(2, 21) === 6, "ord 2 mod 21");

// continued fractions
const cf = Q.convergents(415, 93); ok(cf.map(c => c.a).join() === "4,2,6,7", "cf 415/93 = [4;2,6,7]");
// end-to-end Shor success rate
let seed = 12345; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
for (const N of [15, 21, 33, 35, 39, 51, 55, 77, 91, 143, 221]) {
  let factored = false;
  for (let t = 0; t < 40 && !factored; t++) {
    const a = 2 + Math.floor(rnd() * (N - 3)); if (Q.gcd(a, N) !== 1) continue;
    const n = Q.registerSize(N), r = Q.order(a, N), P = Q.shorDistribution(r, 1 << n);
    const y = Q.sample(P, rnd), rec = Q.recoverPeriod(y, 1 << n, a, N);
    if (rec.r) { ok(rec.r % r === 0, `recovered multiple of r N=${N}`); const sp = Q.splitFromPeriod(a, rec.r, N); if (sp.ok) { ok(sp.p * sp.q === N, `split N=${N}`); factored = true; } }
  }
  ok(factored, `factored N=${N}`);
}
// regressions from Astra review
ok(Q.recoverPeriod(128, 512, 2, 21).r === 6, "y=128,Q=512,a=2,N=21 must give r=6 not 12, got " + Q.recoverPeriod(128, 512, 2, 21).r);
// j/r = 8/16 reduces to 1/2: needs m = 8 > B = 5, so this shot must FAIL (sample again), not be rescued
ok(Q.recoverPeriod(256, 512, 3, 17).r === null, "a=3,N=17,y=256 should fail with bounded m");
// off-peak samples must mostly fail when r is large (old code brute-forced r from the 0/1 convergent)
{ const N = 221; let a = 2; while (Q.order(a, N) < 40) a++; const r = Q.order(a, N), QQ = 1 << Q.registerSize(N);
  let offFail = 0, off = 0; for (let y = 1; y < QQ; y += 7) { let dist = Infinity; for (let j = 0; j <= r; j++) dist = Math.min(dist, Math.abs(y - j * QQ / r)); if (dist > 3) { off++; if (!Q.recoverPeriod(y, QQ, a, N).r) offFail++; } }
  ok(offFail / off > 0.5, `off-peak y should mostly fail for a=${a}, r=${r}: ${offFail}/${off}`); console.log(`off-peak N=221 a=${a} r=${r}: ${offFail}/${off} fail`); }
// never uses the trivial 0/1 convergent, multiplier stays within B
for (let y = 1; y < 512; y++) { const rec = Q.recoverPeriod(y, 512, 2, 21); if (rec.r) ok(rec.from.h !== 0 && rec.mult <= Math.ceil(Math.log2(21)), `y=${y} used trivial convergent or big m`); }
// every recovered r must equal the true order exactly
for (const [a, N] of [[2, 21], [7, 15], [2, 35], [3, 91], [5, 221]]) { const r = Q.order(a, N), n = Q.registerSize(N), P = Q.shorDistribution(r, 1 << n);
  for (let y = 0; y < (1 << n); y++) if (P[y] > 1e-6) { const rec = Q.recoverPeriod(y, 1 << n, a, N); if (rec.r) ok(rec.r === r, `exact r a=${a} N=${N} y=${y} got ${rec.r}`); } }
// Simon
for (let n = 2; n <= 10; n++) for (let trial = 0; trial < 5; trial++) {
  const s = 1 + Math.floor(rnd() * ((1 << n) - 1)), f = Q.simonOracle(s);
  for (let x = 0; x < (1 << n); x++) ok(f(x) === f(x ^ s), "simon oracle");
  const ys = []; let got = null;
  for (let k = 0; k < 200 && got === null; k++) { ys.push(Q.simonSample(n, s, rnd)); got = Q.gf2NullVector(ys, n); }
  ok(got === s, `simon n=${n} s=${s} got=${got}`);
}
// surface code sanity
ok(Q.surfaceDistanceFor(1e-3, 2e-12) === 21, "d for p=1e-3, budget 2e-12 is " + Q.surfaceDistanceFor(1e-3, 1e-12));
console.log(fails ? `${fails} FAILURES` : "all tests passed");
process.exit(fails ? 1 : 0);

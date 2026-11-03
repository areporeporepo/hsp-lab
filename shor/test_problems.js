// node test_problems.js : recompute every answer key from first principles
const { problems, check } = require("./problems.js");
const Q = require("./core.js");
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log("FAIL", m); } };
const get = (id) => problems.find(p => p.id === id).fields;
const C = (re, im) => ({ re, im });

// p1: toy period finding, N=16, p=4, explicit state vector
{ const N = 16, p = 4, probs = [];
  for (let y = 0; y < N; y++) { let re = 0, im = 0; for (let k = 0; k < N / p; k++) { const t = 2 * Math.PI * y * (1 + k * p) / N; re += Math.cos(t); im += Math.sin(t); } probs.push((re * re + im * im) / (N * (N / p))); }
  const ys = probs.map((v, y) => v > 1e-9 ? String(y) : null).filter(Boolean);
  ok(JSON.stringify(ys) === JSON.stringify(get("p1")[0].answer), "p1 set " + ys); ok(Math.abs(probs[4] - get("p1")[1].answer) < 1e-9, "p1 prob"); }
// p2
ok(64 / Q.gcd(24, 40) === get("p2")[0].answer, "p2 p");
// p3
{ const r = Q.order(7, 15), b = Q.modpow(7, r / 2, 15); ok(r === 4 && b === 4, "p3 r,b"); ok([Q.gcd(b - 1, 15), Q.gcd(b + 1, 15)].sort().join() === "3,5", "p3 factors"); }
// p4: build U_7 on orbit {1,7,4,13}, check eigenvalue of psi_1 and QPE output distribution with n=3
{ const orbit = [1, 7, 4, 13], r = 4;
  const psi = (s) => orbit.map((_, k) => C(Math.cos(-2 * Math.PI * s * k / r) / 2, Math.sin(-2 * Math.PI * s * k / r) / 2));
  const U = (v) => { const out = v.map(() => C(0, 0)); v.forEach((a, k) => { out[(k + 1) % r] = a; }); return out; };
  const v = psi(1), w = U(v); // w = lambda v
  const lam = { re: w[0].re * v[0].re + w[0].im * v[0].im, im: w[0].im * v[0].re - w[0].re * v[0].im }; const lamN = lam.re / (v[0].re ** 2 + v[0].im ** 2), lamI = lam.im / (v[0].re ** 2 + v[0].im ** 2);
  const th = ((Math.atan2(lamI, lamN) / (2 * Math.PI)) + 1) % 1; ok(Math.abs(th - get("p4")[0].answer) < 1e-9, "p4 eigenphase " + th);
  // QPE: amplitude of output x = (1/8) sum_t e^{2 pi i t (s/r - x/8)}, averaged over s with weight 1/r
  const out = []; for (let x = 0; x < 8; x++) { let P = 0; for (let s = 0; s < r; s++) { let re = 0, im = 0; for (let t = 0; t < 8; t++) { const a = 2 * Math.PI * t * (s / r - x / 8); re += Math.cos(a); im += Math.sin(a); } P += (re * re + im * im) / 64 / r; } out.push(P); }
  ok(JSON.stringify(out.map((p, x) => p > 1e-9 ? String(x) : null).filter(Boolean)) === JSON.stringify(get("p4")[1].answer), "p4 outputs"); ok(Math.abs(out[2] - 0.25) < 1e-9, "p4 prob"); }
// p5: large-N finite sum at delta = 1/2
{ const N = 1 << 14; let re = 0, im = 0; for (let x = 0; x < N; x++) { const a = Math.PI * x / N; re += Math.cos(a); im += Math.sin(a); } const v = (re * re + im * im) / (N * N); ok(Math.abs(v - get("p5")[0].answer) < 1e-3, "p5 " + v); ok(Math.abs(2 * v - 8 / Math.PI ** 2) < 1e-3, "p5 8/pi^2"); }
// p6
{ const Hp = []; for (let y = 0; y < 8; y++) if (Q.dot2(y, 0b101) === 0) Hp.push(y.toString(2).padStart(3, "0")); ok(check(get("p6")[0], Hp.join(",")) && Hp.length === get("p6")[1].answer, "p6 " + Hp); }
// p7
{ const H = [], Hp = []; for (let k = 0; k < 12; k++) if ((4 * k) % 12 === k % 12 * 0 + (4 * k) % 12) H.push((4 * k) % 12); const Hs = [...new Set(H)].sort((a, b) => a - b);
  for (let y = 0; y < 12; y++) if (Hs.every(h => (h * y) % 12 === 0)) Hp.push(y); ok(check(get("p7")[0], Hs.join(",")) && check(get("p7")[1], Hp.join(",")), "p7 " + Hs + " | " + Hp); }
// p8: brute force H, H-perp, and the actual Fourier-sampling distribution
{ const H = [[0, 0]]; let g = [2, 3]; while (g[0] || g[1]) { H.push(g); g = [(g[0] + 2) % 4, (g[1] + 3) % 6]; }
  const Hp = []; for (let a = 0; a < 4; a++) for (let b = 0; b < 6; b++) if (H.every(([h1, h2]) => Math.abs(((h1 * a / 4 + h2 * b / 6) % 1)) < 1e-12)) Hp.push([a, b]);
  ok(H.length === get("p8")[0].answer && Hp.length === get("p8")[1].answer, `p8 |H|=${H.length} |Hp|=${Hp.length}`);
  ok(Hp.some(([a, b]) => a === 1 && b === 3) === (get("p8")[2].answer === "yes"), "p8 (1,3)");
  const g0 = [1, 2]; let P13 = 0; { let re = 0, im = 0; for (const [h1, h2] of H) { const x1 = (g0[0] + h1) % 4, x2 = (g0[1] + h2) % 6, t = 2 * Math.PI * (x1 * 1 / 4 + x2 * 3 / 6); re += Math.cos(t); im += Math.sin(t); } P13 = (re * re + im * im) / (H.length * 24); }
  ok(Math.abs(P13 - get("p8")[3].answer) < 1e-9, "p8 prob " + P13); }
// p9
{ let s = 0; while (Q.modpow(3, s, 7) !== 6) s++; ok(s === get("p9")[0].answer, "p9 s");
  // brute-force H for f(a,b)=g^a h^-b, then H-perp, then check (5,3) in H-perp and the c
  const hinv = Q.modpow(6, 5, 7), f = (a, b) => (Q.modpow(3, a, 7) * Q.modpow(hinv, b, 7)) % 7, H = [];
  for (let a = 0; a < 6; a++) for (let b = 0; b < 6; b++) if (f(a, b) === f(0, 0)) H.push([a, b]);
  ok(H.length === 6 && H.every(([a, b]) => (a - s * b) % 6 === 0), "p9 H = <(s,1)>");
  const inPerp = (y1, y2) => H.every(([a, b]) => (a * y1 + b * y2) % 6 === 0);
  ok(inPerp(5, 3), "p9 (5,3) in Hperp"); let allMatch = true; for (let y1 = 0; y1 < 6; y1++) for (let y2 = 0; y2 < 6; y2++) if (inPerp(y1, y2) !== ((3 * y1 + y2) % 6 === 0)) allMatch = false; ok(allMatch, "p9 c=3 condition");
  const inv5 = [1, 2, 3, 4, 5].find(u => (5 * u) % 6 === 1); ok((((-3 * inv5) % 6) + 6) % 6 === get("p9")[2].answer, "p9 recover"); }
// p10
ok(Q.gf2NullVector([0b011, 0b110], 3).toString(2) === get("p10")[0].answer, "p10");
// p11 / p12
{ const th = Math.asin(0.5); ok(Math.abs(th * 180 / Math.PI - 30) < 1e-9, "p11a"); ok(Math.abs(Math.sin(3 * th) ** 2 - 1) < 1e-9 && Math.abs(Math.sin(5 * th) ** 2 - 0.25) < 1e-9, "p11 bc");
  const t = Math.asin(1 / 32); let best = 0, bk = 0; for (let k = 0; k < 60; k++) { const v = Math.sin((2 * k + 1) * t) ** 2; if (v > best) { best = v; bk = k; } }
  ok(bk === get("p12")[0].answer && Math.abs(best - get("p12")[1].answer) < 1e-3, `p12 k=${bk} p=${best}`); }
// checker parsing
ok(check({ kind: "num", answer: 1 / 12, tol: 1e-3 }, "1/12") && check({ kind: "set", answer: ["3", "5"] }, "{5, 3}") && !check({ kind: "set", answer: ["3", "5"] }, "3,5,5"), "checker parsing");
console.log(fails ? `${fails} FAILURES` : "all problem keys verified");
process.exit(fails ? 1 : 0);

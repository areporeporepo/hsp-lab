// Pure math core for the HSP / Shor lab. No DOM. Runs in browser (window.Q) and Node (module.exports).
(function (root) {
  "use strict";

  // ---------- number theory ----------
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a; }
  function mulmod(a, b, m) { return Number((BigInt(a) * BigInt(b)) % BigInt(m)); }
  function modpow(b, e, m) {
    let r = 1n, B = BigInt(b) % BigInt(m), E = BigInt(e), M = BigInt(m);
    while (E > 0n) { if (E & 1n) r = (r * B) % M; B = (B * B) % M; E >>= 1n; }
    return Number(r);
  }
  // multiplicative order of a mod N (assumes gcd(a,N)=1)
  function order(a, N) {
    if (gcd(a, N) !== 1) return null;
    let x = a % N, r = 1;
    while (x !== 1) { x = mulmod(x, a, N); r++; if (r > N) return null; }
    return r;
  }
  function isPrime(n) { if (n < 2) return false; for (let p = 2; p * p <= n; p++) if (n % p === 0) return false; return true; }
  function isPrimePower(n) {
    for (let b = 2; b <= Math.log2(n) + 1; b++) {
      const k = Math.round(Math.pow(n, 1 / b));
      for (const c of [k - 1, k, k + 1]) if (c > 1 && Math.pow(c, b) === n) return c;
    }
    return 0;
  }

  // ---------- continued fractions ----------
  // expansion of p/q -> partial quotients, convergents h/k
  function convergents(p, q) {
    const a = [], conv = [];
    let h1 = 1, h2 = 0, k1 = 0, k2 = 1;
    while (q !== 0) {
      const ai = Math.floor(p / q);
      a.push(ai);
      [p, q] = [q, p - ai * q];
      const h = ai * h1 + h2, k = ai * k1 + k2;
      conv.push({ a: ai, h, k });
      h2 = h1; h1 = h; k2 = k1; k1 = k;
    }
    return conv;
  }
  // Shor post-processing: from measured y in [0,Q), find r as the convergent denominator
  // k < N with a^k = 1 mod N (try small multiples to recover r when gcd(c,r)>1 cancelled it).
  function recoverPeriod(y, Q, a, N) {
    if (y === 0) return { r: null, steps: [], reason: "y = 0 carries no information" };
    const steps = convergents(y, Q);
    // Only small multiples m <= B: a bound polynomial in log N keeps post-processing polynomial,
    // and it means off-peak samples honestly fail instead of being rescued by brute force.
    const B = Math.max(2, Math.ceil(Math.log2(N)));
    for (const c of steps) {
      if (c.h === 0) continue;          // skip the trivial convergent 0/1 (k = 1 would brute-force r)
      if (c.k >= N) break;
      for (let m = 1; m <= B && m * c.k < N; m++) {
        const cand = m * c.k;
        if (modpow(a, cand, N) === 1) return { r: minimalOrder(a, cand, N, B), steps, from: c, mult: m };
      }
    }
    return { r: null, steps, reason: `no convergent denominator k < N, times m <= ${B}, satisfies a^k = 1 mod N` };
  }

  // a^m = 1 mod N means ord(a) | m; strip prime factors of m while that still holds
  // cand = m k with m <= B, so cand / r divides m and only primes p <= B can need stripping
  function minimalOrder(a, m, N, B) {
    const lim = B ?? m;
    for (let p = 2; p <= lim; p++) {
      if (m % p) continue;
      while (m % p === 0 && modpow(a, m / p, N) === 1) m /= p;
    }
    return m;
  }

  // ---------- Shor output distribution (exact, closed form) ----------
  // Register 1 has n qubits, Q = 2^n. After f(x)=a^x mod N, the first register is a mixture of
  // normalized coset states {x0 + k r}, weighted by coset size M_{x0}/Q. Output probability:
  //   P(y) = (1/Q^2) * sum_{x0=0}^{r-1} | sum_{k=0}^{M_{x0}-1} w^{y r k} |^2,  w = e^{2 pi i / Q}
  // and |geometric sum|^2 = sin^2(pi y r M / Q) / sin^2(pi y r / Q)  (= M^2 when y r / Q is an integer).
  function geo2(M, theta) { // |sum_{k<M} e^{i k theta}|^2
    const s = Math.sin(theta / 2);
    if (Math.abs(s) < 1e-12) return M * M;
    const t = Math.sin(M * theta / 2);
    return (t * t) / (s * s);
  }
  function shorDistribution(r, Q) {
    const P = new Float64Array(Q);
    const Mhi = Math.ceil(Q / r), Mlo = Math.floor(Q / r);
    const nHi = Q - Mlo * r; // number of cosets with Mhi elements (0 if r | Q)
    const nLo = r - nHi;
    for (let y = 0; y < Q; y++) {
      const th = 2 * Math.PI * ((y * r) % Q) / Q;
      let v = nLo * geo2(Mlo, th);
      if (nHi) v += nHi * geo2(Mhi, th);
      P[y] = v / (Q * Q);
    }
    return P;
  }
  function sample(P, rnd) {
    let u = (rnd || Math.random)(), c = 0;
    for (let i = 0; i < P.length; i++) { c += P[i]; if (u < c) return i; }
    return P.length - 1;
  }
  // classical endgame
  function splitFromPeriod(a, r, N) {
    if (r % 2 === 1) return { ok: false, reason: "r is odd" };
    const h = modpow(a, r / 2, N);
    if (h === N - 1) return { ok: false, reason: "a^(r/2) = -1 mod N" };
    const p = gcd(h - 1, N), q = gcd(h + 1, N);
    if (p > 1 && p < N) return { ok: true, h, p, q: N / p };
    if (q > 1 && q < N) return { ok: true, h, p: q, q: N / q };
    return { ok: false, reason: "trivial gcd" };
  }
  function registerSize(N) { // standard choice: N^2 <= Q < 2 N^2
    return Math.ceil(Math.log2(N * N));
  }

  // ---------- gate-level state-vector simulator ----------
  // Qubit q is bit q of the basis index (q = 0 is least significant).
  function State(n) { this.n = n; this.re = new Float64Array(1 << n); this.im = new Float64Array(1 << n); }
  State.basis = function (n, x) { const s = new State(n); s.re[x] = 1; return s; };
  function applyH(s, q) {
    const m = 1 << q, h = Math.SQRT1_2, N = s.re.length;
    for (let i = 0; i < N; i++) if (!(i & m)) {
      const j = i | m, ar = s.re[i], ai = s.im[i], br = s.re[j], bi = s.im[j];
      s.re[i] = h * (ar + br); s.im[i] = h * (ai + bi);
      s.re[j] = h * (ar - br); s.im[j] = h * (ai - bi);
    }
  }
  function applyCP(s, c, t, phi) { // diag phase e^{i phi} on |11>
    const mc = 1 << c, mt = 1 << t, cs = Math.cos(phi), sn = Math.sin(phi);
    for (let i = 0; i < s.re.length; i++) if ((i & mc) && (i & mt)) {
      const r = s.re[i], im = s.im[i];
      s.re[i] = r * cs - im * sn; s.im[i] = r * sn + im * cs;
    }
  }
  function applySwap(s, a, b) {
    const ma = 1 << a, mb = 1 << b;
    for (let i = 0; i < s.re.length; i++) if ((i & ma) && !(i & mb)) {
      const j = (i & ~ma) | mb;
      [s.re[i], s.re[j]] = [s.re[j], s.re[i]]; [s.im[i], s.im[j]] = [s.im[j], s.im[i]];
    }
  }
  // Textbook QFT circuit: QFT|x> = Q^{-1/2} sum_y e^{2 pi i x y / Q} |y>
  function qftCircuit(n) {
    const g = [];
    for (let i = n - 1; i >= 0; i--) {
      g.push({ op: "H", q: i });
      for (let j = i - 1; j >= 0; j--) g.push({ op: "CP", c: j, t: i, k: i - j + 1, phi: Math.PI / (1 << (i - j)) });
    }
    for (let i = 0; i < Math.floor(n / 2); i++) g.push({ op: "SWAP", a: i, b: n - 1 - i });
    return g;
  }
  function run(s, gates) {
    for (const g of gates) {
      if (g.op === "H") applyH(s, g.q);
      else if (g.op === "CP") applyCP(s, g.c, g.t, g.phi);
      else if (g.op === "SWAP") applySwap(s, g.a, g.b);
    }
    return s;
  }
  // max |circuit - DFT| over all columns, for verification
  function qftCircuitError(n) {
    const Q = 1 << n, g = qftCircuit(n); let err = 0;
    for (let x = 0; x < Q; x++) {
      const s = run(State.basis(n, x), g);
      for (let y = 0; y < Q; y++) {
        const ang = 2 * Math.PI * x * y / Q, k = 1 / Math.sqrt(Q);
        err = Math.max(err, Math.hypot(s.re[y] - k * Math.cos(ang), s.im[y] - k * Math.sin(ang)));
      }
    }
    return err;
  }

  // ---------- Simon's problem (HSP over Z_2^n, H = {0, s}) ----------
  function popcount(x) { let c = 0; while (x) { c += x & 1; x >>>= 1; } return c; }
  function dot2(a, b) { return popcount(a & b) & 1; }
  function simonOracle(s) { return (x) => Math.min(x, x ^ s); } // 2-to-1, f(x)=f(x xor s)
  function simonSample(n, s, rnd) { // uniform y with y.s = 0
    const R = rnd || Math.random;
    for (;;) { const y = Math.floor(R() * (1 << n)); if (dot2(y, s) === 0) return y; }
  }
  // Gaussian elimination over GF(2). Returns {rank, rows}.
  function gf2Reduce(vecs, n) {
    const rows = [];
    for (let v of vecs) {
      for (const r of rows) if (v & (1 << r.pivot)) v ^= r.v;
      if (v) {
        const pivot = 31 - Math.clz32(v);
        for (const r of rows) if (r.v & (1 << pivot)) r.v ^= v;
        rows.push({ v, pivot });
      }
    }
    return { rank: rows.length, rows };
  }
  // nonzero s with y.s = 0 for every row (unique when rank = n-1)
  function gf2NullVector(vecs, n) {
    const { rank, rows } = gf2Reduce(vecs, n);
    if (rank !== n - 1) return null;
    const piv = new Set(rows.map(r => r.pivot));
    let free = -1; for (let i = 0; i < n; i++) if (!piv.has(i)) free = i;
    let s = 1 << free;
    for (const r of rows) if (r.v & (1 << free)) s |= 1 << r.pivot;
    return s;
  }

  // ---------- error-correction arithmetic (illustrative, not a paper reproduction) ----------
  // Surface-code heuristic: p_L(d) ~ A (p/p_th)^((d+1)/2), A = 0.1, p_th = 1e-2.
  function surfaceLogicalError(p, d, A, pth) { return (A ?? 0.1) * Math.pow(p / (pth ?? 1e-2), (d + 1) / 2); }
  function surfaceDistanceFor(p, budget, A, pth) {
    if (p >= (pth ?? 1e-2)) return null;
    for (let d = 3; d < 201; d += 2) if (surfaceLogicalError(p, d, A, pth) <= budget) return d;
    return null;
  }

  const api = { minimalOrder, gcd, modpow, mulmod, order, isPrime, isPrimePower, convergents, recoverPeriod, shorDistribution,
    sample, splitFromPeriod, registerSize, State, applyH, applyCP, applySwap, qftCircuit, run, qftCircuitError,
    popcount, dot2, simonOracle, simonSample, gf2Reduce, gf2NullVector, surfaceLogicalError, surfaceDistanceFor, geo2 };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.Q = api;
})(typeof window !== "undefined" ? window : globalThis);

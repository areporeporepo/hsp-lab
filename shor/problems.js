// Practice problems in CS259Q notation (L10 to L14). Each answer field has a checker.
// kinds: "num" (tolerance), "set" (unordered list of integers or bitstrings), "text" (exact, case-insensitive)
(function (root) {
  "use strict";
  const P = [
    { id: "p1", lec: "L10", title: "Toy period finding: which outcomes survive?",
      body: String.raw`Let \(n = 4\), so \(N = 2^n = 16\) and \(\omega = e^{2\pi i/16}\). A function \(f\) on \(\{0,\dots,15\}\) has period \(p = 4\) in the course's sense: \(f(x) = f(x')\) exactly when \(x \equiv x' \pmod 4\). Start from the uniform superposition. After the oracle, measuring the second register, and applying \(\mathrm{QFT}_n\), which outcomes \(y\) have nonzero probability, and what is each probability?`,
      fields: [{ label: "outcomes y (comma list)", kind: "set", answer: ["0", "4", "8", "12"] }, { label: "probability of each", kind: "num", answer: 0.25, tol: 1e-3 }],
      hint: String.raw`The amplitude of \(|y\rangle\) contains the geometric sum \(\sum_{k=0}^{N/p-1} \omega^{ykp}\). When is \(\omega^{yp} = 1\)?`,
      solution: String.raw`\(\sum_{k=0}^{N/p-1} \omega^{ykp}\) equals \(N/p\) if \(\omega^{yp}=1\) and \(0\) otherwise. \(\omega^{yp}=1 \iff yp/N \in \mathbb{Z} \iff y = cN/p\). With \(N/p = 4\): \(y \in \{0,4,8,12\}\), each with probability \(1/p = 1/4\).` },

    { id: "p2", lec: "L10", title: "Post-processing with gcd",
      body: String.raw`With \(N = 64\) you run toy period finding twice and observe \(y_1 = 24\) and \(y_2 = 40\). Assume the hidden multipliers \(c_1, c_2\) are coprime. What is the period \(p\)? What were \(c_1\) and \(c_2\)?`,
      fields: [{ label: "p", kind: "num", answer: 8, tol: 0 }, { label: "c1", kind: "num", answer: 3, tol: 0 }, { label: "c2", kind: "num", answer: 5, tol: 0 }],
      hint: String.raw`\(y_i = c_i N/p\), so \(\gcd(y_1, y_2) = \tfrac{N}{p}\gcd(c_1,c_2)\).`,
      solution: String.raw`\(\gcd(24, 40) = 8 = N/p\), so \(p = 64/8 = 8\). Then \(c_1 = 24/8 = 3\), \(c_2 = 40/8 = 5\), and \(\gcd(3,5)=1\) confirms the assumption.` },

    { id: "p3", lec: "L11", title: "Factor 15 from the order of 7",
      body: String.raw`Take \(N = 15\), \(a = 7\). Find the order \(r\) of \(a\) mod \(N\), then \(b = a^{r/2} \bmod N\), then the two factors from \(\gcd(b \pm 1, N)\).`,
      fields: [{ label: "r", kind: "num", answer: 4, tol: 0 }, { label: "b", kind: "num", answer: 4, tol: 0 }, { label: "factors (comma list)", kind: "set", answer: ["3", "5"] }],
      hint: String.raw`Powers of 7 mod 15: \(7, 49, 343, \dots\). Reduce as you go.`,
      solution: String.raw`\(7^1 = 7,\ 7^2 = 49 \equiv 4,\ 7^3 \equiv 28 \equiv 13,\ 7^4 \equiv 91 \equiv 1\). So \(r = 4\), \(b = 7^2 \bmod 15 = 4 \not\equiv -1\). \(\gcd(3, 15) = 3\), \(\gcd(5, 15) = 5\).` },

    { id: "p4", lec: "L12", title: "Shor as phase estimation on \\(U_7\\)",
      body: String.raw`\(U_a|y\rangle = |ay \bmod N\rangle\) with \(a = 7\), \(N = 15\), order \(r = 4\). Its eigenvectors on the orbit of \(|1\rangle\) are \(|\psi_s\rangle = \tfrac{1}{\sqrt r}\sum_{k=0}^{r-1} e^{-2\pi i sk/r}|a^k \bmod N\rangle\). (a) What is the eigenvalue of \(|\psi_s\rangle\) for \(s = 1\)? Give \(\theta/2\pi\). (b) You run phase estimation with \(n = 3\) bits on input \(|1\rangle\). Which outputs \(x\) can appear, and with what probability each?`,
      fields: [{ label: "(a) θ/2π for s = 1", kind: "num", answer: 0.25, tol: 1e-3 }, { label: "(b) outputs x (comma list)", kind: "set", answer: ["0", "2", "4", "6"] }, { label: "(b) probability each", kind: "num", answer: 0.25, tol: 1e-3 }],
      hint: String.raw`Apply \(U_a\) to \(|\psi_s\rangle\) and reindex \(k \to k-1\). For (b), write \(|1\rangle = \tfrac{1}{\sqrt r}\sum_s |\psi_s\rangle\).`,
      solution: String.raw`\(U_a|\psi_s\rangle = \tfrac{1}{\sqrt r}\sum_k e^{-2\pi i sk/r}|a^{k+1}\rangle = e^{2\pi i s/r}|\psi_s\rangle\), so \(\theta/2\pi = s/r = 1/4\). Since \(|1\rangle = \tfrac{1}{\sqrt r}\sum_{s=0}^{r-1}|\psi_s\rangle\), phase estimation returns \(s/r\) with probability \(1/r\) each. With \(2^3 = 8\): \(x = 8s/4 \in \{0,2,4,6\}\), exact because \(r \mid 8\), each with probability \(1/4\).` },

    { id: "p5", lec: "L12", title: "The worst case behind \\(8/\\pi^2\\)",
      body: String.raw`In phase estimation, suppose \(\gamma = N\theta/2\pi\) sits exactly halfway between integers \(y_0\) and \(y_1\). For large \(N\), what is \(\lim_{N\to\infty}|\alpha_{y_0}|^2\)? (Then check that the two consecutive integers together carry \(8/\pi^2\) in the limit.)`,
      fields: [{ label: "|α_{y0}|² (decimal)", kind: "num", answer: 4 / (Math.PI * Math.PI), tol: 2e-3 }],
      hint: String.raw`\(\alpha_{y_0} \approx \int_0^1 e^{\pi i t}\,dt\).`,
      solution: String.raw`\(\int_0^1 e^{\pi i t}dt = \tfrac{e^{\pi i}-1}{\pi i} = \tfrac{-2}{\pi i}\), so \(|\alpha_{y_0}|^2 = 4/\pi^2 \approx 0.405\). By symmetry \(|\alpha_{y_1}|^2\) is the same, total \(8/\pi^2 \approx 0.811\). For finite \(N\) the exact value is \(|\alpha_{y_j}|^2 = \frac{1}{N^2\sin^2(\pi/2N)}\), which tends to \(4/\pi^2\) from above.` },

    { id: "p6", lec: "L13", title: "Simon as an HSP: list \\(H^\\perp\\)",
      body: String.raw`\(G = \mathbb{Z}_2^3\), \(H = \{000, 101\}\). The characters are \(\chi_y(x) = (-1)^{x\cdot y}\). List \(H^\perp = \{y : \chi_y(h) = 1\ \forall h \in H\}\). How big is it?`,
      fields: [{ label: "H⊥ (bitstrings, comma list)", kind: "set", answer: ["000", "010", "101", "111"] }, { label: "|H⊥|", kind: "num", answer: 4, tol: 0 }],
      hint: String.raw`You need \(y \cdot 101 \equiv 0 \pmod 2\), i.e. \(y_1 \oplus y_3 = 0\).`,
      solution: String.raw`\(y_1 = y_3\), \(y_2\) free: \(\{000, 010, 101, 111\}\). \(|H^\perp| = |G|/|H| = 8/2 = 4\).` },

    { id: "p7", lec: "L13", title: "Period finding as an HSP over \\(\\mathbb{Z}_{12}\\)",
      body: String.raw`\(G = \mathbb{Z}_{12}\), \(H = \langle 4 \rangle\). Characters \(\chi_y(x) = \omega^{xy}\), \(\omega = e^{2\pi i/12}\). List \(H\) and \(H^\perp\).`,
      fields: [{ label: "H (comma list)", kind: "set", answer: ["0", "4", "8"] }, { label: "H⊥ (comma list)", kind: "set", answer: ["0", "3", "6", "9"] }],
      hint: String.raw`\(\chi_y\) is trivial on \(H\) iff \(\chi_y(4) = \omega^{4y} = 1\).`,
      solution: String.raw`\(H = \{0, 4, 8\}\). \(\omega^{4y} = 1 \iff 12 \mid 4y \iff 3 \mid y\), so \(H^\perp = \{0,3,6,9\}\): the multiples of \(N/p = 12/4 = 3\), the same answer as toy period finding with period 4.` },

    { id: "p8", lec: "L13", title: "A product group: \\(\\mathbb{Z}_4 \\times \\mathbb{Z}_6\\)",
      body: String.raw`\(G = \mathbb{Z}_4 \times \mathbb{Z}_6\), \(H = \langle (2,3) \rangle\). Characters are \(\chi_{(y_1,y_2)}(x_1,x_2) = e^{2\pi i (x_1y_1/4 + x_2y_2/6)}\). (a) \(|H|\)? (b) \(|H^\perp|\)? (c) Is \((1,3) \in H^\perp\)? (d) Start from the uniform superposition over \(G\), query an \(f\) with \(f(x) = f(x') \iff x - x' \in H\), measure the output register, and apply \(\mathcal{F}_G = \mathcal{F}_{\mathbb{Z}_4} \otimes \mathcal{F}_{\mathbb{Z}_6}\) (Fourier transforms on 4 and 6 states, not on 4 and 6 qubits). What is the probability of each \(y \in H^\perp\)?`,
      fields: [{ label: "(a) |H|", kind: "num", answer: 2, tol: 0 }, { label: "(b) |H⊥|", kind: "num", answer: 12, tol: 0 }, { label: "(c) yes / no", kind: "text", answer: "yes" }, { label: "(d) probability", kind: "num", answer: 1 / 12, tol: 1e-3 }],
      hint: String.raw`\(2\cdot(2,3) = (4,6) = (0,0)\). Then \(\chi_y((2,3)) = e^{2\pi i(2y_1/4 + 3y_2/6)} = e^{\pi i (y_1 + y_2)}\).`,
      solution: String.raw`(a) \(H = \{(0,0),(2,3)\}\), so \(|H| = 2\). (b) \(\chi_y\) trivial on \(H \iff y_1 + y_2\) even, half of the 24 pairs: \(|H^\perp| = 12 = |G|/|H|\). (c) \(1 + 3 = 4\) is even, yes. (d) Uniform over \(H^\perp\): \(|H|/|G| = 1/12\).` },

    { id: "p9", lec: "L13", title: "Discrete log as an HSP",
      body: String.raw`In \(\mathbb{Z}_7^*\) take \(g = 3\) (order 6) and \(h = 6 = g^s\). Define \(f : \mathbb{Z}_6 \times \mathbb{Z}_6 \to \mathbb{Z}_7^*\), \(f(a,b) = g^a h^{-b}\). (a) Find \(s\) by hand. (b) The hidden subgroup is \(H = \langle (s, 1)\rangle\). Which condition defines \(H^\perp\)? Enter the value of \(c\) in \(c\,y_1 + y_2 \equiv 0 \pmod 6\). (c) You sample \(y = (5, 3)\). Recover \(s\) from it.`,
      fields: [{ label: "(a) s", kind: "num", answer: 3, tol: 0 }, { label: "(b) c", kind: "num", answer: 3, tol: 0 }, { label: "(c) s from sample", kind: "num", answer: 3, tol: 0 }],
      hint: String.raw`\(f(a,b) = g^{a - sb}\) is constant exactly when \(a - sb\) is. For (c), solve \(s\,y_1 + y_2 \equiv 0\) for \(s\) using \(y_1^{-1} \bmod 6\).`,
      solution: String.raw`(a) \(3^1=3, 3^2=2, 3^3=6\), so \(s = 3\). (b) \(\chi_y((s,1)) = e^{2\pi i (s y_1 + y_2)/6} = 1 \iff s y_1 + y_2 \equiv 0\), so \(c = s = 3\). (c) \(s \equiv -y_2\,y_1^{-1} \pmod 6\). \(5^{-1} \equiv 5\), so \(s \equiv -3\cdot 5 = -15 \equiv 3\). This works whenever \(y_1\) is invertible mod 6.` },

    { id: "p10", lec: "L13", title: "Simon's post-processing",
      body: String.raw`For Simon's problem on \(n = 3\) bits you observe \(y = 011\) and \(y = 110\). These are linearly independent, and \(n - 1 = 2\) of them suffice. Find the nonzero \(s\).`,
      fields: [{ label: "s (bitstring)", kind: "text", answer: "111" }],
      hint: String.raw`Solve \(s_2 \oplus s_3 = 0\) and \(s_1 \oplus s_2 = 0\) over \(\mathrm{GF}(2)\).`,
      solution: String.raw`Both equations force \(s_1 = s_2 = s_3\). The nonzero solution is \(s = 111\). Check: \(011\cdot111 = 0\oplus1\oplus1 = 0\), \(110\cdot111 = 1\oplus1\oplus0 = 0\).` },

    { id: "p11", lec: "L14", title: "Grover with \\(N = 4\\), \\(M = 1\\)",
      body: String.raw`With \(\theta = \arcsin\sqrt{M/N} \in [0, \pi/2]\), after \(k\) Grover iterations the success probability is \(\sin^2((2k+1)\theta)\). For \(N = 4\), \(M = 1\): (a) \(\theta\) in degrees? (b) success probability after \(k = 1\)? (c) after \(k = 2\)?`,
      fields: [{ label: "(a) θ (degrees)", kind: "num", answer: 30, tol: 0.05 }, { label: "(b) k = 1", kind: "num", answer: 1, tol: 1e-3 }, { label: "(c) k = 2", kind: "num", answer: 0.25, tol: 1e-3 }],
      hint: String.raw`\(\sin\theta = 1/2\).`,
      solution: String.raw`(a) \(\theta = 30^\circ\). (b) \(\sin^2(90^\circ) = 1\). (c) \(\sin^2(150^\circ) = 1/4\): overshooting rotates past the target.` },

    { id: "p12", lec: "L14", title: "How many iterations for \\(N = 1024\\)?",
      body: String.raw`\(N = 2^{10}\), \(M = 1\). What is the first \(k\) at which \(\sin^2((2k+1)\theta)\) peaks, i.e. the integer nearest \(\tfrac{\pi}{4\theta} - \tfrac12\)? What is the success probability there (3 decimals)? (Later peaks such as \(k = 75\) come slightly closer to 1, but cost three times as many queries.)`,
      fields: [{ label: "k", kind: "num", answer: 25, tol: 0 }, { label: "success probability", kind: "num", answer: 0.99946, tol: 1.5e-3 }],
      hint: String.raw`\(\theta = \arcsin(1/32) \approx 0.03125\). You want \((2k+1)\theta \approx \pi/2\).`,
      solution: String.raw`\(k \approx \tfrac{\pi}{4\theta} - \tfrac12 \approx 25.1 - 0.5\), so \(k = 25\) and \((2k+1)\theta = 51\theta \approx 1.594\) rad. \(\sin^2(1.594) \approx 0.9995\). That is about \(\tfrac{\pi}{4}\sqrt N\) iterations, against about \(N/2\) classical queries.` },
  ];

  function norm(s) { return String(s).trim().toLowerCase(); }
  function parseNum(s) {
    s = norm(s).replace(/\s+/g, "");
    if (/^-?\d+(\.\d+)?\/\d+(\.\d+)?$/.test(s)) { const [a, b] = s.split("/").map(Number); return a / b; }
    if (s === "") return NaN; return Number(s);
  }
  function check(field, value) {
    if (field.kind === "num") { const v = parseNum(value); return Number.isFinite(v) && Math.abs(v - field.answer) <= (field.tol || 0) + 1e-12; }
    if (field.kind === "text") return norm(value) === norm(field.answer);
    if (field.kind === "set") {
      const got = norm(value).replace(/[{}()\[\]]/g, "").split(/[\s,;]+/).filter(Boolean);
      const want = field.answer.map(norm);
      return got.length === want.length && new Set(got).size === got.length && want.every(w => got.includes(w));
    }
    return false;
  }
  const api = { problems: P, check, parseNum };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.Problems = api;
})(typeof window !== "undefined" ? window : globalThis);

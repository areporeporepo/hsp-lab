# hsp-lab

Interactive, browser-only explorations of the **Hidden Subgroup Problem** and the algorithms it unifies (Simon, period finding, order finding, discrete log, phase estimation). One static HTML file, no build, no backend.

Open `index.html` in a browser.

## What it does
- **Map**: concept graph of the course so far; edge style encodes the relation (special case / uses / same circuit / leads to). Includes a list of connections that look right but are wrong.
- **Lab**: coset state to H⊥ simulator over ℤ₂³, ℤ₈, ℤ₁₂, ℤ₆×ℤ₆ (phasor glyphs, character-sum polygons, sample-and-recover); phase-estimation microscope (8/π² bound, mean vs median); Shor as phase estimation of U_a with continued fractions.
- **Board**: whiteboard drills with hint ladders, self-checks, and a problem generator that diagnoses specific mistakes.
- **Speak**: 60-second explain-aloud prompts with claim checklists.

## Related work (checked 2026-11-02)
| Project | Last push | Notes |
|---|---|---|
| [millerzhang2/Hidden-Subgroup-Problem](https://github.com/millerzhang2/Hidden-Subgroup-Problem) | 2026-09 | Qiskit notebooks incl. Kuperberg, Hallgren |
| [Strilanc/Quirk](https://github.com/Strilanc/Quirk) | 2024-07 | Circuit-level simulator |
| [hwenchi/qft-viz](https://github.com/hwenchi/qft-viz) | 2026-09 | QFT on periodic states |
| [XanaduAI/Fourier-sampling](https://github.com/XanaduAI/Fourier-sampling) | 2023-05 | Notes |

## Status
Built while preparing for Stanford CS259Q Lecture 13 (Autumn 2026). Math cross-checked with two independent models plus numeric tests; report errors as issues.

/* ============================================================
   STELLAR SPECTROSCOPE — Astronomical Data Module
   All wavelengths in nanometres (nm). Values are drawn from
   real, published spectral-line and stellar-parameter data
   (NIST Atomic Spectra Database line lists; stellar Teff from
   standard spectral-type calibrations).
   ============================================================ */

/* ---------- Element line data ---------- */
/* Wavelengths are the strongest / most teaching-relevant lines
   for each element as seen in stellar absorption spectra.       */
const ELEMENTS = {
  H: {
    symbol: 'H', name: 'Hydrogen', color: '#7fb1f0',
    summary: 'The most abundant element in the universe. Its Balmer series dominates the spectra of hot, young stars.',
    lines: [
      { wl: 410.2, label: 'H\u03B4 (H-delta)' },
      { wl: 434.0, label: 'H\u03B3 (H-gamma)' },
      { wl: 486.1, label: 'H\u03B2 (H-beta)' },
      { wl: 656.3, label: 'H\u03B1 (H-alpha)' }
    ],
    significance: 'The Balmer series forms when an electron in hydrogen falls to the n=2 energy level. These lines peak in strength around 9,000\u201310,000 K (A-type stars) — hotter stars ionize too much hydrogen to absorb, cooler stars keep electrons in the ground state.'
  },
  He: {
    symbol: 'He', name: 'Helium', color: '#c9a6ff',
    summary: 'A light inert gas. Neutral helium lines only appear at very high surface temperatures.',
    lines: [
      { wl: 402.6, label: 'He I' },
      { wl: 447.1, label: 'He I' },
      { wl: 501.6, label: 'He I' },
      { wl: 587.6, label: 'He I (D3)' },
      { wl: 667.8, label: 'He I' }
    ],
    significance: 'Neutral helium (He I) requires temperatures above ~11,000 K to populate the excited energy levels needed to absorb visible light, so it is a signature of hot B-type stars.'
  },
  Ca: {
    symbol: 'Ca', name: 'Calcium', color: '#8fe3b0',
    summary: 'A metal whose ionized form produces two of the strongest lines in stellar spectra: the H & K lines.',
    lines: [
      { wl: 393.4, label: 'Ca II K' },
      { wl: 396.8, label: 'Ca II H' },
      { wl: 422.7, label: 'Ca I' }
    ],
    significance: 'The Ca II H & K lines are the strongest absorption features in G-type stars like the Sun. They peak in strength around 5,000\u20136,500 K, making them a key thermometer for Sun-like stars.'
  },
  Na: {
    symbol: 'Na', name: 'Sodium', color: '#ffe066',
    summary: 'A metal that produces the famous close "D-line" doublet in the yellow part of the spectrum.',
    lines: [
      { wl: 589.0, label: 'Na D2' },
      { wl: 589.6, label: 'Na D1' }
    ],
    significance: 'The sodium D-lines are a close doublet visible in cooler stars (G, K, M types) where enough neutral sodium atoms survive in the stellar atmosphere to absorb yellow light.'
  },
  Fe: {
    symbol: 'Fe', name: 'Iron', color: '#ff8a65',
    summary: 'The most common heavy element observed in stars, producing thousands of faint absorption lines.',
    lines: [
      { wl: 438.4, label: 'Fe I' },
      { wl: 466.0, label: 'Fe I' },
      { wl: 495.8, label: 'Fe I' },
      { wl: 526.9, label: 'Fe I' }
    ],
    significance: 'Iron produces an enormous number of absorption lines across the whole visible spectrum because of its complex atomic structure. Its lines are used to measure a star\u2019s overall "metallicity".'
  },
  Mg: {
    symbol: 'Mg', name: 'Magnesium', color: '#66d9c9',
    summary: 'Forms a tight group of three lines nicknamed the "magnesium triplet".',
    lines: [
      { wl: 516.7, label: 'Mg b3' },
      { wl: 517.3, label: 'Mg b2' },
      { wl: 518.4, label: 'Mg b1' }
    ],
    significance: 'The magnesium "b" triplet near 518 nm is a hallmark of cooler stellar atmospheres (F, G, K types) and is often used in galaxy spectroscopy to measure the age of stellar populations.'
  },
  Si: {
    symbol: 'Si', name: 'Silicon', color: '#b0bec5',
    summary: 'Its ionized form is a classic marker of hot, blue B-type stars.',
    lines: [
      { wl: 412.8, label: 'Si II' },
      { wl: 634.7, label: 'Si II' },
      { wl: 637.1, label: 'Si II' }
    ],
    significance: 'Ionized silicon (Si II) lines strengthen in hot B-type stars, where surface temperatures are high enough to strip an electron from silicon but not so extreme that the ion is stripped further.'
  },
  TiO: {
    symbol: 'TiO', name: 'Titanium Oxide', color: '#ff6f91',
    summary: 'A molecule — not an atom — that survives only in the coolest stars and produces broad absorption bands.',
    lines: [
      { wl: 495, label: 'TiO band', isBand: true, width: 22 },
      { wl: 545, label: 'TiO band', isBand: true, width: 16 },
      { wl: 616, label: 'TiO band', isBand: true, width: 14 },
      { wl: 705, label: 'TiO band', isBand: true, width: 26 }
    ],
    significance: 'Molecules like titanium oxide can only exist below about 3,700 K \u2014 in hotter stars they are torn apart by collisions and radiation. Broad TiO bands are the defining feature of the coolest M-type stars.'
  }
};

const ELEMENT_ORDER = ['H', 'He', 'Ca', 'Na', 'Fe', 'Mg', 'Si', 'TiO'];

/* ---------- Star catalogue ---------- */
/* tempK = effective surface temperature (Kelvin, real published values).
   lineStrengths = relative absorption depth (0-1) for each element,
   modelled on how real stellar spectral classification behaves.       */
const STARS = [
  {
    id: 'bellatrix', name: 'Bellatrix', type: 'B2 III', tempK: 22000,
    fact: 'A blue giant in Orion\u2019s shoulder, over 6 times hotter than the Sun.',
    lineStrengths: { H: 0.55, He: 0.9, Si: 0.4 }
  },
  {
    id: 'rigel', name: 'Rigel', type: 'B8 Ia', tempK: 12100,
    fact: 'A blue supergiant in Orion, tens of thousands of times more luminous than the Sun.',
    lineStrengths: { H: 0.75, He: 0.6, Mg: 0.1 }
  },
  {
    id: 'vega', name: 'Vega', type: 'A0 V', tempK: 9600,
    fact: 'Was the northern pole star roughly 12,000 years ago and will be again in about 13,700 years.',
    lineStrengths: { H: 1.0, Mg: 0.15, Fe: 0.1 }
  },
  {
    id: 'sirius', name: 'Sirius A', type: 'A1 V', tempK: 9940,
    fact: 'The brightest star in Earth\u2019s night sky, twice the Sun\u2019s mass.',
    lineStrengths: { H: 0.95, Ca: 0.15, Mg: 0.12 }
  },
  {
    id: 'procyon', name: 'Procyon', type: 'F5 IV\u2013V', tempK: 6530,
    fact: 'A sub-giant just beginning to exhaust hydrogen fuel in its core.',
    lineStrengths: { H: 0.6, Ca: 0.35, Fe: 0.3, Mg: 0.2 }
  },
  {
    id: 'sun', name: 'The Sun', type: 'G2 V', tempK: 5778,
    fact: 'Our own star \u2014 the reference point every other spectral type is compared against.',
    lineStrengths: { H: 0.35, Ca: 0.85, Na: 0.4, Fe: 0.6, Mg: 0.45 }
  },
  {
    id: 'arcturus', name: 'Arcturus', type: 'K1.5 III', tempK: 4286,
    fact: 'The brightest star in the northern celestial hemisphere, a red giant near the end of its life.',
    lineStrengths: { Ca: 0.7, Na: 0.55, Fe: 0.7, Mg: 0.5, TiO: 0.1 }
  },
  {
    id: 'betelgeuse', name: 'Betelgeuse', type: 'M1\u20132 Ia\u2013ab', tempK: 3600,
    fact: 'A red supergiant in Orion so large that, in our Solar System, it would engulf the orbit of Jupiter.',
    lineStrengths: { TiO: 0.85, Ca: 0.4, Na: 0.5, Fe: 0.35 }
  }
];

/* ---------- Spectral-region helper ---------- */
function spectralRegion(wl) {
  if (wl < 450) return { name: 'Violet', color: '#8b5cf6' };
  if (wl < 495) return { name: 'Blue', color: '#3b82f6' };
  if (wl < 570) return { name: 'Green', color: '#22c55e' };
  if (wl < 590) return { name: 'Yellow', color: '#eab308' };
  if (wl < 620) return { name: 'Orange', color: '#f97316' };
  return { name: 'Red', color: '#ef4444' };
}

/* ---------- Temperature classification ---------- */
function spectralClass(tempK) {
  if (tempK >= 30000) return 'O';
  if (tempK >= 10000) return 'B';
  if (tempK >= 7500) return 'A';
  if (tempK >= 6000) return 'F';
  if (tempK >= 5200) return 'G';
  if (tempK >= 3700) return 'K';
  return 'M';
}

/* ---------- Wavelength (nm) -> approximate RGB ----------
   Classic Dan Bruton algorithm, gamma-adjusted, used widely
   for visualising the visible spectrum (380-750nm).          */
function wavelengthToRGB(wl) {
  let r, g, b, factor;
  if (wl >= 380 && wl < 440) { r = -(wl - 440) / (440 - 380); g = 0; b = 1; }
  else if (wl >= 440 && wl < 490) { r = 0; g = (wl - 440) / (490 - 440); b = 1; }
  else if (wl >= 490 && wl < 510) { r = 0; g = 1; b = -(wl - 510) / (510 - 490); }
  else if (wl >= 510 && wl < 580) { r = (wl - 510) / (580 - 510); g = 1; b = 0; }
  else if (wl >= 580 && wl < 645) { r = 1; g = -(wl - 645) / (645 - 580); b = 0; }
  else if (wl >= 645 && wl <= 750) { r = 1; g = 0; b = 0; }
  else { r = 0; g = 0; b = 0; }

  if (wl >= 380 && wl < 420) factor = 0.3 + 0.7 * (wl - 380) / (420 - 380);
  else if (wl >= 420 && wl < 700) factor = 1.0;
  else if (wl >= 700 && wl <= 750) factor = 0.3 + 0.7 * (750 - wl) / (750 - 700);
  else factor = 0.0;

  const gamma = 0.8;
  const toByte = (c) => c === 0 ? 0 : Math.round(255 * Math.pow(c * factor, gamma));
  return `rgb(${toByte(r)},${toByte(g)},${toByte(b)})`;
}

/* ---------- Planck's law (relative spectral radiance) ----------
   Used to draw a physically-based continuum for each star's
   effective temperature. Returns relative intensity, not
   absolute physical units.                                       */
function planckIntensity(wlNm, tempK) {
  const h = 6.626e-34, c = 2.998e8, k = 1.381e-23;
  const wlM = wlNm * 1e-9;
  const exponent = (h * c) / (wlM * k * tempK);
  // guard against overflow for very short wavelengths / low temps
  if (exponent > 700) return 0;
  const numerator = 2 * h * c * c;
  const denominator = Math.pow(wlM, 5) * (Math.exp(exponent) - 1);
  return numerator / denominator;
}

/* Build a normalised continuum array (380-750nm) for a given temperature.
   Normalised against the peak of THIS star's own curve within the visible
   window, so every star's spectrum bar reads at full brightness while the
   underlying shape (blue-heavy vs red-heavy) stays physically accurate.  */
function buildContinuum(tempK, steps = 300, minWl = 380, maxWl = 750) {
  const arr = [];
  let max = 0;
  for (let i = 0; i <= steps; i++) {
    const wl = minWl + (i / steps) * (maxWl - minWl);
    const val = planckIntensity(wl, tempK);
    arr.push(val);
    if (val > max) max = val;
  }
  return arr.map(v => (max > 0 ? v / max : 0));
}

/* Compute a full intensity profile (continuum minus absorption dips)
   for a star, sampled across the visible window.                    */
function buildSpectrumProfile(star, steps = 300, minWl = 380, maxWl = 750) {
  const continuum = buildContinuum(star.tempK, steps, minWl, maxWl);
  const profile = continuum.slice();
  const activeLines = getActiveLines(star);

  activeLines.forEach(line => {
    const sigma = line.isBand ? (line.width || 18) : 3.2;
    const depth = 0.75 * line.strength; // max fractional dip
    for (let i = 0; i <= steps; i++) {
      const wl = minWl + (i / steps) * (maxWl - minWl);
      const dx = wl - line.wl;
      const gauss = Math.exp(-(dx * dx) / (2 * sigma * sigma));
      profile[i] = Math.max(0.02, profile[i] - depth * gauss * continuum[i]);
    }
  });
  return { continuum, profile, minWl, maxWl, steps };
}

/* Returns a flat list of {element, wl, label, strength, isBand,width}
   for every line that is actually "present" (strength above threshold)
   in a given star, based on its lineStrengths map.                   */
function getActiveLines(star, threshold = 0.08) {
  const out = [];
  Object.keys(star.lineStrengths || {}).forEach(elKey => {
    const strength = star.lineStrengths[elKey];
    if (strength < threshold) return;
    const el = ELEMENTS[elKey];
    if (!el) return;
    el.lines.forEach(line => {
      out.push({
        element: elKey,
        elName: el.name,
        wl: line.wl,
        label: line.label,
        strength,
        isBand: !!line.isBand,
        width: line.width
      });
    });
  });
  return out;
}

/* Elements considered "present" in a star for challenge-mode scoring */
function getStarComposition(star, threshold = 0.15) {
  return Object.keys(star.lineStrengths || {}).filter(k => star.lineStrengths[k] >= threshold);
}

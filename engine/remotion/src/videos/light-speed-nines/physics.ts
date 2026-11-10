// Relativistic sky physics for "light-speed-nines". Pure functions, no React.
// Observer moving with speed beta along +z through a static star field.
//   aberration: cos th' = (cos th + b) / (1 + b cos th)
//   Doppler:    D = 1 / (g (1 - b cos th')) = g (1 + b cos th)
//   a blackbody at T is seen as a blackbody at D*T
//   point-source visible-band flux ratio: R = D^-2 * V(D T) / V(T)   (bolometric -> D^2)
// V(T) = Planck radiance integrated over 400-700 nm (tabulated in ln T below).

const H = 6.62607015e-34;
const KB = 1.380649e-23;
const CL = 299792458;

const planck = (lam: number, T: number) => {
  const x = (H * CL) / (lam * KB * T);
  if (x > 700) return 0;
  return (2 * H * CL * CL) / Math.pow(lam, 5) / Math.expm1(x);
};

const visibleRaw = (T: number) => {
  let s = 0;
  const n = 40;
  for (let i = 0; i < n; i++) s += planck((400 + ((i + 0.5) * 300) / n) * 1e-9, T);
  return s;
};

// table of ln V over ln T from 200 K to 2e9 K
const LT0 = Math.log(200);
const LT1 = Math.log(2e9);
const NT = 600;
const LNV = new Float64Array(NT + 1);
for (let i = 0; i <= NT; i++) {
  const T = Math.exp(LT0 + ((LT1 - LT0) * i) / NT);
  LNV[i] = Math.log(Math.max(visibleRaw(T), 1e-300));
}

/** ln of the visible-band radiance of a blackbody at T (arbitrary units) */
export const lnVisible = (T: number) => {
  const x = ((Math.log(Math.max(T, 200)) - LT0) / (LT1 - LT0)) * NT;
  if (x >= NT) return LNV[NT] + (Math.log(T) - LT1); // Rayleigh-Jeans: V ~ T
  const i = Math.floor(x);
  const f = x - i;
  return LNV[i] * (1 - f) + LNV[i + 1] * f;
};

export const gammaOf = (b: number) => 1 / Math.sqrt(Math.max(1e-30, 1 - b * b));

/** observed angle from the direction of travel for a source at angle th (radians) */
export const aberrate = (cosTh: number, b: number) => (cosTh + b) / (1 + b * cosTh);

/** blackbody colour (sRGB 0..255) for a temperature, Tanner Helland fit, clamped */
export const bbColor = (T: number): [number, number, number] => {
  const t = Math.min(40000, Math.max(1000, T)) / 100;
  let r: number, g: number, b: number;
  if (t <= 66) {
    r = 255;
    g = 99.4708025861 * Math.log(t) - 161.1195681661;
    b = t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  } else {
    r = 329.698727446 * Math.pow(t - 60, -0.1332047592);
    g = 288.1221695283 * Math.pow(t - 60, -0.0755148492);
    b = 255;
  }
  const c = (v: number) => Math.max(0, Math.min(255, v));
  return [c(r), c(g), c(b)];
};

/** rapidity-space interpolation between two speeds (smooth, looks right in log(1-b)) */
export const lerpBeta = (b0: number, b1: number, f: number) => {
  const r0 = Math.atanh(Math.min(b0, 1 - 1e-15));
  const r1 = Math.atanh(Math.min(b1, 1 - 1e-15));
  return Math.tanh(r0 + (r1 - r0) * f);
};

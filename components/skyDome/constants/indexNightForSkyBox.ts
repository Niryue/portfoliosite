export interface SkyPreset {

    
  DomeRadius: number;

  moonElev: number;
  moonAzim: number;

  moonColor: string;
  moonGlowColor: string;
  moonSize: number;
  moonGlowFalloff: number;
  moonGlowIntensity: number;
  moonEdgeSoftness: number;
  moonPhasePos: number;
  moonPhaseSoftness: number;
  moonPhaseAngle: number;
  moonEmission: number;
  moonSpotColor: string;
  moonSpotScale: number;
  moonSpotStrength: number;
  moonSpotThreshold: number;
  moonSpotSharpness: number;
  moonSpotOctaves: number;

  starDensity: number;
  starSize: number;
  starBrightness: number;
  starFloor: number;
  starDriftY: number;
  starDriftZ: number;
  starTwinkleSpeed: number;
  starTwinkleAmount: number;

  auroraIntensity: number;
  auroraColor1: string;
  auroraColor2: string;
  auroraFloor: number;
  auroraCeil: number;
  auroraScale: number;
  auroraSpeed: number;
  auroraThresh: number;
  auroraSoft: number;
  auroraWav: number;
}

export const NIGHT_SKY: SkyPreset = {
  // ─────────────────────────────────────────────
  // MOON
  // Existing night preset values
  // Azimuth changed to 37°
  // ─────────────────────────────────────────────


  DomeRadius: 500,

  moonElev: 17,
  moonAzim: 37,

  moonColor: "#d7ebff",
  moonGlowColor: "#075fc1",
  moonSize: 0.03,
  moonGlowFalloff: 80,
  moonGlowIntensity: 0.75,
  moonEdgeSoftness: 0.08,

  moonPhasePos: -0.10,
  moonPhaseSoftness: 1.90,
  moonPhaseAngle: 150,
  moonEmission: 2,

  moonSpotColor: "#69c2f6",
  moonSpotScale: 2.2,
  moonSpotStrength: 0.9,
  moonSpotThreshold: 0.58,
  moonSpotSharpness: 0.15,
  moonSpotOctaves: 4,

  // ─────────────────────────────────────────────
  // STARS
  // Existing SkyDome defaults
  // ─────────────────────────────────────────────

  starDensity: 350,
  starSize: 0.04,
  starBrightness: 0.7,
  starFloor: 0.09,

  starDriftY: 0,
  starDriftZ: 0,

  starTwinkleSpeed: 2,
  starTwinkleAmount: 1,

  // ─────────────────────────────────────────────
  // AURORA
  // Existing aurora defaults its bugging idk why but it doesnt look good anywayaw
  // ─────────────────────────────────────────────
  auroraIntensity: 0,
  auroraColor1: "#3affd8",
  auroraColor2: "#7b5bff",
  auroraFloor: 0.09,
  auroraCeil: 0.43,
  auroraScale: 9,
  auroraSpeed: 0.2,
  auroraThresh: 0.77,
  auroraSoft: 0.24,
  auroraWav: 2.2,
};
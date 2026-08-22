// ─────────────────────────────────────────────────────────────────────────────
// Sky Presets
//
// Every field except `label` and the feature flags is optional: what a preset
// doesn't define falls back to the Leva control value in SkyDome, so a preset
// only needs to declare what differs from the tweaked defaults.
// ─────────────────────────────────────────────────────────────────────────────

export type SkyMode = "sunrise" | "day" | "sunset" | "night";

export interface AmbientPreset {
  color: string;
  intensity: number;
}

/** Per-preset lighting rig (ambient + directional). */
export interface LightPreset {
  ambientColor: string;
  ambientIntensity: number;
  dirColor: string;
  dirIntensity: number;
  dirX: number;
  dirY: number;
  dirZ: number;
  targetX: number;
  targetY: number;
  targetZ: number;
}

export interface FilterPreset {
  /** CSS color for a full-screen mix-blend-mode overlay. */
  color: string;
  /** 0 = off, 1 = full tint. */
  opacity: number;
}

export interface ShadowPreset {
  shadowBias?: number;
  shadowNormalBias?: number;
  shadowNear?: number;
  shadowFar?: number;
  shadowCamSize?: number;
  shadowMapSize?: 512 | 1024 | 2048 | 4096;
}

export interface SkyPreset {
  // ─────────────────────────────────────────────────────────────────────────
  // New SkyDome moon / stars / aurora values
  // ─────────────────────────────────────────────────────────────────────────

  DomeRadius?: number;

  moonElev?: number;
  moonAzim?: number;
  moonColor?: string;
  moonGlowColor?: string;
  moonSize?: number;
  moonGlowFalloff?: number;
  moonGlowIntensity?: number;
  moonEdgeSoftness?: number;
  moonPhasePos?: number;
  moonPhaseSoftness?: number;
  moonPhaseAngle?: number;
  moonEmission?: number;
  moonSpotColor?: string;
  moonSpotScale?: number;
  moonSpotStrength?: number;
  moonSpotThreshold?: number;
  moonSpotSharpness?: number;
  moonSpotOctaves?: number;

  starDensity?: number;
  starSize?: number;
  starBrightness?: number;
  starFloor?: number;
  starDriftY?: number;
  starDriftZ?: number;
  starTwinkleSpeed?: number;
  starTwinkleAmount?: number;

  auroraIntensity?: number;
  auroraColor1?: string;
  auroraColor2?: string;
  auroraFloor?: number;
  auroraCeil?: number;
  auroraScale?: number;
  auroraSpeed?: number;
  auroraThresh?: number;
  auroraSoft?: number;
  auroraWav?: number;

  // ─────────────────────────────────────────────────────────────────────────
  // Existing preset structure — KEPT
  // ─────────────────────────────────────────────────────────────────────────

  label: string;
  ambient: AmbientPreset;
  filter: FilterPreset;
  light: LightPreset;
  shadow?: ShadowPreset;

  // ── Feature flags ──────────────────────────────────────────────────────────
  starsEnabled: boolean;
  moonEnabled: boolean;
  cloudsEnabled: boolean;
  sparklesEnabled?: boolean;
  dustCloudsEnabled?: boolean;
  auroraEnabled?: boolean;
  sideDistortionEnabled?: boolean;

  // ── Sky gradient ───────────────────────────────────────────────────────────
  skyLow?: string;
  skyHigh?: string;
  horizonLine?: number;
  horizonSpread?: number;

  // ── Clouds ─────────────────────────────────────────────────────────────────
  cloudSpeed?: number;
  cloudScale?: number;
  cloudDensity?: number;
  cloudSharpness?: number;
  cloudOctaves?: number;
  cloudAmplitude?: number;
  cloudGrain?: number;
  cloudCore?: string;
  cloudEdge?: string;
  cloudRim?: string;
  cloudEdgeWidth?: number;
  cloudRimStrength?: number;
  cloudDarkenFar?: number;
  cloudStretch?: number;
  cloudMorphSpeed?: number;
  cloudOpacity?: number;
  cloudFloor?: number;
  cloudCeiling?: number;
  moonLightRadius?: number;
  moonLightSoftness?: number;

  // ── Scene dressing carried over from the source project ────────────────────
  mountainColor?: string;
  mountainColorTop?: string;
  gradSoftness?: number;
  fogColor?: string;
  fogDensity?: number;
  fogY?: number;
  chunkFogColor?: string;
  seabedColorBottom?: string;
  seabedColorTop?: string;
  seabedFadeDistance?: number;
  seabedFadeStrength?: number;
  waterHorizonColor?: string;
  waterDeepColor?: string;
  waterDeepOpacity?: number;
  waterFadeStrength?: number;
  rainColor?: string;
  rainOpacity?: number;
}

/** Written each frame by a day-cycle controller to cross-fade two presets. */
export interface BlendState {
  /** True only during the transition window. */
  active: boolean;
  /** Smoothstepped 0 → 1 over the transition window. */
  t: number;
  from: SkyPreset;
  to: SkyPreset;
}

export const SKY_PRESETS: Record<SkyMode, SkyPreset> = {
  sunrise: {
    label: "Sunrise",
    ambient: { color: "#fff5b7", intensity: 2 },
    filter: { color: "hsl(220, 70%, 55%)", opacity: 0 },
    light: {
      ambientColor: "#e0ccff",
      ambientIntensity: 2.55,
      dirColor: "#ffffff",
      dirIntensity: 3.0,
      dirX: 10.5,
      dirY: 114.0,
      dirZ: 176.5,
      targetX: 99.5,
      targetY: 23.0,
      targetZ: 200,
    },

    starsEnabled: false,
    moonEnabled: true,
    cloudsEnabled: true,

    sparklesEnabled: true,
    dustCloudsEnabled: true,

    // Sky
    skyLow: "#fce8a4",
    skyHigh: "#52add1",
    horizonLine: 0.05,
    horizonSpread: 0.2,

    // Sun disc
    moonElev: 10,
    moonAzim: 258,
    moonColor: "#fffffd",
    moonGlowColor: "#ff8026",
    moonSize: 0.015,
    moonEdgeSoftness: 0.04,
    moonPhasePos: 2,
    moonPhaseSoftness: 0.45,
    moonPhaseAngle: 150,
    moonEmission: 1.4,
    moonSpotColor: "#69c2f6",
    moonSpotStrength: 0,
    moonGlowFalloff: 53,

    // Daytime clouds
    cloudDensity: 0.36,
    cloudScale: 8.5,
    cloudSharpness: 0.1,
    cloudAmplitude: 0.74,
    cloudGrain: 0.13,
    cloudCore: "#aab2ba",
    cloudEdge: "#faf3d0",
    cloudRim: "#e5a715",
    cloudOpacity: 0.45,

    cloudEdgeWidth: 0.11,
    cloudRimStrength: 4.5,
    moonLightRadius: 0.05,
    moonLightSoftness: 0.75,
    cloudDarkenFar: 1,
    cloudFloor: -0.03,
    mountainColor: "#88aebe",
    mountainColorTop: "#ded0ba",
    gradSoftness: 0.8,
    fogColor: "#c1c1c1",
    fogDensity: 0.4,
    chunkFogColor: "#4568e7",
    waterHorizonColor: "#4568e7",
    waterDeepOpacity: 0.7,

    seabedColorBottom: "#23c2c8",
    seabedColorTop: "#177096",
  },

  day: {
    label: "Day",
    ambient: { color: "#fff5b7", intensity: 2 },
    filter: { color: "hsl(220, 70%, 55%)", opacity: 0 },
    light: {
      ambientColor: "#f5e7c3",
      ambientIntensity: 2.0,
      dirColor: "#ffffff",
      dirIntensity: 3.0,
      dirX: 10.5,
      dirY: 114.0,
      dirZ: 176.0,
      targetX: 40.5,
      targetY: 23.0,
      targetZ: 200,
    },

    starsEnabled: false,
    moonEnabled: true,
    cloudsEnabled: true,
    moonElev: 10,
    moonAzim: 258,
    moonGlowIntensity: 0.45,
    sparklesEnabled: true,
    dustCloudsEnabled: true,

    // Sky
    skyLow: "#4aa7e2",
    skyHigh: "#8ecef2",
    horizonLine: 0.05,
    horizonSpread: 0.15,

    // Sun disc
    moonColor: "#fbfcd6",
    moonGlowColor: "#34a2ef",
    moonSize: 0.015,
    moonEdgeSoftness: 0.04,
    moonPhasePos: 2,
    moonPhaseSoftness: 0.45,
    moonPhaseAngle: 150,
    moonEmission: 1.4,
    moonSpotColor: "#69c2f6",
    moonSpotStrength: 0,
    moonGlowFalloff: 53,

    // Daytime clouds
    cloudDensity: 0.36,
    cloudScale: 8.5,
    cloudSharpness: 0.05,
    cloudAmplitude: 0.63,
    cloudOctaves: 7,
    cloudGrain: 0.13,
    cloudCore: "#dcdcdc",
    cloudEdge: "#ffffff",
    cloudRim: "#d2d2d2",
    cloudOpacity: 0.4,

    cloudEdgeWidth: 0.13,
    cloudRimStrength: 0.2,
    moonLightRadius: 0.98,
    moonLightSoftness: 0.17,

    cloudDarkenFar: 1,
    cloudFloor: -0.03,
    mountainColor: "#518cb4",
    mountainColorTop: "#518cb4",
    gradSoftness: 0.65,
    fogColor: "#518cb4",
    fogDensity: 0.4,
    chunkFogColor: "#518cb4",
    waterHorizonColor: "#4aa7e2",
    waterDeepOpacity: 0.7,

    seabedColorBottom: "#23c2c8",
    seabedColorTop: "#177096",
  },

  sunset: {
    label: "Sunset",
    ambient: { color: "#e8924a", intensity: 0.65 },
    filter: { color: "hsl(22, 80%, 58%)", opacity: 0.2 },
    light: {
      ambientColor: "#ffdbbe",
      ambientIntensity: 1.2,
      dirColor: "#ff9568",
      dirIntensity: 2.3,

      dirX: -121.0,
      dirY: 84.5,

      dirZ: 108.0,
      targetX: 172.5,
      targetY: 32.0,
      targetZ: 130.5,
    },

    starsEnabled: true,
    moonEnabled: true,
    cloudsEnabled: true,

    sparklesEnabled: false,
    dustCloudsEnabled: false,

    // Sky
    skyLow: "#ffd6a6",
    skyHigh: "#be779d",
    horizonLine: -0.02,
    horizonSpread: 1,

    // Sun disc
    moonElev: 10,
    moonAzim: 258,
    moonColor: "#fff8dc",
    moonGlowColor: "#c48600",
    moonSize: 0.015,
    moonGlowIntensity: 0.1,
    moonGlowFalloff: 0,
    moonEdgeSoftness: 0.11,
    moonPhasePos: 2,
    moonPhaseSoftness: 1.3,
    moonPhaseAngle: 150,
    moonEmission: 0.33,
    moonSpotStrength: 0,

    // Clouds
    cloudDensity: 0.36,
    cloudScale: 8.5,
    cloudSharpness: 0.1,
    cloudAmplitude: 0.74,
    cloudGrain: 0.13,
    cloudOpacity: 0.55,

    cloudCore: "#584a75",
    cloudEdge: "#d86c68",
    cloudRim: "#ffeb89",
    cloudRimStrength: 0.5,
    moonLightRadius: 0.14,
    moonLightSoftness: 0.99,
    cloudDarkenFar: 0.9,
    cloudFloor: -0.04,

    mountainColor: "#6e2a2d",
    mountainColorTop: "#a84050",

    seabedColorBottom: "#06314f",
    seabedColorTop: "#1a707a",
    seabedFadeDistance: 210,
    seabedFadeStrength: 3.8,
    waterDeepOpacity: 0.7,

    fogColor: "#ffa99e",
    fogDensity: 0.2,
    fogY: -11,

    rainColor: "#e8b89a",
    rainOpacity: 0.7,

    chunkFogColor: "#983a37",
    waterHorizonColor: "#983a37",

    shadow: {
      shadowBias: -0.0027,
    },
  },

  night: {
    label: "Night",

    ambient: {
      color: "#000000",
      intensity: 0,
    },

    filter: {
      color: "#000000",
      opacity: 0,
    },

    light: {
      ambientColor: "#000000",
      ambientIntensity: 0,
      dirColor: "#000000",
      dirIntensity: 0,
      dirX: -121.0,
      dirY: 70.0,
      dirZ: 81.5,
      targetX: 91.5,
      targetY: 19.5,
      targetZ: 130.5,
    },

    starsEnabled: true,
    moonEnabled: true,
    cloudsEnabled: false,
    sparklesEnabled: false,
    dustCloudsEnabled: false,
    auroraEnabled: true,

    // ─────────────────────────────────────────────
    // SKY BACKGROUND — TRANSPARENT
    // ─────────────────────────────────────────────

    skyLow: "#00000000",
    skyHigh: "#00000000",
    horizonLine: 0,
    horizonSpread: 0,

    // ─────────────────────────────────────────────
    // MOON
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
    // ─────────────────────────────────────────────

    auroraIntensity: 3,
    auroraColor1: "#3affd8",
    auroraColor2: "#7b5bff",
    auroraFloor: 0.09,
    auroraCeil: 0.43,
    auroraScale: 9,
    auroraSpeed: 0.2,
    auroraThresh: 0.77,
    auroraSoft: 0.24,
    auroraWav: 2.2,

    // ─────────────────────────────────────────────
    // EVERYTHING ELSE — INVISIBLE
    // ─────────────────────────────────────────────

    cloudScale: 8.5,
    cloudSharpness: 0.1,
    cloudAmplitude: 0,
    cloudGrain: 0,
    cloudDensity: 0,
    cloudOpacity: 0,

    cloudCore: "#00000000",
    cloudEdge: "#00000000",
    cloudRim: "#00000000",

    cloudEdgeWidth: 0,
    cloudRimStrength: 0,
    cloudDarkenFar: 0,

    cloudFloor: 999999,
    cloudCeiling: -999999,

    moonLightRadius: 0,
    moonLightSoftness: 0,

    mountainColor: "#00000000",
    mountainColorTop: "#00000000",
    gradSoftness: 0,

    fogColor: "#00000000",
    fogDensity: 0,
    fogY: 0,

    chunkFogColor: "#00000000",

    seabedColorBottom: "#00000000",
    seabedColorTop: "#00000000",
    seabedFadeDistance: 0,
    seabedFadeStrength: 0,

    waterHorizonColor: "#00000000",
    waterDeepColor: "#00000000",
    waterDeepOpacity: 0,
    waterFadeStrength: 0,

    rainColor: "#00000000",
    rainOpacity: 0,

    shadow: {
      shadowBias: -0.0015,
      shadowFar: 1250,
    },

    // All sky/moon/cloud values left undefined → Leva controls apply
  },
};
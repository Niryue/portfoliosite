"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import {
  NIGHT_SKY,
  type SkyPreset,
} from "./constants/indexNightForSkyBox";

// ─────────────────────────────────────────────────────────────────────────────
// SkyDome
//
// Transparent atmospheric layer rendered over the existing HDRI.
//
// Contains ONLY:
//   1. Moon glow
//   2. Stars
//   3. Aurora
//   4. Moon disc
//
// The HDRI remains completely visible because this shader outputs transparent
// pixels everywhere that none of the above effects are present.
//
// IMPORTANT:
//   depthTest = true
//   depthWrite = false
//
// This allows opaque 3D models to block the moon/stars/aurora.
// The SkyDome does NOT write anything into the depth buffer.
// ─────────────────────────────────────────────────────────────────────────────

const DOME_RADIUS = 1;

// ─────────────────────────────────────────────────────────────────────────────
// Vertex shader
// ─────────────────────────────────────────────────────────────────────────────

const SKY_VERT = /* glsl */ `
  varying vec3 vDir;

  void main() {
    // Local-space direction from the camera.
    vDir = normalize(position);

    gl_Position =
      projectionMatrix *
      modelViewMatrix *
      vec4(position, 1.0);
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// Fragment shader
// ─────────────────────────────────────────────────────────────────────────────

const SKY_FRAG = /* glsl */ `
  #define PI 3.14159265358979323846

  // ── Moon ───────────────────────────────────────────────────────────────────

  uniform vec3  uMoonDir;
  uniform vec3  uMoonColor;
  uniform vec3  uMoonGlowColor;
  uniform float uMoonSize;
  uniform float uMoonGlowFalloff;
  uniform float uMoonGlowIntensity;

  uniform float uMoonEdgeSoftness;

  uniform float uMoonPhasePos;
  uniform float uMoonPhaseSoftness;
  uniform float uMoonPhaseAngle;

  uniform float uMoonEmission;

  uniform vec3  uMoonSpotColor;
  uniform float uMoonSpotScale;
  uniform float uMoonSpotStrength;
  uniform float uMoonSpotThreshold;
  uniform float uMoonSpotSharpness;
  uniform int   uMoonSpotOctaves;

  // ── Aurora ─────────────────────────────────────────────────────────────────

  uniform float uAuroraIntensity;
  uniform vec3  uAuroraColor1;
  uniform vec3  uAuroraColor2;
  uniform float uAuroraFloor;
  uniform float uAuroraCeil;
  uniform float uAuroraScale;
  uniform float uAuroraSpeed;
  uniform float uAuroraThresh;
  uniform float uAuroraSoft;
  uniform float uAuroraWav;

  // ── Stars ──────────────────────────────────────────────────────────────────

  uniform float uStarDensity;
  uniform float uStarSize;
  uniform float uStarBrightness;
  uniform float uStarFloor;
  uniform float uStarDriftY;
  uniform float uStarDriftZ;
  uniform float uStarTwinkleSpeed;
  uniform float uStarTwinkleAmount;

  uniform float uTime;

  varying vec3 vDir;

  // ───────────────────────────────────────────────────────────────────────────
  // 2-D hash / noise
  // ───────────────────────────────────────────────────────────────────────────

  float hash21(vec2 p) {
    p = fract(p * vec2(127.1, 311.7));
    p += dot(p, p + 19.19);

    return fract(p.x * p.y);
  }

  vec2 hash22(vec2 p) {
    p = vec2(
      dot(p, vec2(127.1, 311.7)),
      dot(p, vec2(269.5, 183.3))
    );

    return fract(sin(p) * 43758.5453);
  }

  float valueNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(
      mix(
        hash21(i),
        hash21(i + vec2(1.0, 0.0)),
        u.x
      ),
      mix(
        hash21(i + vec2(0.0, 1.0)),
        hash21(i + vec2(1.0, 1.0)),
        u.x
      ),
      u.y
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 3-D noise
  // ───────────────────────────────────────────────────────────────────────────

  float hash31(vec3 p) {
    p = fract(p * vec3(127.1, 311.7, 74.7));
    p += dot(p, p.yzx + 19.19);

    return fract((p.x + p.y) * p.z);
  }

  float valueNoise3D(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);

    vec3 u = f * f * (3.0 - 2.0 * f);

    return mix(
      mix(
        mix(
          hash31(i),
          hash31(i + vec3(1, 0, 0)),
          u.x
        ),
        mix(
          hash31(i + vec3(0, 1, 0)),
          hash31(i + vec3(1, 1, 0)),
          u.x
        ),
        u.y
      ),
      mix(
        mix(
          hash31(i + vec3(0, 0, 1)),
          hash31(i + vec3(1, 0, 1)),
          u.x
        ),
        mix(
          hash31(i + vec3(0, 1, 1)),
          hash31(i + vec3(1, 1, 1)),
          u.x
        ),
        u.y
      ),
      u.z
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Moon surface FBM
  // ───────────────────────────────────────────────────────────────────────────

  float fbmMoon(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    float norm = 0.0;

    for (int i = 0; i < 6; i++) {
      if (i >= uMoonSpotOctaves) {
        break;
      }

      v += a * valueNoise(p);
      norm += a;

      p = p * 2.1 + vec2(3.1, 7.4);
      a *= 0.5;
    }

    return v / max(norm, 0.001);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Star field
  // ───────────────────────────────────────────────────────────────────────────

  float starField(vec3 dir) {
    if (dir.y < uStarFloor - 0.05) {
      return 0.0;
    }

    // Horizontal drift around the Y axis.
    float aY = uTime * uStarDriftY;

    float cY = cos(aY);
    float sY = sin(aY);

    vec3 d = vec3(
      dir.x * cY + dir.z * sY,
      dir.y,
      -dir.x * sY + dir.z * cY
    );

    // Roll drift around the Z axis.
    float aZ = uTime * uStarDriftZ;

    float cZ = cos(aZ);
    float sZ = sin(aZ);

    d = vec3(
      d.x * cZ - d.y * sZ,
      d.x * sZ + d.y * cZ,
      d.z
    );

    // Equal-angle spherical UV.
    float az = atan(d.z, d.x);
    float el = asin(clamp(d.y, -1.0, 1.0));

    float u = az / (2.0 * PI) + 0.5;
    float v = el / (2.0 * PI) + 0.5;

    vec2 uv = vec2(u, v) * uStarDensity;

    vec2 cell = floor(uv);
    vec2 f = fract(uv);

    // Pixel footprint for anti-aliasing.
    vec2 uvPx = vec2(
      length(vec2(dFdx(uv.x), dFdy(uv.x))),
      length(vec2(dFdx(uv.y), dFdy(uv.y)))
    );

    // Prevent the atan seam from producing a bright vertical line.
    if (max(uvPx.x, uvPx.y) > 2.0) {
      return 0.0;
    }

    float aa = max(uvPx.x, uvPx.y);

    float result = 0.0;

    // Check neighboring cells so stars do not pop at cell boundaries.
    for (int dy = -1; dy <= 1; dy++) {
      for (int dx = -1; dx <= 1; dx++) {
        vec2 n =
          cell +
          vec2(
            float(dx),
            float(dy)
          );

        // Wrap the X coordinate around the spherical seam.
        vec2 nw = vec2(
          mod(n.x, uStarDensity),
          n.y
        );

        float brightness =
          hash21(nw + 0.5);

        float hasStar =
          step(0.6, brightness);

        vec2 offset =
          hash22(nw);

        float dist =
          length(
            f -
            (
              vec2(
                float(dx),
                float(dy)
              ) +
              offset
            )
          );

        float radius =
          uStarSize *
          (
            0.3 +
            0.7 * brightness
          );

        float alpha =
          (
            1.0 -
            smoothstep(
              radius,
              radius + max(aa, 0.001),
              dist
            )
          ) *
          hasStar;

        // Per-star twinkle.
        float phase =
          hash21(nw + 3.7) *
          6.28318;

        float rate =
          uStarTwinkleSpeed *
          (
            0.6 +
            0.8 *
            hash21(nw + 1.3)
          );

        float twinkle =
          1.0 -
          uStarTwinkleAmount *
          (
            0.5 +
            0.5 *
            sin(
              uTime * rate +
              phase
            )
          );

        alpha *= clamp(
          twinkle,
          0.0,
          1.0
        );

        result = max(
          result,
          alpha
        );
      }
    }

    result *= smoothstep(
      uStarFloor,
      uStarFloor + 0.1,
      dir.y
    );

    return result;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Main
  // ───────────────────────────────────────────────────────────────────────────

  void main() {
    vec3 dir = normalize(vDir);

    // All pixels begin completely transparent.
    //
    // This is the critical difference from the original SkyDome:
    // there is NO sky gradient and NO opaque background.
    vec3 color = vec3(0.0);
    float alpha = 0.0;

    // ─────────────────────────────────────────────────────────────────────────
    // Moon direction
    // ─────────────────────────────────────────────────────────────────────────

    vec3 moonDir =
      normalize(uMoonDir);

    float cosA =
      dot(
        dir,
        moonDir
      );

    // ─────────────────────────────────────────────────────────────────────────
    // 1. Moon glow
    //
    // The glow is intentionally calculated separately from the moon disc.
    // This allows the corona to extend beyond the disc.
    // ─────────────────────────────────────────────────────────────────────────

    float glow =
      pow(
        max(cosA, 0.0),
        uMoonGlowFalloff
      ) *
      uMoonGlowIntensity;

    color +=
      uMoonGlowColor *
      glow;

    alpha =
      max(
        alpha,
        clamp(glow, 0.0, 1.0)
      );

    // ─────────────────────────────────────────────────────────────────────────
    // 2. Stars
    // ─────────────────────────────────────────────────────────────────────────

    float star =
      starField(dir);

    color +=
      vec3(1.0) *
      star *
      uStarBrightness;

    alpha =
      max(
        alpha,
        clamp(
          star * uStarBrightness,
          0.0,
          1.0
        )
      );

    // ─────────────────────────────────────────────────────────────────────────
    // 3. Aurora
    // ─────────────────────────────────────────────────────────────────────────

    if (uAuroraIntensity > 0.001) {
      float aBand =
        smoothstep(
          uAuroraFloor,
          uAuroraFloor + 0.15,
          dir.y
        ) *
        smoothstep(
          uAuroraCeil,
          uAuroraCeil - 0.25,
          dir.y
        );

      if (aBand > 0.0) {
        vec3 ap =
          dir *
          uAuroraScale;

        // Stretch the noise vertically to create curtain-like structures.
        ap.y *= 0.25;

        // Horizontal movement.
        ap.x +=
          uTime *
          uAuroraSpeed;

        // Wavy domain warp.
        ap.xz +=
          (
            vec2(
              valueNoise3D(
                ap * 0.5 +
                vec3(
                  0.0,
                  uTime *
                    uAuroraSpeed *
                    0.7,
                  3.1
                )
              ),
              valueNoise3D(
                ap * 0.5 +
                vec3(
                  5.2,
                  uTime *
                    uAuroraSpeed *
                    0.5,
                  1.7
                )
              )
            ) -
            0.5
          ) *
          uAuroraWav;

        float n =
          valueNoise3D(ap) *
          0.65 +
          valueNoise3D(
            ap * 2.3 +
            vec3(7.1, 0.0, 2.9)
          ) *
          0.35;

        float curtain =
          smoothstep(
            uAuroraThresh - uAuroraSoft,
            uAuroraThresh + uAuroraSoft,
            n
          );

        // Vertical color gradient.
        float vt =
          clamp(
            (
              dir.y -
              uAuroraFloor
            ) /
            max(
              uAuroraCeil -
                uAuroraFloor,
              0.001
            ),
            0.0,
            1.0
          );

        vec3 auroraColor =
          mix(
            uAuroraColor1,
            uAuroraColor2,
            vt
          );

        float auroraAlpha =
          curtain *
          aBand *
          uAuroraIntensity;

        color +=
          auroraColor *
          auroraAlpha;

        alpha =
          max(
            alpha,
            clamp(
              auroraAlpha,
              0.0,
              1.0
            )
          );
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 4. Moon disc
    // ─────────────────────────────────────────────────────────────────────────

    float moonAngle =
      acos(
        clamp(
          cosA,
          -1.0,
          1.0
        )
      );

    // Build a local 2-D frame around the moon.
    vec3 moonBase =
      abs(moonDir.y) < 0.99
        ? vec3(0.0, 1.0, 0.0)
        : vec3(1.0, 0.0, 0.0);

    vec3 moonRight =
      normalize(
        cross(
          moonDir,
          moonBase
        )
      );

    vec3 moonUp =
      cross(
        moonRight,
        moonDir
      );

    float moonR2D =
      max(
        sin(uMoonSize),
        0.0001
      );

    vec2 moonUV =
      vec2(
        dot(dir, moonRight),
        dot(dir, moonUp)
      ) /
      moonR2D;

    // Softness around the physical edge of the disc.
    float edge =
      max(
        uMoonEdgeSoftness,
        0.001
      );

    float moonMask =
      1.0 -
      smoothstep(
        1.0 - edge,
        1.0 + edge,
        length(moonUV)
      );

    // ── Moon phase ───────────────────────────────────────────────────────────

    float cosPA =
      cos(uMoonPhaseAngle);

    float sinPA =
      sin(uMoonPhaseAngle);

    float projX =
      moonUV.x * cosPA -
      moonUV.y * sinPA;

    float litFactor =
      1.0 -
      smoothstep(
        uMoonPhasePos -
          uMoonPhaseSoftness,
        uMoonPhasePos +
          uMoonPhaseSoftness,
        projX
      );

    // ── Moon surface detail ──────────────────────────────────────────────────

    vec3 moonTexColor =
      uMoonColor;

    if (
      moonAngle <
      uMoonSize * 2.0
    ) {
      float spots =
        fbmMoon(
          moonUV *
          uMoonSpotScale
        );

      float spotPatch =
        smoothstep(
          uMoonSpotThreshold -
            uMoonSpotSharpness,
          uMoonSpotThreshold +
            uMoonSpotSharpness,
          spots
        );

      moonTexColor =
        mix(
          uMoonColor,
          uMoonSpotColor,
          spotPatch *
            uMoonSpotStrength
        );
    }

    float moonAlpha =
      moonMask *
      litFactor;

    // Disc replaces the transparent pixel with the moon.
    color =
      mix(
        color,
        moonTexColor,
        moonAlpha
      );

    // Self-emission makes the disc brighter without needing bloom.
    color +=
      moonTexColor *
      moonAlpha *
      uMoonEmission;

    alpha =
      max(
        alpha,
        clamp(
          moonAlpha,
          0.0,
          1.0
        )
      );

    // ─────────────────────────────────────────────────────────────────────────
    // Final transparent output
    //
    // Pixels with no moon, glow, stars, or aurora have alpha = 0 and therefore
    // reveal the HDRI behind this mesh.
    // ─────────────────────────────────────────────────────────────────────────

    gl_FragColor =
      vec4(
        color,
        clamp(alpha, 0.0, 1.0)
      );
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface SkyDomeProps {
  /**
   * Optional reference used by other components that need to know where
   * the moon is located.
   */
  moonDirRef?: React.MutableRefObject<THREE.Vector3>;
}

// ─────────────────────────────────────────────────────────────────────────────
// SkyDome
// ─────────────────────────────────────────────────────────────────────────────

export default function SkyDome({
  moonDirRef,
}: SkyDomeProps) {
  const meshRef =
    useRef<THREE.Mesh>(null!);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        // Render the inside of the sphere.
        side: THREE.BackSide,

        // IMPORTANT:
        //
        // depthTest MUST remain true so opaque scene geometry can occlude
        // the moon, stars, and aurora.
        depthTest: true,

        // IMPORTANT:
        //
        // We never write the SkyDome into the depth buffer.
        depthWrite: false,

        // The shader produces transparent pixels where no sky effect exists.
        transparent: true,

        // Normal alpha blending allows the HDRI to remain visible through
        // the transparent portions of this material.
        blending: THREE.NormalBlending,

        // Prevent Three.js from sorting this transparent dome ahead of
        // normal scene geometry unnecessarily.
        vertexShader: SKY_VERT,
        fragmentShader: SKY_FRAG,

        uniforms: {
          // ── Moon ──────────────────────────────────────────────────────────

          uMoonDir: {
            value:
              new THREE.Vector3(
                0,
                0.6,
                -0.8
              ).normalize(),
          },

          uMoonColor: {
            value:
              new THREE.Color(
                "#d7ebff"
              ),
          },

          uMoonGlowColor: {
            value:
              new THREE.Color(
                "#075fc1"
              ),
          },

          uMoonSize: {
            value: 0.025,
          },

          uMoonGlowFalloff: {
            value: 80,
          },

          uMoonGlowIntensity: {
            value: 0.35,
          },

          uMoonEdgeSoftness: {
            value: 0.08,
          },

          uMoonPhasePos: {
            value: 0.1,
          },

          uMoonPhaseSoftness: {
            value: 1.9,
          },

          uMoonPhaseAngle: {
            value:
              150 *
              (Math.PI / 180),
          },

          uMoonEmission: {
            value: 2,
          },

          uMoonSpotColor: {
            value:
              new THREE.Color(
                "#69c2f6"
              ),
          },

          uMoonSpotScale: {
            value: 2.2,
          },

          uMoonSpotStrength: {
            value: 0.9,
          },

          uMoonSpotThreshold: {
            value: 0.58,
          },

          uMoonSpotSharpness: {
            value: 0.15,
          },

          uMoonSpotOctaves: {
            value: 4,
          },

          // ── Stars ─────────────────────────────────────────────────────────

          uStarDensity: {
            value: 350,
          },

          uStarSize: {
            value: 0.04,
          },

          uStarBrightness: {
            value: 0.7,
          },

          uStarFloor: {
            value: 0.09,
          },

          uStarDriftY: {
            value: 0,
          },

          uStarDriftZ: {
            value: 0,
          },

          uStarTwinkleSpeed: {
            value: 2,
          },

          uStarTwinkleAmount: {
            value: 1,
          },

          // ── Aurora ────────────────────────────────────────────────────────

          uAuroraIntensity: {
            value: 0,
          },

          uAuroraColor1: {
            value:
              new THREE.Color(
                "#3affd8"
              ),
          },

          uAuroraColor2: {
            value:
              new THREE.Color(
                "#7b5bff"
              ),
          },

          uAuroraFloor: {
            value: 0.09,
          },

          uAuroraCeil: {
            value: 0.43,
          },

          uAuroraScale: {
            value: 9,
          },

          uAuroraSpeed: {
            value: 0.2,
          },

          uAuroraThresh: {
            value: 0.77,
          },

          uAuroraSoft: {
            value: 0.24,
          },

          uAuroraWav: {
            value: 2.2,
          },

          // ── Animation ─────────────────────────────────────────────────────

          uTime: {
            value: 0,
          },
        },
      }),
    [],
  );

  // ───────────────────────────────────────────────────────────────────────────
  // Frame update
  // ───────────────────────────────────────────────────────────────────────────

  useFrame(
    ({
      camera,
      clock,
    }) => {
      if (!meshRef.current) {
        return;
      }

      // Keep the dome centered on the camera.
      //
      // Because the dome only contains directional effects, its radius is
      // irrelevant to the visual position of the moon/stars/aurora.
      meshRef.current.position.copy(
        camera.position
      );

      meshRef.current.scale.setScalar(
        NIGHT_SKY.DomeRadius
      );

      const u =
        material.uniforms;

      // ─────────────────────────────────────────────────────────────────────
      // Time
      // ─────────────────────────────────────────────────────────────────────

      u.uTime.value =
        clock.elapsedTime;

      // ─────────────────────────────────────────────────────────────────────
      // Moon direction
      // ─────────────────────────────────────────────────────────────────────

      const moonElevRad =
        NIGHT_SKY.moonElev *
        (Math.PI / 180);

      const moonAzimRad =
        NIGHT_SKY.moonAzim *
        (Math.PI / 180);

      u.uMoonDir.value.set(
        Math.cos(moonElevRad) *
          Math.sin(moonAzimRad),

        Math.sin(moonElevRad),

        Math.cos(moonElevRad) *
          Math.cos(moonAzimRad),
      );

      if (moonDirRef) {
        moonDirRef.current.copy(
          u.uMoonDir.value
        );
      }

      // ─────────────────────────────────────────────────────────────────────
      // Moon
      // ─────────────────────────────────────────────────────────────────────

      u.uMoonColor.value.set(
        NIGHT_SKY.moonColor
      );

      u.uMoonGlowColor.value.set(
        NIGHT_SKY.moonGlowColor
      );

      u.uMoonSize.value =
        NIGHT_SKY.moonSize;

      u.uMoonGlowFalloff.value =
        NIGHT_SKY.moonGlowFalloff;

      u.uMoonGlowIntensity.value =
        NIGHT_SKY.moonGlowIntensity;

      u.uMoonEdgeSoftness.value =
        NIGHT_SKY.moonEdgeSoftness;

      u.uMoonPhasePos.value =
        NIGHT_SKY.moonPhasePos;

      u.uMoonPhaseSoftness.value =
        NIGHT_SKY.moonPhaseSoftness;

      u.uMoonPhaseAngle.value =
        NIGHT_SKY.moonPhaseAngle *
        (Math.PI / 180);

      u.uMoonEmission.value =
        NIGHT_SKY.moonEmission;

      u.uMoonSpotColor.value.set(
        NIGHT_SKY.moonSpotColor
      );

      u.uMoonSpotScale.value =
        NIGHT_SKY.moonSpotScale;

      u.uMoonSpotStrength.value =
        NIGHT_SKY.moonSpotStrength;

      u.uMoonSpotThreshold.value =
        NIGHT_SKY.moonSpotThreshold;

      u.uMoonSpotSharpness.value =
        NIGHT_SKY.moonSpotSharpness;

      u.uMoonSpotOctaves.value =
        NIGHT_SKY.moonSpotOctaves;

      // ─────────────────────────────────────────────────────────────────────
      // Stars
      // ─────────────────────────────────────────────────────────────────────

      u.uStarDensity.value =
        NIGHT_SKY.starDensity;

      u.uStarSize.value =
        NIGHT_SKY.starSize;

      u.uStarBrightness.value =
        NIGHT_SKY.starBrightness;

      u.uStarFloor.value =
        NIGHT_SKY.starFloor;

      u.uStarDriftY.value =
        NIGHT_SKY.starDriftY;

      u.uStarDriftZ.value =
        NIGHT_SKY.starDriftZ;

      u.uStarTwinkleSpeed.value =
        NIGHT_SKY.starTwinkleSpeed;

      u.uStarTwinkleAmount.value =
        NIGHT_SKY.starTwinkleAmount;

      // ─────────────────────────────────────────────────────────────────────
      // Aurora
      // ─────────────────────────────────────────────────────────────────────

      u.uAuroraIntensity.value =
        NIGHT_SKY.auroraIntensity;

      u.uAuroraColor1.value.set(
        NIGHT_SKY.auroraColor1
      );

      u.uAuroraColor2.value.set(
        NIGHT_SKY.auroraColor2
      );

      u.uAuroraFloor.value =
        NIGHT_SKY.auroraFloor;

      u.uAuroraCeil.value =
        NIGHT_SKY.auroraCeil;

      u.uAuroraScale.value =
        NIGHT_SKY.auroraScale;

      u.uAuroraSpeed.value =
        NIGHT_SKY.auroraSpeed;

      u.uAuroraThresh.value =
        NIGHT_SKY.auroraThresh;

      u.uAuroraSoft.value =
        NIGHT_SKY.auroraSoft;

      u.uAuroraWav.value =
        NIGHT_SKY.auroraWav;
    },
  );

  return (
    <mesh
      ref={meshRef}
      renderOrder={-100}
    >
      <sphereGeometry
        args={[
          DOME_RADIUS,
          64,
          64,
        ]}
      />

      <primitive
        object={material}
        attach="material"
      />
    </mesh>
  );
}
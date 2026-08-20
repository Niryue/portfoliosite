"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { VERT } from "./shaders/vertex";
import { FRAG } from "./shaders/fragment";
import { WATER_SPARKLES } from "./utils/controls";

// ─────────────────────────────────────────────────────────────────────────────
// WaterSparkles — procedural 4-pointed star sparkles on the water surface.
// ─────────────────────────────────────────────────────────────────────────────

const MAX_COUNT = 500;

export default function WaterSparkles() {
  // ── Static settings ────────────────────────────────────────────────────────
  const {
    count,
    spread,
    heightOffset,
  } = WATER_SPARKLES;

  const {
    minSize,
    maxSize,
  } = WATER_SPARKLES.size;

  const {
    minLife,
    maxLife,
  } = WATER_SPARKLES.lifetime;

  const {
    color,
    intensity,
    armSharpness,
    armFalloff,
    glowRadius,
  } = WATER_SPARKLES.appearance;

  // ── CPU particle data ──────────────────────────────────────────────────────
  const posArr = useMemo(
    () => new Float32Array(MAX_COUNT * 3),
    []
  );

  const lifeArr = useMemo(
    () => new Float32Array(MAX_COUNT),
    []
  );

  const maxLifeArr = useMemo(
    () => new Float32Array(MAX_COUNT),
    []
  );

  const sizeArr = useMemo(
    () => new Float32Array(MAX_COUNT),
    []
  );

  // ── Initialise particles ──────────────────────────────────────────────────
  useMemo(() => {
    for (let i = 0; i < MAX_COUNT; i++) {
      posArr[i * 3] =
        (Math.random() - 0.5) * 60;

      posArr[i * 3 + 1] =
        -0.1 + heightOffset;

      posArr[i * 3 + 2] =
        (Math.random() - 0.5) * 60;

      maxLifeArr[i] =
        minLife + Math.random() * (maxLife - minLife);

      lifeArr[i] =
        Math.random() * maxLifeArr[i];

      sizeArr[i] =
        minSize + Math.random() * (maxSize - minSize);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── BufferGeometry ─────────────────────────────────────────────────────────
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();

    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(posArr, 3)
    );

    geo.setAttribute(
      "aLifetime",
      new THREE.BufferAttribute(lifeArr, 1)
    );

    geo.setAttribute(
      "aMaxLifetime",
      new THREE.BufferAttribute(maxLifeArr, 1)
    );

    geo.setAttribute(
      "aSize",
      new THREE.BufferAttribute(sizeArr, 1)
    );

    geo.setDrawRange(0, MAX_COUNT);

    return geo;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Shader material ────────────────────────────────────────────────────────
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,

        vertexShader: VERT,
        fragmentShader: FRAG,

        uniforms: {
          uColor: {
            value: new THREE.Color(color),
          },

          uIntensity: {
            value: intensity,
          },

          uArmSharpness: {
            value: armSharpness,
          },

          uArmFalloff: {
            value: armFalloff,
          },

          uGlowRadius: {
            value: glowRadius,
          },
        },
      }),
    [
      color,
      intensity,
      armSharpness,
      armFalloff,
      glowRadius,
    ]
  );

  // ── Particle simulation ────────────────────────────────────────────────────
  useFrame(({ camera }, delta) => {
    geometry.setDrawRange(0, count);

    const posAttr =
      geometry.getAttribute("position") as THREE.BufferAttribute;

    const lifeAttr =
      geometry.getAttribute("aLifetime") as THREE.BufferAttribute;

    const maxLifeAttr =
      geometry.getAttribute("aMaxLifetime") as THREE.BufferAttribute;

    const sizeAttr =
      geometry.getAttribute("aSize") as THREE.BufferAttribute;

    const waterY = -0.1 + heightOffset;

    for (let i = 0; i < count; i++) {
      lifeArr[i] += delta;

      // Keep particles at the water surface
      posArr[i * 3 + 1] = waterY;

      if (lifeArr[i] >= maxLifeArr[i]) {
        // Respawn around the camera
        posArr[i * 3] =
          camera.position.x +
          (Math.random() - 0.5) * spread * 2;

        posArr[i * 3 + 1] =
          waterY;

        posArr[i * 3 + 2] =
          camera.position.z +
          (Math.random() - 0.5) * spread * 2;

        lifeArr[i] = 0;

        maxLifeArr[i] =
          minLife +
          Math.random() * (maxLife - minLife);

        sizeArr[i] =
          minSize +
          Math.random() * (maxSize - minSize);
      }
    }

    posAttr.needsUpdate = true;
    lifeAttr.needsUpdate = true;
    maxLifeAttr.needsUpdate = true;
    sizeAttr.needsUpdate = true;
  });

  return (
    <points
      geometry={geometry}
      frustumCulled={false}
      renderOrder={3}
    >
      <primitive
        object={material}
        attach="material"
      />
    </points>
  );
}
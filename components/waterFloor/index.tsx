"use client";

import { useRef, useMemo, useEffect } from "react";
import { rippleStore } from "./stores/rippleStore";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { VERT } from "./shaders/vertex";
import { FRAG } from "./shaders/fragment";
import { WATER_FLOOR } from "./utils/controls";

// ─────────────────────────────────────────────────────────────────────────────
// WaterFloor — cel-shaded / anime water using Voronoi F1 − SmoothF1
//
// Replicates the Blender node graph:
//   TextureCoord → Mapping (Y offset) → Voronoi F1
//                                      → Voronoi SmoothF1
//   Subtract (F1 − SF1) → ColorRamp → color
//
// World-space XZ coordinates so the pattern is world-anchored (not UV-based).
// Plane follows the camera like GridFloor for an infinite-floor look.
// ─────────────────────────────────────────────────────────────────────────────

interface WaterFloorProps {
  deepOpacityOverride?: number;
}

export default function WaterFloor({
  deepOpacityOverride,
}: WaterFloorProps) {
  const meshRef = useRef<THREE.Mesh>(null!);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.FrontSide,

        vertexShader: VERT,
        fragmentShader: FRAG,

        uniforms: {
          uTime: {
            value: 0,
          },

          uScale: {
            value: WATER_FLOOR.waterScale,
          },

          uSmoothness: {
            value: WATER_FLOOR.cellSmoothness,
          },

          uEdgeThreshold: {
            value: WATER_FLOOR.edgeThreshold,
          },

          uEdgeSoftness: {
            value: WATER_FLOOR.edgeSoftness,
          },

          uFlowX: {
            value: WATER_FLOOR.flowX,
          },

          uFlowZ: {
            value: WATER_FLOOR.flowZ,
          },

          uCellSpeed: {
            value: WATER_FLOOR.cellSpeed,
          },

          uNoiseScale: {
            value: WATER_FLOOR.noiseScale,
          },

          uNoiseFlowSpeed: {
            value: WATER_FLOOR.noiseFlowSpeed,
          },

          uDistortAmount: {
            value: WATER_FLOOR.distortAmount,
          },

          uDeepColor: {
            value: new THREE.Color(WATER_FLOOR.deepColor),
          },

          uMidColor: {
            value: new THREE.Color(WATER_FLOOR.midColor),
          },

          uMidPos: {
            value: WATER_FLOOR.midPos,
          },

          uHighlight: {
            value: new THREE.Color(WATER_FLOOR.highlightColor),
          },

          uOpacity: {
            value: WATER_FLOOR.opacity,
          },

          uDeepOpacity: {
            value:
              deepOpacityOverride ??
              WATER_FLOOR.deepOpacity,
          },

          uFadeDistance: {
            value: WATER_FLOOR.fadeDistance,
          },

          uFadeStrength: {
            value: WATER_FLOOR.fadeStrength,
          },

          uCamXZ: {
            value: new THREE.Vector2(),
          },

          // Ripple uniforms
          uRippleCenters: {
            value: Array.from(
              { length: 8 },
              () => new THREE.Vector2()
            ),
          },

          uRippleTimes: {
            value: new Array(8).fill(0),
          },

          uRippleCount: {
            value: 0,
          },

          uRippleSpeed: {
            value: 1.5,
          },

          uRippleWidth: {
            value: 0.12,
          },

          uRippleStrength: {
            value: 5.5,
          },

          uRippleDecay: {
            value: 1.6,
          },

          uRippleRings: {
            value: 2,
          },

          uRippleSpacing: {
            value: 1.0,
          },
        },
      }),
    [deepOpacityOverride]
  );

  useEffect(() => {
    return () => material.dispose();
  }, [material]);

  useFrame(({ camera, clock }) => {
    const u = material.uniforms;

    // ── Time ────────────────────────────────────────────────────────────────
    u.uTime.value = clock.getElapsedTime();

    // ── Water settings ──────────────────────────────────────────────────────
    u.uScale.value =
      WATER_FLOOR.waterScale;

    u.uSmoothness.value =
      WATER_FLOOR.cellSmoothness;

    u.uEdgeThreshold.value =
      WATER_FLOOR.edgeThreshold;

    u.uEdgeSoftness.value =
      WATER_FLOOR.edgeSoftness;

    u.uFlowX.value =
      WATER_FLOOR.flowX;

    u.uFlowZ.value =
      WATER_FLOOR.flowZ;

    u.uCellSpeed.value =
      WATER_FLOOR.cellSpeed;

    u.uNoiseScale.value =
      WATER_FLOOR.noiseScale;

    u.uNoiseFlowSpeed.value =
      WATER_FLOOR.noiseFlowSpeed;

    u.uDistortAmount.value =
      WATER_FLOOR.distortAmount;

    u.uDeepColor.value.set(
      WATER_FLOOR.deepColor
    );

    u.uMidColor.value.set(
      WATER_FLOOR.midColor
    );

    u.uMidPos.value =
      WATER_FLOOR.midPos;

    u.uHighlight.value.set(
      WATER_FLOOR.highlightColor
    );

    u.uOpacity.value =
      WATER_FLOOR.opacity;

    u.uDeepOpacity.value =
      deepOpacityOverride ??
      WATER_FLOOR.deepOpacity;

    u.uFadeDistance.value =
      WATER_FLOOR.fadeDistance;

    u.uFadeStrength.value =
      WATER_FLOOR.fadeStrength;

    u.uCamXZ.value.set(
      camera.position.x,
      camera.position.z
    );

    // ── Ripple sync ─────────────────────────────────────────────────────────
    const cfg = rippleStore.getConfig();

    u.uRippleSpeed.value =
      cfg.speed;

    u.uRippleWidth.value =
      cfg.width;

    u.uRippleStrength.value =
      cfg.strength;

    u.uRippleDecay.value =
      cfg.decay;

    u.uRippleRings.value =
      cfg.rings;

    u.uRippleSpacing.value =
      cfg.spacing;

    const ripples = rippleStore.get();

    u.uRippleCount.value =
      ripples.length;

    for (let i = 0; i < ripples.length; i++) {
      u.uRippleCenters.value[i].set(
        ripples[i].x,
        ripples[i].z
      );

      u.uRippleTimes.value[i] =
        ripples[i].t;
    }

    // ── Follow camera in XZ → infinite tiling ───────────────────────────────
    meshRef.current.position.x =
      camera.position.x;

    meshRef.current.position.z =
      camera.position.z;
  });

  return (
    <mesh
      ref={meshRef}
      rotation-x={-Math.PI / 2}
      position={[0, -0.1, 0]}
      frustumCulled={false}
      renderOrder={2}
    >
      <planeGeometry args={[600, 600]} />

      <primitive
        object={material}
        attach="material"
      />
    </mesh>
  );
}
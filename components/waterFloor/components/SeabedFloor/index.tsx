"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { VERT } from "./shaders/vertex";
import { FRAG } from "./shaders/fragment";
import { SEABED } from "./utils/controls";

// ─────────────────────────────────────────────────────────────────────────────
// SeabedFloor
// ─────────────────────────────────────────────────────────────────────────────

interface SeabedFloorProps {
  colorOverride?: string;
  colorTopOverride?: string;
  fadeDistanceOverride?: number;
  fadeStrengthOverride?: number;
}

export default function SeabedFloor({
  colorOverride,
  colorTopOverride,
  fadeDistanceOverride,
  fadeStrengthOverride,
}: SeabedFloorProps) {
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
            value: SEABED.seabedScale,
          },

          uCellSpeed: {
            value: SEABED.cellSpeed,
          },

          uFlowX: {
            value: SEABED.flowX,
          },

          uFlowZ: {
            value: SEABED.flowZ,
          },

          uEdgeThreshold: {
            value: SEABED.edgeThreshold,
          },

          uEdgeSoftness: {
            value: SEABED.edgeSoftness,
          },

          uDeepColor: {
            value: new THREE.Color(SEABED.deepColor),
          },

          uHighlight: {
            value: new THREE.Color(SEABED.highlightColor),
          },

          uFadeDistance: {
            value: SEABED.fadeDistance,
          },

          uFadeStrength: {
            value: SEABED.fadeStrength,
          },

          uCamXZ: {
            value: new THREE.Vector2(),
          },
        },
      }),
    []
  );

  useEffect(() => {
    return () => material.dispose();
  }, [material]);

  useFrame(({ camera }, delta) => {
    const u = material.uniforms;

    u.uTime.value += delta;

    u.uScale.value = SEABED.seabedScale;
    u.uCellSpeed.value = SEABED.cellSpeed;
    u.uFlowX.value = SEABED.flowX;
    u.uFlowZ.value = SEABED.flowZ;

    u.uEdgeThreshold.value = SEABED.edgeThreshold;
    u.uEdgeSoftness.value = SEABED.edgeSoftness;

    u.uDeepColor.value.set(
      colorOverride ?? SEABED.deepColor
    );

    u.uHighlight.value.set(
      colorTopOverride ?? SEABED.highlightColor
    );

    u.uFadeDistance.value =
      fadeDistanceOverride ?? SEABED.fadeDistance;

    u.uFadeStrength.value =
      fadeStrengthOverride ?? SEABED.fadeStrength;

    u.uCamXZ.value.set(
      camera.position.x,
      camera.position.z
    );

    // Follow camera
    meshRef.current.position.x = camera.position.x;
    meshRef.current.position.z = camera.position.z;
    meshRef.current.position.y = SEABED.seabedDepth;
  });

  return (
    <mesh
      ref={meshRef}
      rotation-x={-Math.PI / 2}
      position={[0, SEABED.seabedDepth, 0]}
      frustumCulled={false}
      renderOrder={0}
      receiveShadow
    >
      <planeGeometry args={[600, 600]} />

      <primitive
        object={material}
        attach="material"
      />
    </mesh>
  );
}
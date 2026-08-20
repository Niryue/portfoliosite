"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function ShadowCatcher() {
  const seabedRef = useRef<THREE.Mesh>(null!);

  const seabedDepth = -0.2;
  const opacity = 0.4;
  const enabled = true;

  useFrame(({ camera }) => {
    seabedRef.current.position.x = camera.position.x;
    seabedRef.current.position.z = camera.position.z;
  });

  if (!enabled) return null;

  return (
    <mesh
      ref={seabedRef}
      receiveShadow
      rotation-x={-Math.PI / 2}
      position={[0, seabedDepth, 0]}
      frustumCulled={false}
      renderOrder={0}
    >
      <planeGeometry args={[600, 600]} />
      <shadowMaterial transparent opacity={opacity} />
    </mesh>
  );
}
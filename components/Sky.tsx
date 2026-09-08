"use client";

import { Environment } from "@react-three/drei";
import { useThree, useFrame } from "@react-three/fiber";

export default function SkyBox() {
  const { scene } = useThree();

  const rotation = (2 * Math.PI) / 3;

  useFrame(() => {
    if (scene.environmentRotation.y !== rotation) {
      scene.environmentRotation.y = rotation;
    }

    if (scene.backgroundRotation.y !== rotation) {
      scene.backgroundRotation.y = rotation;
    }
  });

  return (
    <Environment
      files="/HDRI/AnimeSkyNight.hdr"
      background
    />
  );
}
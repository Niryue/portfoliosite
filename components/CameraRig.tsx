"use client";

import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// restricted camera movement based on mouse position
export default function CameraRig() {
  const { camera, pointer } = useThree();

  useFrame(() => {
    const intensity = 0.15;

    const targetX = pointer.x * intensity;
    const targetY = pointer.y * intensity;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.03);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.03);
    camera.position.z = 3;

    camera.lookAt(0, 0, 0);
  });

  return null;
}
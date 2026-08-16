"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

type CameraRigProps = {
  where?: [number, number, number];
};
// restricted camera movement based on mouse position
export default function CameraRig({ where }: CameraRigProps) {
  const { camera, pointer } = useThree();

  const initialPosition = useRef(camera.position.clone());

  useFrame(() => {
    const intensity = 0.15;

    const targetX = initialPosition.current.x + pointer.x * intensity;
    const targetY = initialPosition.current.y + pointer.y * intensity;

    camera.position.x = THREE.MathUtils.lerp(
      camera.position.x,
      targetX,
      0.03
    );

    camera.position.y = THREE.MathUtils.lerp(
      camera.position.y,
      targetY,
      0.03
    );

    camera.position.z = initialPosition.current.z;
    
    camera.lookAt(new THREE.Vector3(
        where[0],
        where[1],
        where[2]
      ));
  });

  return null;
}
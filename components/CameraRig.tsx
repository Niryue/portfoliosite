"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

type CameraRigProps = {
  position?: [number, number, number];
  where?: [number, number, number];
};

export default function CameraRig({
  position,
  where,
}: CameraRigProps) {
  const { camera, pointer } = useThree();

  const initialized = useRef(false);

  const target = useMemo(
    () => new THREE.Vector3(...where!),
    [where?.[0], where?.[1], where?.[2]]
  );

  const initialPosition = useMemo(
    () => new THREE.Vector3(...position!),
    [position?.[0], position?.[1], position?.[2]]
  );

  const targetPosition = useRef(new THREE.Vector3());

  // Only set the camera's starting position once
  useEffect(() => {
    if (initialized.current) return;

    camera.position.copy(initialPosition);
    camera.lookAt(target);

    initialized.current = true;
  }, [camera, initialPosition, target]);

  useFrame(() => {
    const intensity = 0.07;

    // Make the camera face the target first
    camera.lookAt(target);

    // Camera's local right direction
    const right = new THREE.Vector3()
      .setFromMatrixColumn(camera.matrixWorld, 0)
      .normalize();

    // Camera's local up direction
    const up = new THREE.Vector3()
      .setFromMatrixColumn(camera.matrixWorld, 1)
      .normalize();

    // Start from the original position
    targetPosition.current.copy(initialPosition);

    // Mouse left/right follows camera's right direction
    targetPosition.current.addScaledVector(
      right,
      pointer.x * intensity
    );

    // Mouse up/down follows camera's up direction
    targetPosition.current.addScaledVector(
      up,
      pointer.y * intensity
    );

    // Smooth movement
    camera.position.lerp(
      targetPosition.current,
      0.03
    );

    // Keep looking at target
    camera.lookAt(target);
  });

  return null;
}
"use client";

import { useEffect, useMemo, useRef } from "react";
import { Group } from "three";
import { useGLTF } from "@react-three/drei";
import { useWaterObject } from "./waterFloor/hooks/useWaterObject";
import * as THREE from "three";

interface SceneModelProps {
  position?: [number, number, number];
}

export default function SceneModel({
  position = [0, 0, 0],
}: SceneModelProps) {
  const group = useRef<Group>(null);

  const { scene, nodes } = useGLTF("/models/AboutEnvironmentWave.glb");
  
  const groupRef = useRef<THREE.Group>(null!);

  useWaterObject("Pillars", groupRef, [
  nodes.Cube050.geometry,
  nodes.Cube051.geometry,
]);

  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  return (
    <group
      ref={groupRef}
      position={position}
    >
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload("/models/AboutEnvironmentWave.glb");
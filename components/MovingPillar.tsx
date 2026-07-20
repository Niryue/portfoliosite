"use client";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useRef, useEffect, useMemo } from "react";
import * as THREE from "three";

type MovingPillarProps = {
  position: [number, number, number];
}; 

export default function MovingPillar({ position }: MovingPillarProps) {
  const { scene } = useGLTF("/models/pillar.glb");
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  useEffect(() => {
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        }
      });
    }, [clonedScene]);
  
  const ref = useRef();

  useFrame(() => {
    ref.current.position.z += 0.006;

    // Reset pillar when it goes past the camera
      if (ref.current.position.z > 5) {
        ref.current.position.z = -25;
      }
    });
   return (
    <primitive
      ref={ref}
      object={clonedScene}
      scale={[0.8, 1, 0.8]}
      position={position}
      rotation={[0, 0, 0]}
    />
  );
}
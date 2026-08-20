"use client";
import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";


type SceneFogProps = {
  color?: string;
  density?: number;
};
export default function SceneFog({ color, density }: SceneFogProps) {
  const { scene } = useThree();

  useEffect(() => {
    scene.fog = new THREE.FogExp2(color || "#e0ecff", density || 0.06);
  }, [scene, color, density]);

  return null;
}
"use client";
import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";


type SceneFogProps = {
  color?: string;
};
export default function SceneFog({ color }: SceneFogProps) {
  const { scene } = useThree();

  useEffect(() => {
    scene.fog = new THREE.FogExp2(color || "#e0ecff", 0.06);
  }, [scene, color]);

  return null;
}
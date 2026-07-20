"use client";
import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

export default function SceneFog() {
  const { scene } = useThree();

  useEffect(() => {
    scene.fog = new THREE.FogExp2("#e0ecff", 0.06);
  }, [scene]);

  return null;
}
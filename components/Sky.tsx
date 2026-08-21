import { Environment } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";

export default function SkyBox() {
  const { scene } = useThree();

  useEffect(() => {
    scene.environmentRotation.set(0, (2 * Math.PI )/ 3, 0);
    scene.backgroundRotation.set(0, (2 * Math.PI )/ 3, 0);
  }, [scene]);

  return (
    <Environment
      files="/HDRI/AnimeSkyNight.hdr"
      background
    />
  );
}
"use client";
import { useFrame, useThree } from "@react-three/fiber";
import {FlyControls} from "@react-three/drei";

// free cam
export default function Freecam() {
  const { camera, gl } = useThree();

  return (
    <FlyControls
      args={[camera, gl.domElement]}
      movementSpeed={5}
      rollSpeed={0.5}
    />
  );
}
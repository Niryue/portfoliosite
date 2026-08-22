"use client";

import { useEffect, useRef } from "react";
import { Group } from "three";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";

interface SceneModelProps {
  position?: [number, number, number];
}

export default function SceneModel({
  position
}: SceneModelProps) {
  const group = useRef<Group>(null);

  const { scene } = useGLTF("/models/GrassFieldPlanes.glb");

  return (
    <group ref={group} position={position}>
      <primitive object={scene}/>
    </group>
  );
}

useGLTF.preload("/models/GrassFieldPlanes.glb");
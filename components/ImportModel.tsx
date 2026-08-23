"use client";

import { useEffect, useRef } from "react";
import { Group } from "three";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";

interface SceneModelProps {
  position?: [number, number, number];
  path: string;
}

export default function SceneModel({
  position,
  path
}: SceneModelProps) {
  const group = useRef<Group>(null);

  const { scene } = useGLTF(path);

  return (
    <group ref={group} position={position}>
      <primitive object={scene}/>
    </group>
  );
}
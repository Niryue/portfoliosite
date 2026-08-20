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

  const { scene, animations } = useGLTF("/models/AboutEnvironment.glb");

  const { actions } = useAnimations(animations, group);

  useEffect(() => {
        scene.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
      }, [scene]);

  useEffect(() => {


    // Play every animation
    Object.values(actions).forEach((action) => {
      action?.reset().play();
    });

    // Stop them when the component is unmounted
    return () => {
      Object.values(actions).forEach((action) => {
        action?.stop();
      });
    };
  }, [actions, animations]);

  return (
    <group ref={group} position={position}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload("/models/AboutEnvironment.glb");
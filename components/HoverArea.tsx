"use client";

import { useGLTF } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTransition } from "@/components/WhiteTransition";

type HoverAreaProps = {
    modelPath: string;
    modelName: string;
    position: [number, number, number];
    scale: number;
    rotation: [number, number, number];
    setHovered: (value: string | null) => void;
};

export default function HoverArea({ modelPath, 
    modelName, 
    clickPath,
    position, 
    scale, 
    rotation, 
    setHovered } : HoverAreaProps) {
  const { scene } = useGLTF(modelPath);
  const router = useRouter();
  const { setWhiteAnim } = useTransition();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  function clickEventHandler(clickPath) {

    setTimeout(() => {
      router.push(clickPath);
    }, 2500); // Wait 2.5 seconds
  }

  useEffect(() => {
      audioRef.current = new Audio("/sounds/hover.mp3");
      audioRef.current.preload = "auto";
      audioRef.current.volume = 0.5;
    }, []);

  useEffect(() => {
      [scene].forEach((scene) => {
        scene.traverse((child) => {
          if (child.isMesh) {
            child.material.transparent = true;
            child.material.opacity = 0;
          }
        });
      });
    }, [scene]);

  return (
      <primitive
        object={scene}
        onClick={() => {
          setWhiteAnim(true);
          clickEventHandler(clickPath);
        }}
        onPointerOver={() => {setHovered(modelName);
                              const audio = audioRef.current;
                              if (audio) {
                              audio.currentTime = 0;
                              audio.play();
      };
        }}
        onPointerOut={() => setHovered(null)}
        position={position}
        scale={scale}
        rotation={rotation}
        rotation-order="ZYX"
      >
      </primitive>
  );
}

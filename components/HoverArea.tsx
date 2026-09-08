"use client";

import { useGLTF } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTransition } from "@/components/WhiteTransition";

type HoverAreaProps = {
  modelPath: string;
  modelName: string;
  clickPath: string;
  position: [number, number, number];
  scale: number;
  rotation: [number, number, number];
  setHovered: (value: string | null) => void;
};

export default function HoverArea({
  modelPath,
  modelName,
  clickPath,
  position,
  scale,
  rotation,
  setHovered,
}: HoverAreaProps) {
  const { scene } = useGLTF(modelPath);
  const router = useRouter();

  const { startTransition } = useTransition();

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ==========================================
  // CLICK
  // ==========================================

  const handleClick = () => {
    startTransition(() => {
      router.push(clickPath);
    });
  };

  // ==========================================
  // HOVER SOUND
  // ==========================================

  useEffect(() => {
    audioRef.current = new Audio("/sounds/hover.mp3");
    audioRef.current.preload = "auto";
    audioRef.current.volume = 0.5;
  }, []);

  // ==========================================
  // MAKE MODEL INVISIBLE
  // ==========================================

  useEffect(() => {
    scene.traverse((child: any) => {
      if (child.isMesh) {
        child.material.transparent = true;
        child.material.opacity = 0;
      }
    });
  }, [scene]);

  return (
    <primitive
      object={scene}

      // ========================================
      // CLICK
      // ========================================

      onClick={handleClick}

      // ========================================
      // HOVER
      // ========================================

      onPointerOver={() => {
        setHovered(modelName);

        const audio = audioRef.current;

        if (audio) {
          audio.currentTime = 0;

          audio.play().catch(() => {});
        }
      }}

      onPointerOut={() => {
        setHovered(null);
      }}

      position={position}
      scale={scale}
      rotation={rotation}
      rotation-order="ZYX"
    />
  );
}
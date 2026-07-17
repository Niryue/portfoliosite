"use client";
import { useFrame} from "@react-three/fiber";
import { useTexture} from "@react-three/drei";
import { useRef} from "react";

type TexturePlaneProps = {
  texturePath: string;
  position: [number, number, number];
  scale: number;
  opacity: number;
  phase: number;
  hovered: boolean;
};

export default function TexturePlane({ texturePath, position, scale, opacity, phase, hovered } : TexturePlaneProps) {
  const texture = useTexture(texturePath);
  const ref = useRef();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() % (Math.PI * 2);

  ref.current.position.y =
      position[1] + Math.sin(t * 2 + phase) * 0.03;
  });

  return (//make later a glow effect only appear when mouse hovers
    <mesh
      ref={ref}
      position={position}
      scale={scale}
    >
      <planeGeometry args={[1, 1]} />

      <meshBasicMaterial
        map={texture}
        transparent
        fog={false}
        color="white"
        opacity={hovered ? opacity : 0}
      />

    </mesh>
  );
}
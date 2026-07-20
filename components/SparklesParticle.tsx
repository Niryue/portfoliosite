import { Sparkles } from "@react-three/drei";

type SparklesParticleProps = {
  count: number;
  size: number;
  speed: number;
  opacity: number;
  color: string;
  scale: [number, number, number];
  position: [number, number, number];
};

export default function SparklesParticle({
  count,
  size,
  speed,
  opacity,
  color,
  scale,
  position
}: SparklesParticleProps) { //Sparkles particle
  return (
    <Sparkles
      count={count}
      size={size}
      speed={speed}
      opacity={opacity}
      color={color}
      scale={scale}
      position={position}
    />
  );
}
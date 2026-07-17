"use client";

import { useVideoTexture } from "@react-three/drei";
import { useEffect } from "react";

type VideoPlaneProps = {
  texturePath: string;
  position: [number, number, number];
  args: [number, number];
  playbackRate: number;
};

export default function VideoPlane({texturePath, position, args, playbackRate} : VideoPlaneProps) {
  const texture = useVideoTexture(texturePath);
  console.log(texture.image);
  useEffect(() => {
    const video = texture.image;

    if (video instanceof HTMLVideoElement) {
      video.playbackRate = playbackRate; // Half speed
    }
  }, [texture]);
  return (
    <mesh
      position={position}>
      <planeGeometry args={args} />
      <meshBasicMaterial map={texture} toneMapped={false} fog={false}/>
    </mesh>
  );
}
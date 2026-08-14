type FloorProps = {
  color?: string;
};

export default function Floor({ color }: FloorProps) {
  return (
    <mesh
      position={[0, -5, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
    >
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial 
      color={color || "#ffffff"}
      roughness={0.5}/>
    </mesh>
  );
}
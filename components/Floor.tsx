export default function Floor() {
  return (
    <mesh
      position={[0, -5, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
    >
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial 
      color="#ffffff"
      roughness={0.5}/>
    </mesh>
  );
}
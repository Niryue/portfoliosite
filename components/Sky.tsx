import { Environment } from "@react-three/drei";

export default function SkyBox() {
  return (
    <>
      <Environment
        files="/HDRI/AnimeSky.hdr"
        background
      />
    </>
  );
}
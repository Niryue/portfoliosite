import { useAnimations, useGLTF } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import { Group, LoopOnce } from "three";
import * as THREE from "three";

type KehanAboutProps = {
  position: [number, number, number];
};

export default function KehanAbout({ position }: KehanAboutProps) {
    const group = useRef<Group>(null);

    const { scene, animations } = useGLTF("/models/KehanAbout.glb");
    
    const { actions, mixer } = useAnimations(animations, group);
    const [dragging, setDragging] = useState(false);
    const lastX = useRef(0);


    //turns on shadows
    useEffect(() => {
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }, [scene]);
    //plays animations randomly
    useEffect(() => {
    const animationNames = ["Idle 1", "Idle 2"];

     function playRandomAnimation() {
      const randomName =
        animationNames[
          Math.floor(Math.random() * animationNames.length)
        ];


      // Stop all other animations
      Object.values(actions).forEach((action) => {
        action?.stop();
      });

      const action = actions[randomName];

      if (!action) return;

      // Play this animation only once
      action.reset();
      action.setLoop(LoopOnce, 1);
      action.clampWhenFinished = true;
      action.play();
    }

    playRandomAnimation();

    function handleFinished() {
      playRandomAnimation();
    }

    mixer.addEventListener("finished", handleFinished);

    return () => {
      mixer.removeEventListener("finished", handleFinished);
    };
    }, [actions, mixer]);
    //return + holding mouse while dragging spins the model
    return (
    <group ref={group} 
    position={position}
    rotation={[0, -4.8 * Math.PI / 8, 0]}
      onPointerDown={(e) => {
      e.stopPropagation();

      e.target.setPointerCapture(e.pointerId);

      setDragging(true);
      lastX.current = e.clientX;
      }}
      onPointerMove={(e) => {
        if (!dragging || !group.current) return;

        const deltaX = e.clientX - lastX.current;

        group.current.rotation.y += deltaX * 0.01;

        lastX.current = e.clientX;
      }}
      onPointerUp={(e) => {
        e.stopPropagation();

        e.target.releasePointerCapture(e.pointerId);

        setDragging(false);
      }}
      >
      <primitive object={scene}/>
    </group>
  );
}
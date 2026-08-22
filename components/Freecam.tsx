import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export default function Freecam() {
  const { camera } = useThree();

  const keys = useRef<Record<string, boolean>>({});

  // Current rotation
  const yaw = useRef(0);
  const pitch = useRef(0);

  // Prevent React re-renders from keyboard input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      keys.current[event.code] = true;
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      keys.current[event.code] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Initialize from the camera's current rotation
  useEffect(() => {
    yaw.current = camera.rotation.y;
    pitch.current = camera.rotation.x;
  }, [camera]);

  useFrame((_, delta) => {
    const key = keys.current;

    const moveSpeed = 4;
    const turnSpeed = 1.8;

    // --------------------------------
    // ROTATION
    // --------------------------------

    if (key["ArrowLeft"]) {
      yaw.current += turnSpeed * delta;
    }

    if (key["ArrowRight"]) {
      yaw.current -= turnSpeed * delta;
    }

    if (key["ArrowUp"]) {
      pitch.current += turnSpeed * delta;
    }

    if (key["ArrowDown"]) {
      pitch.current -= turnSpeed * delta;
    }

    // Prevent the camera from flipping upside down
    pitch.current = THREE.MathUtils.clamp(
      pitch.current,
      -Math.PI / 2 + 0.01,
      Math.PI / 2 - 0.01
    );

    camera.rotation.order = "YXZ";
    camera.rotation.y = yaw.current;
    camera.rotation.x = pitch.current;

    // --------------------------------
    // MOVEMENT
    // --------------------------------

    const direction = new THREE.Vector3();

    camera.getWorldDirection(direction);

    // Forward/backward
    // --------------------------------
    // MOVEMENT
    // --------------------------------

    const forward = new THREE.Vector3(
      -Math.sin(yaw.current),
      0,
      -Math.cos(yaw.current)
    ).normalize();

    const right = new THREE.Vector3(
      Math.cos(yaw.current),
      0,
      -Math.sin(yaw.current)
    ).normalize();

    // W / S
    if (key["KeyW"]) {
      camera.position.addScaledVector(forward, moveSpeed * delta);
    }

    if (key["KeyS"]) {
      camera.position.addScaledVector(forward, -moveSpeed * delta);
    }

    // A / D
    if (key["KeyD"]) {
      camera.position.addScaledVector(right, moveSpeed * delta);
    }

    if (key["KeyA"]) {
      camera.position.addScaledVector(right, -moveSpeed * delta);
    }

    if (key["KeyQ"]) {
      camera.position.y += moveSpeed * delta;
    }

    // Ctrl = down
    if (key["KeyE"] || key["ControlRight"]) {
      camera.position.y -= moveSpeed * delta;
    }
  });

  return null;
}
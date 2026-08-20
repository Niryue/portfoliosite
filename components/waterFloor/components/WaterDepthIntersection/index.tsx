"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { waterObjectsRegistry } from "../../stores/waterObjectsRegistry";
import { VERT } from "./shaders/vertex";
import { FRAG } from "./shaders/fragment";
import { INTERSECTION } from "./utils/controls";

// ─────────────────────────────────────────────────────────────────────────────
// WaterDepthIntersection
// ─────────────────────────────────────────────────────────────────────────────

export default function WaterDepthIntersection() {
  const { size, gl: glState } = useThree();
  const planeRef = useRef<THREE.Mesh>(null!);

  // ── Depth render target ───────────────────────────────────────────────────
  const depthRT = useMemo(() => {
    const dpr = glState.getPixelRatio();

    const w = Math.round(size.width * dpr);
    const h = Math.round(size.height * dpr);

    const rt = new THREE.WebGLRenderTarget(w, h);

    rt.depthTexture = new THREE.DepthTexture(w, h);
    rt.depthTexture.type = THREE.UnsignedShortType;

    return rt;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.width, size.height, glState]);

  useEffect(() => {
    return () => depthRT.dispose();
  }, [depthRT]);

  // ── Depth scene ───────────────────────────────────────────────────────────
  const depthScene = useMemo(
    () => new THREE.Scene(),
    []
  );

  const depthMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        side: THREE.FrontSide,
      }),
    []
  );

  const sceneGroups = useRef(
    new Map<string, THREE.Group>()
  );

  useEffect(() => {
    return () => depthMat.dispose();
  }, [depthMat]);

  // ── Intersection material ────────────────────────────────────────────────
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,

        vertexShader: VERT,
        fragmentShader: FRAG,

        uniforms: {
          uDepthTex: {
            value: null,
          },

          uResolution: {
            value: new THREE.Vector2(
              size.width,
              size.height
            ),
          },

          uNear: {
            value: 0.1,
          },

          uFar: {
            value: 1000,
          },

          uLineWidth: {
            value: INTERSECTION.lineWidth,
          },

          uGlowWidth: {
            value: INTERSECTION.glowWidth,
          },

          uLineColor: {
            value: new THREE.Color(
              INTERSECTION.lineColor
            ),
          },

          uLineOpacity: {
            value: INTERSECTION.lineOpacity,
          },

          uGlowColor: {
            value: new THREE.Color(
              INTERSECTION.glowColor
            ),
          },

          uGlowOpacity: {
            value: INTERSECTION.glowOpacity,
          },
        },
      }),

    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    return () => material.dispose();
  }, [material]);

  // ── Per-frame ─────────────────────────────────────────────────────────────
  useFrame(({ gl, camera, size: frameSize }) => {
    const objects = waterObjectsRegistry.getAll();

    // ── Sync registry → depth scene ────────────────────────────────────────
    for (const obj of objects) {
      if (!obj.ref.current) continue;

      if (!sceneGroups.current.has(obj.id)) {
        const group = new THREE.Group();

        obj.geometries.forEach((geo) => {
          group.add(
            new THREE.Mesh(
              geo,
              depthMat
            )
          );
        });

        depthScene.add(group);

        sceneGroups.current.set(
          obj.id,
          group
        );
      }

      const group =
        sceneGroups.current.get(obj.id)!;

      group.position.copy(
        obj.ref.current.position
      );

      group.rotation.copy(
        obj.ref.current.rotation
      );

      group.scale.copy(
        obj.ref.current.scale
      );
    }

    // ── Remove unregistered objects ─────────────────────────────────────────
    for (const [id, group] of sceneGroups.current) {
      if (!objects.find((o) => o.id === id)) {
        depthScene.remove(group);
        sceneGroups.current.delete(id);
      }
    }

    // ── Render depth ─────────────────────────────────────────────────────────
    if (INTERSECTION.enabled) {
      const prevRT = gl.getRenderTarget();
      const prevAutoClear = gl.autoClear;

      gl.autoClear = true;

      gl.setRenderTarget(depthRT);
      gl.render(depthScene, camera);

      gl.setRenderTarget(prevRT);
      gl.autoClear = prevAutoClear;
    }

    // ── Sync shader uniforms ────────────────────────────────────────────────
    const u = material.uniforms;

    u.uDepthTex.value =
      depthRT.depthTexture;

    const dpr = gl.getPixelRatio();

    u.uResolution.value.set(
      frameSize.width * dpr,
      frameSize.height * dpr
    );

    u.uNear.value = camera.near;
    u.uFar.value = camera.far;

    u.uLineWidth.value =
      INTERSECTION.lineWidth;

    u.uGlowWidth.value =
      INTERSECTION.glowWidth;

    u.uLineColor.value.set(
      INTERSECTION.lineColor
    );

    u.uLineOpacity.value =
      INTERSECTION.lineOpacity;

    u.uGlowColor.value.set(
      INTERSECTION.glowColor
    );

    u.uGlowOpacity.value =
      INTERSECTION.glowOpacity;
  });

  return (
    <mesh
      ref={planeRef}
      visible={INTERSECTION.enabled}
      rotation-x={-Math.PI / 2}
      position={[0, -0.095, 0]}
      renderOrder={5}
      frustumCulled={false}
    >
      <planeGeometry args={[600, 600]} />

      <primitive
        object={material}
        attach="material"
      />
    </mesh>
  );
}
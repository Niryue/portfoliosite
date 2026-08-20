"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import { waterObjectsRegistry } from "../../stores/waterObjectsRegistry";

import {
  INJ_VERT,
  INJ_FRAG,
} from "./shaders/injection";

import {
  WAVE_VERT,
  WAVE_FRAG,
} from "./shaders/wave";

import {
  DISP_VERT,
  DISP_FRAG,
} from "./shaders/display";

import { WAVE_SIMULATION } from "./utils/controls";

// ─────────────────────────────────────────────────────────────────────────────
// WaterWaveSimulation — Part 2 of the Dynamic-Paint–style wave system.
//
// THREE render passes per frame:
//
//  1. INJECTION PASS
//     Top-down orthographic render of registered geometry into a
//     WAVE_RES × WAVE_RES texture. Only geometry crossing the water surface
//     writes into the texture, giving the exact intersection shape.
//
//  2. WAVE UPDATE PASS  (ping-pong)
//     A fullscreen quad runs the 2-D wave equation each frame:
//       h_next = 2·h_cur − h_prev + speed · ∇²h
//     Absorbing boundaries prevent edge reflections.
//
//  3. DISPLAY PASS
//     A large plane at the water surface maps world XZ → simulation UV and
//     computes the gradient magnitude of the wave height map.
//     High gradient = ring edge → rendered as a bright additive overlay.
//
// HOW TO ADD A MODEL
//   Call useWaterObject(id, ref, geometries) in your model component.
//   This component will pick it up automatically — no changes needed here.
// ─────────────────────────────────────────────────────────────────────────────

const WAVE_RES = 512;
const TEXEL = 1.0 / WAVE_RES;

export default function WaterWaveSimulation() {
  const { gl } = useThree();

  const displayRef = useRef<THREE.Mesh>(null!);

  const pingIdx = useRef(0);
  const needsInit = useRef(true);
  const lastInjectTime = useRef(-Infinity);

  // Fixed-timestep accumulator — wave PDE runs at 60 Hz regardless of monitor
  const timeAccum = useRef(0);
  const FIXED_STEP = 1 / 60;

  // ── Injection Render Target ────────────────────────────────────────────────
  const injRT = useMemo(
    () =>
      new THREE.WebGLRenderTarget(
        WAVE_RES,
        WAVE_RES,
        {
          format: THREE.RGBAFormat,
          type: THREE.HalfFloatType,
          minFilter: THREE.LinearFilter,
          magFilter: THREE.LinearFilter,
        }
      ),
    []
  );

  // ── Injection orthographic camera ──────────────────────────────────────────
  // Top-down camera.
  // up = world -Z so the rendered texture has a consistent orientation.
  const injCamera = useMemo(() => {
    const cam = new THREE.OrthographicCamera(
      -10,
      10,
      10,
      -10,
      0.1,
      1000
    );

    cam.up.set(0, 0, -1);

    return cam;
  }, []);

  // ── Injection material ─────────────────────────────────────────────────────
  const injMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: INJ_VERT,
        fragmentShader: INJ_FRAG,

        side: THREE.DoubleSide,

        uniforms: {
          uWaterY: {
            value: -0.1,
          },

          uBandWidth: {
            value: WAVE_SIMULATION.bandWidth,
          },
        },
      }),
    []
  );

  // ── Injection scene ────────────────────────────────────────────────────────
  // Populated dynamically from waterObjectsRegistry.
  const injScene = useMemo(() => {
    const scene = new THREE.Scene();

    scene.background = new THREE.Color(0x000000);

    return scene;
  }, []);

  const injGroups = useRef(
    new Map<string, THREE.Group>()
  );

  // ── Ping-pong wave render targets ──────────────────────────────────────────
  const waveRTs = useMemo(
    () => [
      new THREE.WebGLRenderTarget(
        WAVE_RES,
        WAVE_RES,
        {
          format: THREE.RGBAFormat,
          type: THREE.HalfFloatType,
          minFilter: THREE.LinearFilter,
          magFilter: THREE.LinearFilter,
        }
      ),

      new THREE.WebGLRenderTarget(
        WAVE_RES,
        WAVE_RES,
        {
          format: THREE.RGBAFormat,
          type: THREE.HalfFloatType,
          minFilter: THREE.LinearFilter,
          magFilter: THREE.LinearFilter,
        }
      ),
    ],
    []
  );

  // ── Wave update material ──────────────────────────────────────────────────
  const waveUpdateMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        depthTest: false,
        depthWrite: false,

        vertexShader: WAVE_VERT,
        fragmentShader: WAVE_FRAG,

        uniforms: {
          uWaveTex: {
            value: null,
          },

          uInjection: {
            value: null,
          },

          uTexelSize: {
            value: TEXEL,
          },

          uResolution: {
            value: WAVE_RES,
          },

          uSpeed: {
            value: WAVE_SIMULATION.speed,
          },

          uDamping: {
            value: WAVE_SIMULATION.damping,
          },

          uInjectStr: {
            value: WAVE_SIMULATION.injectStr,
          },

          uInjectAmp: {
            value: WAVE_SIMULATION.injectAmp,
          },

          uBorderWidth: {
            value: WAVE_SIMULATION.borderWidth,
          },
        },
      }),
    []
  );

  // ── Wave update scene/camera ───────────────────────────────────────────────
  const { waveScene, waveCamera } = useMemo(() => {
    const scene = new THREE.Scene();

    scene.add(
      new THREE.Mesh(
        new THREE.PlaneGeometry(2, 2),
        waveUpdateMat
      )
    );

    return {
      waveScene: scene,

      waveCamera:
        new THREE.OrthographicCamera(
          -1,
          1,
          1,
          -1,
          0,
          1
        ),
    };
  }, [waveUpdateMat]);

  // ── Display material ───────────────────────────────────────────────────────
  const displayMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,

        depthWrite: false,

        blending:
          THREE.AdditiveBlending,

        vertexShader: DISP_VERT,
        fragmentShader: DISP_FRAG,

        uniforms: {
          uWaveTex: {
            value: null,
          },

          uCenter: {
            value: new THREE.Vector2(),
          },

          uWaveSize: {
            value: 20,
          },

          uTexelSize: {
            value: TEXEL,
          },

          uGradScale: {
            value: WAVE_SIMULATION.gradScale,
          },

          uRingThreshold: {
            value:
              WAVE_SIMULATION.ringThreshold,
          },

          uEdgeSharpness: {
            value:
              WAVE_SIMULATION.edgeSharpness,
          },

          uColor: {
            value: new THREE.Color(
              WAVE_SIMULATION.color
            ),
          },

          uOpacity: {
            value:
              WAVE_SIMULATION.opacity,
          },
        },
      }),
    []
  );

  // ── Cleanup ────────────────────────────────────────────────────────────────
  useEffect(
    () => () => {
      injRT.dispose();

      waveRTs.forEach((rt) =>
        rt.dispose()
      );

      injMat.dispose();
      waveUpdateMat.dispose();
      displayMat.dispose();
    },
    [
      injRT,
      waveRTs,
      injMat,
      waveUpdateMat,
      displayMat,
    ]
  );

  // ── Per-frame ──────────────────────────────────────────────────────────────
  useFrame(
    ({ gl, camera, clock }, delta) => {
      const elapsed =
        clock.getElapsedTime();

      // ─────────────────────────────────────────────────────────────────────
      // Sync injection scene from registry
      // ─────────────────────────────────────────────────────────────────────

      const objects =
        waterObjectsRegistry.getAll();

      for (const obj of objects) {
        if (!obj.ref.current) continue;

        if (
          !injGroups.current.has(
            obj.id
          )
        ) {
          const group =
            new THREE.Group();

          obj.geometries.forEach(
            (geo) => {
              group.add(
                new THREE.Mesh(
                  geo,
                  injMat
                )
              );
            }
          );

          injScene.add(group);

          injGroups.current.set(
            obj.id,
            group
          );
        }

        const group =
          injGroups.current.get(
            obj.id
          )!;

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

      // ─────────────────────────────────────────────────────────────────────
      // Remove groups for unregistered objects
      // ─────────────────────────────────────────────────────────────────────

      for (
        const [id, group]
        of injGroups.current
      ) {
        if (
          !objects.find(
            (o) => o.id === id
          )
        ) {
          injScene.remove(group);

          injGroups.current.delete(
            id
          );
        }
      }

      // ─────────────────────────────────────────────────────────────────────
      // Compute combined world-space bounds
      // of ALL active objects
      // ─────────────────────────────────────────────────────────────────────

      const active =
        objects.filter(
          (o) =>
            o.ref.current &&
            o.geometries.length > 0
        );

      let cx = 0;
      let cz = 0;

      // Default simulation size
      let waveSize = 2;

      if (active.length > 0) {
        const worldBox =
          new THREE.Box3();

        for (const obj of active) {
          const ref =
            obj.ref.current!;

          // Make sure the object's
          // world matrix is current.
          ref.updateWorldMatrix(
            true,
            false
          );

          for (
            const geometry
            of obj.geometries
          ) {
            if (
              !geometry.boundingBox
            ) {
              geometry.computeBoundingBox();
            }

            // LOCAL bounding box
            const geoBox =
              geometry.boundingBox!.clone();

            // Convert to WORLD SPACE
            geoBox.applyMatrix4(
              ref.matrixWorld
            );

            // Add to combined bounds
            worldBox.union(geoBox);
          }
        }

        // ─────────────────────────────────────────────────────────────────
        // Center of ALL objects
        // ─────────────────────────────────────────────────────────────────

        const center =
          new THREE.Vector3();

        worldBox.getCenter(center);

        cx = center.x;
        cz = center.z;

        // ─────────────────────────────────────────────────────────────────
        // Total dimensions containing ALL objects
        // ─────────────────────────────────────────────────────────────────

        const size =
          new THREE.Vector3();

        worldBox.getSize(size);

        // We need the largest horizontal dimension
        // because the injection camera is square.

        const largestDimension =
          Math.max(
            size.x,
            size.z
          );

        // Orthographic camera uses HALF
        // the total width/height.

        waveSize =
          (largestDimension / 2) *
          WAVE_SIMULATION.waveSizeMul;

        // Prevent extremely tiny regions
        waveSize =
          Math.max(
            waveSize,
            2
          );
      }

      const prevRT =
        gl.getRenderTarget();

      const prevAC =
        gl.autoClear;

      gl.autoClear = true;

      // ─────────────────────────────────────────────────────────────────────
      // 0. One-time initialization
      // ─────────────────────────────────────────────────────────────────────

      if (needsInit.current) {
        const prevCC =
          gl.getClearColor(
            new THREE.Color()
          );

        const prevCA =
          gl.getClearAlpha();

        gl.setClearColor(
          0x000000,
          0
        );

        waveRTs.forEach(
          (rt) => {
            gl.setRenderTarget(rt);

            gl.clear(
              true,
              false,
              false
            );
          }
        );

        gl.setClearColor(
          prevCC,
          prevCA
        );

        needsInit.current = false;
      }

      // ─────────────────────────────────────────────────────────────────────
      // Wave simulation
      // ─────────────────────────────────────────────────────────────────────

      if (
        WAVE_SIMULATION.enabled
      ) {
        timeAccum.current +=
          delta;

        const shouldStep =
          timeAccum.current >=
          FIXED_STEP;

        if (shouldStep) {
          timeAccum.current -=
            FIXED_STEP;
        }

        // ─────────────────────────────────────────────────────────────────
        // 1. INJECTION
        // ─────────────────────────────────────────────────────────────────

        const shouldInject =
          shouldStep &&
          (
            elapsed -
              lastInjectTime.current
          ) >=
            WAVE_SIMULATION.injectInterval;

        if (shouldInject) {
          injMat.uniforms
            .uBandWidth.value =
            WAVE_SIMULATION.bandWidth;

          // ───────────────────────────────────────────────────────────────
          // Set injection camera to contain ALL objects
          // ───────────────────────────────────────────────────────────────

          injCamera.left =
            -waveSize;

          injCamera.right =
            waveSize;

          injCamera.top =
            waveSize;

          injCamera.bottom =
            -waveSize;

          injCamera.updateProjectionMatrix();

          // Camera is directly above the
          // combined center.

          injCamera.position.set(
            cx,
            100,
            cz
          );

          injCamera.lookAt(
            cx,
            0,
            cz
          );

          gl.setRenderTarget(
            injRT
          );

          gl.render(
            injScene,
            injCamera
          );

          lastInjectTime.current =
            elapsed;
        }

        // ─────────────────────────────────────────────────────────────────
        // 2. WAVE UPDATE
        // ─────────────────────────────────────────────────────────────────

        if (shouldStep) {
          const readRT =
            waveRTs[
              pingIdx.current
            ];

          const writeRT =
            waveRTs[
              1 -
                pingIdx.current
            ];

          waveUpdateMat
            .uniforms
            .uWaveTex.value =
            readRT.texture;

          waveUpdateMat
            .uniforms
            .uInjection.value =
            injRT.texture;

          waveUpdateMat
            .uniforms
            .uSpeed.value =
            WAVE_SIMULATION.speed;

          waveUpdateMat
            .uniforms
            .uDamping.value =
            WAVE_SIMULATION.damping;

          waveUpdateMat
            .uniforms
            .uBorderWidth.value =
            WAVE_SIMULATION.borderWidth;

          waveUpdateMat
            .uniforms
            .uInjectAmp.value =
            WAVE_SIMULATION.injectAmp;

          waveUpdateMat
            .uniforms
            .uInjectStr.value =
            shouldInject
              ? WAVE_SIMULATION.injectStr
              : 0.0;

          gl.setRenderTarget(
            writeRT
          );

          gl.render(
            waveScene,
            waveCamera
          );

          pingIdx.current =
            1 -
            pingIdx.current;
        }
      }

      // Restore render target
      gl.setRenderTarget(
        prevRT
      );

      gl.autoClear =
        prevAC;

      // ─────────────────────────────────────────────────────────────────────
      // 3. DISPLAY
      // ─────────────────────────────────────────────────────────────────────

      const u =
        displayMat.uniforms;

      u.uWaveTex.value =
        waveRTs[
          pingIdx.current
        ].texture;

      u.uCenter.value.set(
        cx,
        cz
      );

      u.uWaveSize.value =
        waveSize;

      u.uGradScale.value =
        WAVE_SIMULATION.gradScale;

      u.uRingThreshold.value =
        WAVE_SIMULATION.ringThreshold;

      u.uEdgeSharpness.value =
        WAVE_SIMULATION.edgeSharpness;

      u.uColor.value.set(
        WAVE_SIMULATION.color
      );

      u.uOpacity.value =
        WAVE_SIMULATION.opacity;

      // Keep display centered on camera
      if (
        displayRef.current
      ) {
        displayRef.current.position.x =
          camera.position.x;

        displayRef.current.position.z =
          camera.position.z;
      }
    }
  );

  return (
    <mesh
      ref={displayRef}
      visible={
        WAVE_SIMULATION.enabled
      }
      rotation-x={
        -Math.PI / 2
      }
      position={[
        0,
        -0.092,
        0,
      ]}
      renderOrder={6}
      frustumCulled={false}
    >
      <planeGeometry
        args={[
          600,
          600,
        ]}
      />

      <primitive
        object={displayMat}
        attach="material"
      />
    </mesh>
  );
}
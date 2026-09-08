"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useRef,
} from "react";

type TransitionContextType = {
  whiteAnim: boolean;
  setWhiteAnim: (value: boolean) => void;

  // Called directly by the user's click
  startTransition: (onMidpoint?: () => void) => void;
};

const TransitionContext =
  createContext<TransitionContextType | null>(null);

export function TransitionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [whiteAnim, setWhiteAnim] = useState(false);

  const TransitionRef = useRef<HTMLVideoElement | null>(null);
  const LoadingRef = useRef<HTMLVideoElement | null>(null);

  // Prevent multiple button clicks
  const transitioningRef = useRef(false);

  // Prevent initial animation from starting twice
  const initialLoadDoneRef = useRef(false);

  // ==========================================
  // NORMAL BUTTON TRANSITION
  // ==========================================

  const startTransition = (onMidpoint?: () => void) => {
    const Transition = TransitionRef.current;
    const Loading = LoadingRef.current;

    if (!Transition || !Loading) {
      console.warn("Transition videos are not ready.");
      return;
    }

    // Prevent double clicks
    if (transitioningRef.current) {
      return;
    }

    transitioningRef.current = true;

    // ========================================
    // SHOW OVERLAY
    // ========================================

    setWhiteAnim(true);

    // ========================================
    // RESET VIDEOS
    // ========================================

    Transition.pause();
    Loading.pause();

    Transition.currentTime = 0;
    Loading.currentTime = 0;

    let navigated = false;

    let animationFrameId: number | null = null;

    // ========================================
    // WATCH ACTUAL VIDEO TIME
    //
    // We don't use setTimeout here.
    //
    // Navigation happens when the actual
    // video reaches 2.2 seconds.
    // ========================================

    const checkMidpoint = () => {
      if (navigated) {
        return;
      }

      if (Transition.currentTime >= 2.2) {
        navigated = true;

        if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId);
        }

        // ====================================
        // VIDEO IS NOW AT THE WHITE FRAME
        //
        // Navigate to the new page.
        //
        // The transition video continues
        // playing from 2.2 -> 4.4 seconds.
        // ====================================

        onMidpoint?.();

        return;
      }

      animationFrameId =
        requestAnimationFrame(checkMidpoint);
    };

    // ========================================
    // WHEN VIDEO FINISHES
    //
    // 4.4 seconds
    // ========================================

    const handleEnded = () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }

      Transition.removeEventListener(
        "ended",
        handleEnded
      );

      // Stop both videos
      Transition.pause();
      Loading.pause();

      // Reset them
      Transition.currentTime = 0;
      Loading.currentTime = 0;

      // Hide overlay
      setWhiteAnim(false);

      transitioningRef.current = false;
    };

    Transition.addEventListener(
      "ended",
      handleEnded
    );

    // ========================================
    // START MONITORING
    // ========================================

    animationFrameId =
      requestAnimationFrame(checkMidpoint);

    // ========================================
    // START BOTH VIDEOS
    //
    // VERY IMPORTANT:
    //
    // These play() calls happen directly
    // inside the click -> startTransition()
    // chain.
    // ========================================

    Transition.play().catch((error) => {
      console.warn(
        "Transition video playback was blocked:",
        error
      );

      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }

      Transition.removeEventListener(
        "ended",
        handleEnded
      );

      transitioningRef.current = false;
      setWhiteAnim(false);
    });

    Loading.play().catch((error) => {
      console.warn(
        "Loading video playback was blocked:",
        error
      );
    });
  };

  // ==========================================
  // INITIAL PAGE LOAD
  // ==========================================

  useEffect(() => {
    const Transition = TransitionRef.current;
    const Loading = LoadingRef.current;

    if (!Transition || !Loading) {
      return;
    }

    // Prevent duplicate initialization
    if (initialLoadDoneRef.current) {
      return;
    }

    initialLoadDoneRef.current = true;

    const startInitialAnimation = () => {
      // ======================================
      // START AT 2.2
      //
      // This is the beginning of the
      // baked-in reversal.
      // ======================================

      Transition.currentTime = 2.2;

      Loading.currentTime = 0;

      // ======================================
      // MAKE SURE OVERLAY IS VISIBLE
      // ======================================

      setWhiteAnim(true);

      // ======================================
      // WHEN MAIN VIDEO REACHES 4.4
      // ======================================

      const handleInitialEnded = () => {
        Transition.removeEventListener(
          "ended",
          handleInitialEnded
        );

        // Stop both
        Transition.pause();
        Loading.pause();

        // Reset
        Transition.currentTime = 0;
        Loading.currentTime = 0;

        // Hide
        setWhiteAnim(false);
      };

      Transition.addEventListener(
        "ended",
        handleInitialEnded
      );

      // ======================================
      // PLAY LOADING EFFECT
      // ======================================
console.log("INITIAL Transition src:", Transition.currentSrc);
console.log("INITIAL Transition readyState:", Transition.readyState);
console.log("INITIAL Loading src:", Loading.currentSrc);
console.log("INITIAL Loading readyState:", Loading.readyState);

      Loading.play().catch((error) => {
        console.warn(
          "Initial Loading video playback was blocked:",
          error
        );
      });

      // ======================================
      // PLAY MAIN VIDEO
      // ======================================

      Transition.play().catch((error) => {
        console.warn(
          "Initial Transition video playback was blocked:",
          error
        );
      });
    };

    // ========================================
    // WAIT FOR VIDEO METADATA
    // ========================================

    if (Transition.readyState >= 1) {
      startInitialAnimation();
    } else {
      Transition.addEventListener(
        "loadedmetadata",
        startInitialAnimation,
        { once: true }
      );
    }

    return () => {
      Transition.removeEventListener(
        "loadedmetadata",
        startInitialAnimation
      );
    };
  }, []);

  // ==========================================
  // CONTEXT
  // ==========================================

  return (
    <TransitionContext.Provider
      value={{
        whiteAnim,
        setWhiteAnim,
        startTransition,
      }}
    >
      {children}

      <TransitionOverlay
        whiteAnim={whiteAnim}
        TransitionRef={TransitionRef}
        LoadingRef={LoadingRef}
      />
    </TransitionContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useTransition() {
  const context = useContext(TransitionContext);

  if (!context) {
    throw new Error(
      "useTransition must be used inside TransitionProvider"
    );
  }

  return context;
}

// ============================================
// OVERLAY
// ============================================

function TransitionOverlay({
  whiteAnim,
  TransitionRef,
  LoadingRef,
}: {
  whiteAnim: boolean;
  TransitionRef: React.RefObject<HTMLVideoElement | null>;
  LoadingRef: React.RefObject<HTMLVideoElement | null>;
}) {
  return (
    <div
      style={{
        position: "fixed",

        inset: 0,

        width: "100vw",
        height: "100vh",

        zIndex: 999,

        pointerEvents: "none",

        background: "transparent",

        overflow: "hidden",

        // ======================================
        // DON'T UNMOUNT THE VIDEOS
        // ======================================

        visibility: whiteAnim
          ? "visible"
          : "hidden",
      }}
    >
      {/* =====================================
          MAIN TRANSITION VIDEO

          1960 × 1080
          4.4 seconds

          0.0 → 2.2 = forward
          2.2 → 4.4 = reversal
          ===================================== */}

      <video
        ref={TransitionRef}
        src="/videos/Transition.webm"
        muted
        playsInline
        preload="auto"
        style={{
          position: "absolute",

          inset: 0,

          width: "100%",
          height: "100%",

          objectFit: "cover",

          zIndex: 1,

          background: "transparent",
        }}
      />

      {/* =====================================
          LOADING EFFECT

          512 × 512
          CENTER
          ===================================== */}

      <video
        ref={LoadingRef}
        src="/videos/Loading.webm"
        muted
        playsInline
        loop
        preload="auto"
        style={{
          position: "absolute",

          left: "50%",
          top: "50%",

          transform:
            "translate(-50%, -50%)",

          width: "256px",
          height: "256px",

          objectFit: "contain",

          zIndex: 2,

          background: "transparent",
        }}
      />
    </div>
  );
}
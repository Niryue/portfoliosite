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
};

const TransitionContext = createContext<TransitionContextType | null>(null);


export function TransitionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [whiteAnim, setWhiteAnim] = useState(false);

  return (
    <TransitionContext.Provider
      value={{
        whiteAnim,
        setWhiteAnim,
      }}
    >
      {children}
      <WhiteOverlay />
    </TransitionContext.Provider>
  );
}


export function useTransition() {
  const context = useContext(TransitionContext);

  if (!context) {
    throw new Error(
      "useTransition must be used inside TransitionProvider"
    );
  }

  return context;
}


function WhiteOverlay() {

const { whiteAnim, setWhiteAnim } = useTransition();

  const [opacity, setOpacity] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
      audioRef.current = new Audio("/sounds/ethereal.mp3");
      audioRef.current.preload = "auto";
      audioRef.current.volume = 0.1;
    }, []);

  useEffect(() => {
    const audio = audioRef.current;

    if (whiteAnim) {
      if (audio) {
      audio.currentTime = 0;
      audio.play();
    }
      // start fade in
      setFadeOut(false);
      setOpacity(1);

      // wait until fully white
      setTimeout(() => {
        setWhiteAnim(false);

        // start fade out
        setFadeOut(true);
        setOpacity(0);

      }, 2500);
    }

  }, [whiteAnim]);


  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "white",
        zIndex: 999,
        pointerEvents: "none",

        opacity: opacity,

        transition: fadeOut
          ? "opacity 2.5s ease-in-out"
          : "opacity 2.5s ease-in-out",
      }}
    />
  );
}
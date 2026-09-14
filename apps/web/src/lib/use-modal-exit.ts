"use client";

import { useCallback, useLayoutEffect, useRef, useState, type TransitionEvent } from "react";

const EXIT_FALLBACK_MS = 520;

function reducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useModalExit(onGone: () => void) {
  const [inView, setInView] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const gone = useRef(onGone);
  gone.current = onGone;
  const done = useRef(false);

  useLayoutEffect(() => {
    if (reducedMotion()) {
      setInView(true);
      return;
    }
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setInView(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, []);

  const finish = useCallback(() => {
    if (done.current) return;
    done.current = true;
    gone.current();
  }, []);

  const close = useCallback(() => {
    if (done.current || leaving) return;
    if (reducedMotion()) {
      finish();
      return;
    }
    setLeaving(true);
    setInView(false);
    window.setTimeout(finish, EXIT_FALLBACK_MS);
  }, [leaving, finish]);

  const onExitEnd = useCallback(
    (e: TransitionEvent<HTMLElement>) => {
      if (!leaving) return;
      if (e.target !== e.currentTarget) return;
      if (e.propertyName !== "transform") return;
      finish();
    },
    [leaving, finish],
  );

  return { inView, leaving, close, onExitEnd };
}

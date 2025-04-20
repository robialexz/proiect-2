/**
 * Hook pentru controlul animațiilor
 * Acest fișier conține un hook pentru controlul animațiilor
 */

import { useEffect } from 'react';
import { useAnimation, AnimationControls } from 'framer-motion';

/**
 * Hook pentru controlul animațiilor
 * @param isVisible Dacă elementul este vizibil
 * @param variants Variantele de animație
 * @param options Opțiunile pentru animație
 * @returns Controalele pentru animație
 */
export function useAnimationControls(
  isVisible: boolean,
  options: {
    initial?: string;
    animate?: string;
    exit?: string;
    delay?: number;
    duration?: number;
    repeat?: number | boolean;
    repeatType?: 'loop' | 'reverse' | 'mirror';
    repeatDelay?: number;
  } = {}
): AnimationControls {
  // Opțiunile implicite
  const {
    initial = 'hidden',
    animate = 'visible',
    exit = 'exit',
    delay = 0,
    duration = 0.3,
    repeat = 0,
    repeatType = 'loop',
    repeatDelay = 0,
  } = options;
  
  // Creăm controalele pentru animație
  const controls = useAnimation();
  
  // Efect pentru a controla animația
  useEffect(() => {
    if (isVisible) {
      controls.start(animate, {
        delay,
        duration,
        repeat,
        repeatType,
        repeatDelay,
      });
    } else {
      controls.start(exit, {
        duration,
      });
    }
  }, [isVisible, controls, animate, exit, delay, duration, repeat, repeatType, repeatDelay]);
  
  return controls;
}

/**
 * Hook pentru animația de intrare
 * @param isVisible Dacă elementul este vizibil
 * @param options Opțiunile pentru animație
 * @returns Controalele pentru animație
 */
export function useEntranceAnimation(
  isVisible: boolean = true,
  options: {
    delay?: number;
    duration?: number;
  } = {}
): AnimationControls {
  return useAnimationControls(isVisible, {
    initial: 'hidden',
    animate: 'visible',
    exit: 'exit',
    ...options,
  });
}

/**
 * Hook pentru animația de ieșire
 * @param isVisible Dacă elementul este vizibil
 * @param options Opțiunile pentru animație
 * @returns Controalele pentru animație
 */
export function useExitAnimation(
  isVisible: boolean = true,
  options: {
    delay?: number;
    duration?: number;
  } = {}
): AnimationControls {
  return useAnimationControls(isVisible, {
    initial: 'visible',
    animate: 'exit',
    exit: 'hidden',
    ...options,
  });
}

/**
 * Hook pentru animația de loop
 * @param isVisible Dacă elementul este vizibil
 * @param options Opțiunile pentru animație
 * @returns Controalele pentru animație
 */
export function useLoopAnimation(
  isVisible: boolean = true,
  options: {
    delay?: number;
    duration?: number;
    repeatDelay?: number;
  } = {}
): AnimationControls {
  return useAnimationControls(isVisible, {
    initial: 'hidden',
    animate: 'visible',
    exit: 'exit',
    repeat: Infinity,
    repeatType: 'loop',
    ...options,
  });
}

/**
 * Hook pentru animația de pulsație
 * @param isVisible Dacă elementul este vizibil
 * @param options Opțiunile pentru animație
 * @returns Controalele pentru animație
 */
export function usePulseAnimation(
  isVisible: boolean = true,
  options: {
    delay?: number;
    duration?: number;
    repeatDelay?: number;
  } = {}
): AnimationControls {
  return useAnimationControls(isVisible, {
    initial: 'hidden',
    animate: 'visible',
    exit: 'exit',
    repeat: Infinity,
    repeatType: 'reverse',
    ...options,
  });
}

/**
 * Hook pentru animația de bounce
 * @param isVisible Dacă elementul este vizibil
 * @param options Opțiunile pentru animație
 * @returns Controalele pentru animație
 */
export function useBounceAnimation(
  isVisible: boolean = true,
  options: {
    delay?: number;
    duration?: number;
    repeatDelay?: number;
  } = {}
): AnimationControls {
  return useAnimationControls(isVisible, {
    initial: 'hidden',
    animate: 'visible',
    exit: 'exit',
    repeat: Infinity,
    repeatType: 'reverse',
    ...options,
  });
}

/**
 * Hook pentru animația de shake
 * @param isVisible Dacă elementul este vizibil
 * @param options Opțiunile pentru animație
 * @returns Controalele pentru animație
 */
export function useShakeAnimation(
  isVisible: boolean = true,
  options: {
    delay?: number;
    duration?: number;
    repeatDelay?: number;
  } = {}
): AnimationControls {
  return useAnimationControls(isVisible, {
    initial: 'hidden',
    animate: 'visible',
    exit: 'exit',
    ...options,
  });
}

/**
 * Hook pentru animația de tada
 * @param isVisible Dacă elementul este vizibil
 * @param options Opțiunile pentru animație
 * @returns Controalele pentru animație
 */
export function useTadaAnimation(
  isVisible: boolean = true,
  options: {
    delay?: number;
    duration?: number;
    repeatDelay?: number;
  } = {}
): AnimationControls {
  return useAnimationControls(isVisible, {
    initial: 'hidden',
    animate: 'visible',
    exit: 'exit',
    ...options,
  });
}

/**
 * Hook pentru animația de jello
 * @param isVisible Dacă elementul este vizibil
 * @param options Opțiunile pentru animație
 * @returns Controalele pentru animație
 */
export function useJelloAnimation(
  isVisible: boolean = true,
  options: {
    delay?: number;
    duration?: number;
    repeatDelay?: number;
  } = {}
): AnimationControls {
  return useAnimationControls(isVisible, {
    initial: 'hidden',
    animate: 'visible',
    exit: 'exit',
    ...options,
  });
}

/**
 * Hook pentru animația de heartbeat
 * @param isVisible Dacă elementul este vizibil
 * @param options Opțiunile pentru animație
 * @returns Controalele pentru animație
 */
export function useHeartbeatAnimation(
  isVisible: boolean = true,
  options: {
    delay?: number;
    duration?: number;
    repeatDelay?: number;
  } = {}
): AnimationControls {
  return useAnimationControls(isVisible, {
    initial: 'hidden',
    animate: 'visible',
    exit: 'exit',
    repeat: Infinity,
    repeatType: 'loop',
    ...options,
  });
}

export default {
  useAnimationControls,
  useEntranceAnimation,
  useExitAnimation,
  useLoopAnimation,
  usePulseAnimation,
  useBounceAnimation,
  useShakeAnimation,
  useTadaAnimation,
  useJelloAnimation,
  useHeartbeatAnimation,
};

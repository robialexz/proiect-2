/**
 * Shim pentru useLayoutEffect pentru a evita avertismentele în SSR și a rezolva problemele de compatibilitate
 * Acest shim va folosi useEffect în mediul SSR și useLayoutEffect în browser
 */

import { useLayoutEffect, useEffect } from 'react';

// Folosim useEffect în SSR și useLayoutEffect în browser
export const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default useIsomorphicLayoutEffect;

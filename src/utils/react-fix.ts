/**
 * Acest fișier conține soluții pentru probleme comune cu React
 * Importă acest fișier în main.tsx pentru a aplica soluțiile
 */

// Asigurăm că React este disponibil global
import React from 'react';

// Asigurăm că useLayoutEffect este disponibil
if (typeof window !== 'undefined' && window.React === undefined) {
  (window as any).React = React;
}

// Exportăm React pentru a fi siguri că este disponibil
export default React;

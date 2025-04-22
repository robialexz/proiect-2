/**
 * Variante de animații pentru aplicație
 * Acest fișier conține variantele de animații pentru diferite componente
 */

import { Variants } from 'framer-motion';

// Variante pentru animația de fade
export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

// Variante pentru animația de slide
export const slideVariants: Variants = {
  hidden: { x: -100, opacity: 0 },
  visible: { x: 0, opacity: 1 },
  exit: { x: 100, opacity: 0 },
};

// Variante pentru animația de slide din dreapta
export const slideRightVariants: Variants = {
  hidden: { x: 100, opacity: 0 },
  visible: { x: 0, opacity: 1 },
  exit: { x: -100, opacity: 0 },
};

// Variante pentru animația de slide din jos
export const slideUpVariants: Variants = {
  hidden: { y: 100, opacity: 0 },
  visible: { y: 0, opacity: 1 },
  exit: { y: 100, opacity: 0 },
};

// Variante pentru animația de slide din sus
export const slideDownVariants: Variants = {
  hidden: { y: -100, opacity: 0 },
  visible: { y: 0, opacity: 1 },
  exit: { y: -100, opacity: 0 },
};

// Variante pentru animația de scale
export const scaleVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { scale: 1, opacity: 1 },
  exit: { scale: 0, opacity: 0 },
};

// Variante pentru animația de rotație
export const rotateVariants: Variants = {
  hidden: { rotate: -180, opacity: 0 },
  visible: { rotate: 0, opacity: 1 },
  exit: { rotate: 180, opacity: 0 },
};

// Variante pentru animația de flip
export const flipVariants: Variants = {
  hidden: { rotateY: -90, opacity: 0 },
  visible: { rotateY: 0, opacity: 1 },
  exit: { rotateY: 90, opacity: 0 },
};

// Variante pentru animația de card
export const cardVariants: Variants = {
  hidden: { y: 20, opacity: 0, scale: 0.95 },
  visible: { y: 0, opacity: 1, scale: 1 },
  exit: { y: 20, opacity: 0, scale: 0.95 },
  hover: { y: -5, scale: 1.02, transition: { duration: 0.2 } },
  tap: { scale: 0.98, transition: { duration: 0.1 } },
};

// Variante pentru animația de list item
export const listItemVariants: Variants = {
  hidden: { x: -20, opacity: 0 },
  visible: (custom) => ({
    x: 0,
    opacity: 1,
    transition: { delay: custom * 0.1 },
  }),
  exit: { x: 20, opacity: 0 },
  hover: { x: 5, transition: { duration: 0.2 } },
  tap: { scale: 0.98, transition: { duration: 0.1 } },
};

// Variante pentru animația de modal
export const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.8, y: 20 },
};

// Variante pentru animația de overlay
export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

// Variante pentru animația de drawer
export const drawerVariants: Variants = {
  hidden: { x: '-100%' },
  visible: { x: 0 },
  exit: { x: '-100%' },
};

// Variante pentru animația de drawer din dreapta
export const drawerRightVariants: Variants = {
  hidden: { x: '100%' },
  visible: { x: 0 },
  exit: { x: '100%' },
};

// Variante pentru animația de drawer din jos
export const drawerBottomVariants: Variants = {
  hidden: { y: '100%' },
  visible: { y: 0 },
  exit: { y: '100%' },
};

// Variante pentru animația de drawer din sus
export const drawerTopVariants: Variants = {
  hidden: { y: '-100%' },
  visible: { y: 0 },
  exit: { y: '-100%' },
};

// Variante pentru animația de toast
export const toastVariants: Variants = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 20, scale: 0.9 },
};

// Variante pentru animația de tooltip
export const tooltipVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
};

// Variante pentru animația de dropdown
export const dropdownVariants: Variants = {
  hidden: { opacity: 0, y: -10, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.95 },
};

// Variante pentru animația de popover
export const popoverVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
};

// Variante pentru animația de collapse
export const collapseVariants: Variants = {
  hidden: { height: 0, opacity: 0 },
  visible: { height: 'auto', opacity: 1 },
  exit: { height: 0, opacity: 0 },
};

// Variante pentru animația de accordion
export const accordionVariants: Variants = {
  hidden: { height: 0, opacity: 0 },
  visible: { height: 'auto', opacity: 1 },
  exit: { height: 0, opacity: 0 },
};

// Variante pentru animația de tab
export const tabVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

// Variante pentru animația de page
export const pageVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

// Variante pentru animația de welcome
export const welcomeVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8, y: 50 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { 
      duration: 0.8, 
      ease: 'easeOut',
      delay: 0.2,
    } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.8, 
    y: 50,
    transition: { 
      duration: 0.5, 
      ease: 'easeIn' 
    } 
  },
};

// Variante pentru animația de logo
export const logoVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8, rotate: -10 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    rotate: 0,
    transition: { 
      duration: 0.8, 
      ease: 'easeOut',
      delay: 0.1,
    } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.8, 
    rotate: 10,
    transition: { 
      duration: 0.5, 
      ease: 'easeIn' 
    } 
  },
  hover: { 
    scale: 1.05, 
    rotate: 5,
    transition: { 
      duration: 0.3, 
      ease: 'easeOut' 
    } 
  },
};

// Variante pentru animația de button
export const buttonVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  hover: { scale: 1.05, transition: { duration: 0.2 } },
  tap: { scale: 0.95, transition: { duration: 0.1 } },
};

// Variante pentru animația de input
export const inputVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
  focus: { scale: 1.02, transition: { duration: 0.2 } },
};

// Variante pentru animația de form
export const formVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

// Variante pentru animația de loading
export const loadingVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 0.5, 
      ease: 'easeOut',
      repeat: Infinity,
      repeatType: 'reverse',
    } 
  },
  exit: { opacity: 0, scale: 0.8 },
};

// Variante pentru animația de spinner
export const spinnerVariants: Variants = {
  hidden: { opacity: 0, rotate: 0 },
  visible: { 
    opacity: 1, 
    rotate: 360,
    transition: { 
      duration: 1, 
      ease: 'linear',
      repeat: Infinity,
    } 
  },
  exit: { opacity: 0, rotate: 0 },
};

// Variante pentru animația de pulse
export const pulseVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: [0.5, 1, 0.5], 
    scale: [0.95, 1, 0.95],
    transition: { 
      duration: 2, 
      ease: 'easeInOut',
      repeat: Infinity,
    } 
  },
  exit: { opacity: 0, scale: 0.8 },
};

// Variante pentru animația de bounce
export const bounceVariants: Variants = {
  hidden: { opacity: 0, y: 0 },
  visible: { 
    opacity: 1, 
    y: [0, -20, 0],
    transition: { 
      duration: 1, 
      ease: 'easeInOut',
      repeat: Infinity,
    } 
  },
  exit: { opacity: 0, y: 0 },
};

// Variante pentru animația de wave
export const waveVariants: Variants = {
  hidden: { opacity: 0, y: 0 },
  visible: { 
    opacity: 1, 
    y: [0, -10, 0, 10, 0],
    transition: { 
      duration: 2, 
      ease: 'easeInOut',
      repeat: Infinity,
    } 
  },
  exit: { opacity: 0, y: 0 },
};

// Variante pentru animația de shake
export const shakeVariants: Variants = {
  hidden: { opacity: 0, x: 0 },
  visible: { 
    opacity: 1, 
    x: [0, -10, 10, -10, 10, 0],
    transition: { 
      duration: 0.5, 
      ease: 'easeInOut',
    } 
  },
  exit: { opacity: 0, x: 0 },
};

// Variante pentru animația de tada
export const tadaVariants: Variants = {
  hidden: { opacity: 0, scale: 1, rotate: 0 },
  visible: { 
    opacity: 1, 
    scale: [1, 0.9, 0.9, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1],
    rotate: [0, -3, -3, 3, -3, 3, -3, 3, -3, 0],
    transition: { 
      duration: 1, 
      ease: 'easeInOut',
    } 
  },
  exit: { opacity: 0, scale: 1, rotate: 0 },
};

// Variante pentru animația de jello
export const jelloVariants: Variants = {
  hidden: { opacity: 0, skewX: 0 },
  visible: { 
    opacity: 1, 
    skewX: [0, -12.5, 6.25, -3.125, 1.5625, -0.78125, 0.390625, -0.1953125, 0],
    transition: { 
      duration: 1, 
      ease: 'easeInOut',
    } 
  },
  exit: { opacity: 0, skewX: 0 },
};

// Variante pentru animația de heartbeat
export const heartbeatVariants: Variants = {
  hidden: { opacity: 0, scale: 1 },
  visible: { 
    opacity: 1, 
    scale: [1, 1.3, 1, 1.3, 1],
    transition: { 
      duration: 1, 
      ease: 'easeInOut',
      repeat: Infinity,
      repeatDelay: 1,
    } 
  },
  exit: { opacity: 0, scale: 1 },
};

// Exportăm toate variantele
export default {
  fadeVariants,
  slideVariants,
  slideRightVariants,
  slideUpVariants,
  slideDownVariants,
  scaleVariants,
  rotateVariants,
  flipVariants,
  cardVariants,
  listItemVariants,
  modalVariants,
  overlayVariants,
  drawerVariants,
  drawerRightVariants,
  drawerBottomVariants,
  drawerTopVariants,
  toastVariants,
  tooltipVariants,
  dropdownVariants,
  popoverVariants,
  collapseVariants,
  accordionVariants,
  tabVariants,
  pageVariants,
  welcomeVariants,
  logoVariants,
  buttonVariants,
  inputVariants,
  formVariants,
  loadingVariants,
  spinnerVariants,
  pulseVariants,
  bounceVariants,
  waveVariants,
  shakeVariants,
  tadaVariants,
  jelloVariants,
  heartbeatVariants,
};

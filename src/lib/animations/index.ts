/**
 * Exportă sistemul de animații
 */

// Exportăm variantele de animații
export {
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
} from './animation-variants';

// Exportăm hook-urile pentru animații
export {
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
} from './use-animation-controls';

// Export implicit pentru compatibilitate
export { default as animationVariants } from './animation-variants';

import { Variants } from 'framer-motion';

// Animații pentru intrare/ieșire - optimizate pentru performanță
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.15 } // Redus la jumătate pentru performanță
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.1 } // Redus la jumătate pentru performanță
  }
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 10 }, // Redus de la 20px la 10px
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2 } // Redus la jumătate pentru performanță
  },
  exit: {
    opacity: 0,
    y: 10, // Redus de la 20px la 10px
    transition: { duration: 0.1 } // Redus la jumătate pentru performanță
  }
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -10 }, // Redus de la 20px la 10px
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2 } // Redus la jumătate pentru performanță
  },
  exit: {
    opacity: 0,
    y: -10, // Redus de la 20px la 10px
    transition: { duration: 0.1 } // Redus la jumătate pentru performanță
  }
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4 }
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.2 }
  }
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4 }
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: { duration: 0.2 }
  }
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3 }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.2 }
  }
};

export const scaleInUp: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.4 }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 20,
    transition: { duration: 0.2 }
  }
};

// Animații pentru liste
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 }
  }
};

// Animații pentru hover
export const hoverScale = {
  scale: 1.03,
  transition: { duration: 0.2 }
};

export const hoverElevate = {
  y: -5,
  boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
  transition: { duration: 0.2 }
};

// Animații pentru butoane
export const buttonTap = {
  scale: 0.97,
  transition: { duration: 0.1 }
};

// Animații pentru pagini - optimizate pentru performanță maximă
export const pageTransition: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.15, // Redus și mai mult pentru tranziții ultra-rapide
      when: "beforeChildren",
      staggerChildren: 0.03 // Redus pentru a minimiza întârzierea
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.1,
      when: "afterChildren"
    }
  }
};

// Animații pentru modals
export const modalBackdrop: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2 }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2, delay: 0.1 }
  }
};

export const modalContent: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.3 }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.2 }
  }
};

// Animații pentru loading
export const pulse: Variants = {
  hidden: { opacity: 0.6, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.8,
      repeat: Infinity,
      repeatType: "reverse"
    }
  }
};

export const spin: Variants = {
  hidden: { rotate: 0 },
  visible: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

// Animații pentru notificări
export const notificationSlideIn: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, type: "spring", stiffness: 500, damping: 30 }
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: { duration: 0.2 }
  }
};

// Animații pentru acordeoane
export const accordionContent: Variants = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: "auto",
    transition: { duration: 0.3 }
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.2 }
  }
};

export default {
  fadeIn,
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  scaleIn,
  scaleInUp,
  staggerContainer,
  staggerItem,
  hoverScale,
  hoverElevate,
  buttonTap,
  pageTransition,
  modalBackdrop,
  modalContent,
  pulse,
  spin,
  notificationSlideIn,
  accordionContent
};

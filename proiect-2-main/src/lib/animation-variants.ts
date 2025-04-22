import { Variants } from 'framer-motion';

// Animații pentru intrare/ieșire - simplificate pentru a elimina flickering
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.1, ease: "easeOut" }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.05, ease: "easeIn" }
  }
};

// Animații subtile pentru butoane și elemente UI
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 5 }, // Redus la doar 5px pentru subtilitate
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.1, ease: "easeOut" }
  },
  exit: {
    opacity: 0,
    y: 0, // Fără mișcare la ieșire pentru a evita flickering
    transition: { duration: 0.05, ease: "easeIn" }
  }
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -5 }, // Redus la doar 5px pentru subtilitate
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.1, ease: "easeOut" }
  },
  exit: {
    opacity: 0,
    y: 0, // Fără mișcare la ieșire pentru a evita flickering
    transition: { duration: 0.05, ease: "easeIn" }
  }
};

// Înlocuim animațiile laterale cu unele mai subtile bazate doar pe opacitate
export const fadeInLeft: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.1, ease: "easeOut" }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.05, ease: "easeIn" }
  }
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.1, ease: "easeOut" }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.05, ease: "easeIn" }
  }
};

// Animații de scalare simplificate
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.98 }, // Scalare mai subtilă
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.1, ease: "easeOut" }
  },
  exit: {
    opacity: 0,
    scale: 1, // Fără scalare la ieșire pentru a evita flickering
    transition: { duration: 0.05, ease: "easeIn" }
  }
};

// Simplificăm scaleInUp pentru a fi mai subtil
export const scaleInUp: Variants = {
  hidden: { opacity: 0, scale: 0.98 }, // Fără mișcare pe axa Y
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.1, ease: "easeOut" }
  },
  exit: {
    opacity: 0,
    scale: 1, // Fără scalare la ieșire
    transition: { duration: 0.05, ease: "easeIn" }
  }
};

// Animații pentru liste - optimizate pentru performanță
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03, // Stagger mai rapid
      delayChildren: 0.02 // Întârziere mai mică
    }
  }
};

export const staggerItem: Variants = {
  hidden: { opacity: 0 }, // Fără mișcare pe axa Y
  visible: {
    opacity: 1,
    transition: { duration: 0.1, ease: "easeOut" }
  }
};

// Animații pentru hover - mai subtile
export const hoverScale = {
  scale: 1.01, // Scalare foarte subtilă
  transition: { duration: 0.1 }
};

export const hoverElevate = {
  y: -2, // Mișcare mai subtilă
  boxShadow: "0 5px 10px rgba(0, 0, 0, 0.05)", // Umbră mai subtilă
  transition: { duration: 0.1 }
};

// Animații pentru butoane - mai subtile
export const buttonTap = {
  scale: 0.99, // Scalare foarte subtilă
  transition: { duration: 0.05 }
};

// Animații pentru pagini - simplificate pentru a elimina flickering
export const pageTransition: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.1, // Tranziție foarte rapidă
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.05, // Ieșire și mai rapidă
      ease: "easeIn"
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

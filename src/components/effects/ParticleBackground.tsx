import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "framer-motion";

interface ParticleBackgroundProps {
  particleCount?: number;
  color?: string;
  minSize?: number;
  maxSize?: number;
  speed?: number;
  className?: string;
}

/**
 * Componenta pentru fundal cu particule animate
 * Creează un efect vizual de particule plutitoare în fundal
 */
const ParticleBackground: React.FC<ParticleBackgroundProps> = ({
  particleCount = 30,
  color = "rgba(255, 255, 255, 0.2)",
  minSize = 2,
  maxSize = 6,
  speed = 5,
  className = "",
}) => {
  const prefersReducedMotion = useReducedMotion();
  
  // Dacă utilizatorul preferă mișcări reduse, afișăm mai puține particule și mai lente
  const actualParticleCount = prefersReducedMotion ? Math.min(10, particleCount) : particleCount;
  const actualSpeed = prefersReducedMotion ? Math.max(1, speed / 2) : speed;

  // Generăm particule cu proprietăți aleatorii
  const particles = Array.from({ length: actualParticleCount }).map((_, i) => {
    const size = Math.random() * (maxSize - minSize) + minSize;
    return {
      id: i,
      size,
      x: Math.random() * 100, // poziție procentuală pe axa X
      y: Math.random() * 100, // poziție procentuală pe axa Y
      duration: (Math.random() * 10 + 10) / actualSpeed, // durată aleatorie pentru animație
      delay: Math.random() * 5, // întârziere aleatorie pentru start
    };
  });

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            backgroundColor: color,
            top: `${particle.y}%`,
            left: `${particle.x}%`,
            opacity: 0.2,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.1, 0.4, 0.1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: particle.delay,
          }}
        />
      ))}
    </div>
  );
};

export default ParticleBackground;

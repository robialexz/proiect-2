'use client'

import { useState, useEffect } from 'react';
import { SplineScene } from "@/components/ui/spline-scene";
import { Spotlight } from "@/components/ui/spotlight"
import { motion } from "framer-motion";

export function FullPageSplineScene() {
  // State pentru poziția cursorului
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Urmărește poziția cursorului
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 overflow-hidden z-0">
      {/* Spotlight care urmărește cursorul - mai mare pentru a acoperi mai mult din ecran */}
      <Spotlight
        className="opacity-70"
        fill="white"
        style={{
          top: mousePosition.y - 400,
          left: mousePosition.x - 400,
          width: 800,
          height: 800,
          transition: 'top 0.15s ease-out, left 0.15s ease-out'
        }}
      />

      {/* Conținut suprapus - poate fi personalizat */}
      <div className="absolute top-1/2 left-8 transform -translate-y-1/2 z-10 max-w-md">
        <motion.h1
          className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Bine ai venit!
        </motion.h1>
        <motion.p
          className="mt-4 text-xl text-slate-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Robotul nostru interactiv te va ajuta să navighezi prin aplicație.
          Mișcă cursorul pentru a interacționa cu el și pentru a vedea cum te urmărește.
        </motion.p>
      </div>

      {/* Robot 3D - ocupă întreaga pagină */}
      <div className="absolute inset-0 w-full h-full">
        <SplineScene
          scene="https://prod.spline.design/oo6IxFu8UZt6wsST/scene.splinecode"
          className="w-full h-full"
        />
      </div>

      {/* Particule animate pentru efect */}
      {Array.from({ length: 30 }).map((_, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full bg-white/10"
          style={{
            width: Math.random() * 15 + 5,
            height: Math.random() * 15 + 5,
            x: Math.random() * 100 + '%',
            y: Math.random() * 100 + '%',
          }}
          animate={{
            x: [null, Math.random() * 100 + '%'],
            y: [null, Math.random() * 100 + '%'],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: Math.random() * 15 + 10,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
      ))}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react';
import { SplineScene } from "@/components/ui/spline-scene";
import { Card } from "@/components/ui/card"
import { Spotlight } from "@/components/ui/spotlight"
import { motion } from "framer-motion";

export function SplineSceneBasic() {
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
    <Card className="w-full h-[600px] bg-gradient-to-br from-slate-900 to-slate-800 relative overflow-hidden border-slate-700">
      {/* Spotlight care urmărește cursorul */}
      <Spotlight
        className="opacity-80"
        fill="white"
        style={{
          top: mousePosition.y - 200,
          left: mousePosition.x - 200,
          transition: 'top 0.2s ease-out, left 0.2s ease-out'
        }}
      />

      <div className="flex flex-col md:flex-row h-full">
        {/* Left content */}
        <div className="md:flex-1 p-8 relative z-10 flex flex-col justify-center">
          <motion.h1
            className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Asistentul Tău 3D
          </motion.h1>
          <motion.p
            className="mt-4 text-slate-300 max-w-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Robotul nostru interactiv te ajută să navighezi prin aplicație.
            Mișcă cursorul pentru a interacționa cu el și pentru a vedea cum te urmărește.
          </motion.p>

          <motion.div
            className="mt-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <ul className="space-y-2">
              <li className="flex items-center text-slate-300">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Urmărește mișcarea cursorului
              </li>
              <li className="flex items-center text-slate-300">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                Interacționează cu elementele din pagină
              </li>
              <li className="flex items-center text-slate-300">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Oferă asistență vizuală
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Right content - Robot 3D */}
        <motion.div
          className="md:flex-1 relative h-[300px] md:h-full"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <SplineScene
            scene="https://prod.spline.design/oo6IxFu8UZt6wsST/scene.splinecode"
            className="w-full h-full"
          />
        </motion.div>
      </div>

      {/* Particule animate pentru efect */}
      {Array.from({ length: 20 }).map((_, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full bg-white/10"
          style={{
            width: Math.random() * 10 + 5,
            height: Math.random() * 10 + 5,
            x: Math.random() * 100 + '%',
            y: Math.random() * 100 + '%',
          }}
          animate={{
            x: [null, Math.random() * 100 + '%'],
            y: [null, Math.random() * 100 + '%'],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
      ))}
    </Card>
  )
}

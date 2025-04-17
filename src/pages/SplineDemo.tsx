import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SplineSceneBasic } from '@/components/ui/spline-scene-demo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Robot, Lightbulb, Code, Sparkles, Cpu } from 'lucide-react';

const SplineDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState('demo');
  const [showTip, setShowTip] = useState(false);

  // Afișăm un sfat aleatoriu după un timp
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTip(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Lista de sfaturi pentru interacțiunea cu robotul
  const tips = [
    "Mișcă cursorul pentru a vedea cum robotul te urmărește",
    "Robotul poate fi integrat în orice pagină a aplicației",
    "Modelul 3D este încărcat în mod leneș pentru performanță optimă",
    "Interacțiunea cu robotul poate fi personalizată pentru diferite funcții"
  ];

  // Alegem un sfat aleatoriu
  const randomTip = tips[Math.floor(Math.random() * tips.length)];

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-center mb-6">
          <Robot className="h-8 w-8 text-primary mr-3" />
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Asistentul Robotizat 3D
          </h1>
        </div>

        <p className="text-slate-300 text-center max-w-2xl mx-auto mb-8">
          Descoperiți cum puteți integra asistenți virtuali 3D în aplicația dumneavoastră pentru o experiență de utilizare mai interactivă și mai plăcută.
        </p>

        <Tabs defaultValue="demo" value={activeTab} onValueChange={setActiveTab} className="max-w-5xl mx-auto">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="demo" className="flex items-center gap-2">
              <Robot className="h-4 w-4" />
              Demo
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Funcționalități
            </TabsTrigger>
            <TabsTrigger value="integration" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Integrare
            </TabsTrigger>
          </TabsList>

          <TabsContent value="demo" className="relative">
            <SplineSceneBasic />

            {/* Sfat animat */}
            <AnimatePresence>
              {showTip && (
                <motion.div
                  className="absolute bottom-4 right-4 max-w-xs bg-slate-800/90 backdrop-blur-sm border border-slate-700 p-4 rounded-lg shadow-lg"
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-start gap-3">
                    <Lightbulb className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-200">{randomTip}</p>
                      <Button
                        variant="link"
                        size="sm"
                        className="text-xs text-slate-400 p-0 h-auto mt-1"
                        onClick={() => setShowTip(false)}
                      >
                        Înțeles
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="features">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  icon: <Robot className="h-8 w-8 text-blue-400" />,
                  title: "Interacțiune Avansată",
                  description: "Robotul urmărește mișcarea cursorului și reacționează la acțiunile utilizatorului, oferind o experiență interactivă captivantă."
                },
                {
                  icon: <Cpu className="h-8 w-8 text-purple-400" />,
                  title: "Performanță Optimizată",
                  description: "Încărcarea leneșă a conținutului 3D și optimizările de performanță asigură o experiență fluidă pe toate dispozitivele."
                },
                {
                  icon: <Sparkles className="h-8 w-8 text-amber-400" />,
                  title: "Efecte Vizuale",
                  description: "Efecte de lumină, particule animate și tranziții fluide creează o atmosferă modernă și atractivă."
                },
                {
                  icon: <Code className="h-8 w-8 text-green-400" />,
                  title: "Integrare Simplă",
                  description: "Se integrează perfect cu componentele UI existente și poate fi personalizat pentru a se potrivi cu designul aplicației."
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full bg-slate-800/50 border-slate-700 hover:border-primary/50 transition-colors">
                    <CardContent className="p-6">
                      <div className="mb-4">{feature.icon}</div>
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-slate-300">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="integration">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Integrare în Aplicația Ta</h3>
                <p className="mb-4 text-slate-300">
                  Robotul 3D poate fi integrat în orice pagină a aplicației pentru a oferi asistență utilizatorilor, a prezenta informații sau pur și simplu pentru a îmbunătăți aspectul vizual.
                </p>

                <div className="bg-slate-900 rounded-md p-4 mb-4">
                  <pre className="text-sm text-slate-300 overflow-x-auto">
                    <code>{`import { SplineScene } from '@/components/ui/spline-scene';

function MyComponent() {
  return (
    <div className="relative h-[400px]">
      <SplineScene
        scene="https://prod.spline.design/oo6IxFu8UZt6wsST/scene.splinecode"
        className="w-full h-full"
      />
    </div>
  );
}`}</code>
                  </pre>
                </div>

                <h4 className="text-lg font-semibold mb-2">Cazuri de utilizare:</h4>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Asistent virtual pentru ghidarea utilizatorilor prin aplicație</li>
                  <li>Prezentarea informațiilor în mod interactiv și atractiv</li>
                  <li>Mascotă a aplicației pentru a crea o identitate vizuală distinctivă</li>
                  <li>Element decorativ pentru a îmbunătăți experiența utilizatorului</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default SplineDemo;

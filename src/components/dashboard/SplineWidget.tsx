import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import Spline from '@splinetool/react-spline';

interface SplineWidgetProps {
  className?: string;
}

const SplineWidget: React.FC<SplineWidgetProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState('cube');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const handleSplineLoad = () => {
    setIsLoading(false);
    toast({
      title: 'Model 3D încărcat',
      description: 'Modelul 3D a fost încărcat cu succes.',
      variant: 'default',
    });
  };

  const handleSplineError = () => {
    setIsLoading(false);
    toast({
      title: 'Eroare la încărcarea modelului 3D',
      description: 'A apărut o eroare la încărcarea modelului 3D. Vă rugăm să încercați din nou.',
      variant: 'destructive',
    });
  };

  return (
    <Card className={`${className} overflow-hidden`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center">
          <span className="mr-2">Vizualizare 3D</span>
          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
            Interactiv
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="cube" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-4 pt-0 pb-2">
            <TabsList className="grid grid-cols-3 h-8">
              <TabsTrigger value="cube" className="text-xs">Cub</TabsTrigger>
              <TabsTrigger value="room" className="text-xs">Cameră</TabsTrigger>
              <TabsTrigger value="keyboard" className="text-xs">Tastatură</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="cube" className="h-[300px] relative mt-0">
            {isLoading && activeTab === 'cube' && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-800/50 backdrop-blur-sm rounded-b-md z-10">
                <div className="space-y-2">
                  <Skeleton className="h-8 w-8 rounded-full mx-auto" />
                  <Skeleton className="h-3 w-20 mx-auto" />
                </div>
              </div>
            )}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="h-full w-full"
            >
              <Spline 
                scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode" 
                onLoad={handleSplineLoad}
                onError={handleSplineError}
                style={{ width: '100%', height: '100%' }}
              />
            </motion.div>
          </TabsContent>
          
          <TabsContent value="room" className="h-[300px] relative mt-0">
            {isLoading && activeTab === 'room' && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-800/50 backdrop-blur-sm rounded-b-md z-10">
                <div className="space-y-2">
                  <Skeleton className="h-8 w-8 rounded-full mx-auto" />
                  <Skeleton className="h-3 w-20 mx-auto" />
                </div>
              </div>
            )}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="h-full w-full"
            >
              <Spline 
                scene="https://prod.spline.design/oo6IxFu8UDNrhpQX/scene.splinecode" 
                onLoad={handleSplineLoad}
                onError={handleSplineError}
                style={{ width: '100%', height: '100%' }}
              />
            </motion.div>
          </TabsContent>
          
          <TabsContent value="keyboard" className="h-[300px] relative mt-0">
            {isLoading && activeTab === 'keyboard' && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-800/50 backdrop-blur-sm rounded-b-md z-10">
                <div className="space-y-2">
                  <Skeleton className="h-8 w-8 rounded-full mx-auto" />
                  <Skeleton className="h-3 w-20 mx-auto" />
                </div>
              </div>
            )}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="h-full w-full"
            >
              <Spline 
                scene="https://prod.spline.design/JIRoJf4JVZjhOajD/scene.splinecode" 
                onLoad={handleSplineLoad}
                onError={handleSplineError}
                style={{ width: '100%', height: '100%' }}
              />
            </motion.div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SplineWidget;

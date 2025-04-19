import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Funcție pentru a rula testul general
const runGeneralTest = () => {
  const script = document.createElement('script');
  script.src = '/direct-test.js';
  document.head.appendChild(script);
};

// Funcție pentru a rula testul automat
const runAutoTest = () => {
  const script = document.createElement('script');
  script.src = '/auto-test.js';
  document.head.appendChild(script);
};

// Funcție pentru a rula testul de interacțiuni
const runInteractionTest = () => {
  const script = document.createElement('script');
  script.src = '/interaction-test.js';
  document.head.appendChild(script);
};

const TestRunner = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [logs, setLogs] = useState<string[]>([]);

  // Funcție pentru a captura log-urile
  const setupLogCapture = () => {
    const originalConsoleLog = console.log;
    console.log = function() {
      const args = Array.from(arguments);
      const message = args.join(' ');
      setLogs(prev => [...prev, message]);
      originalConsoleLog.apply(console, args);
    };
  };

  // Funcție pentru a rula testul selectat
  const runSelectedTest = () => {
    // Resetăm log-urile
    setLogs([]);
    
    // Captăm log-urile
    setupLogCapture();
    
    // Rulăm testul selectat
    if (activeTab === 'general') {
      runGeneralTest();
    } else if (activeTab === 'auto') {
      runAutoTest();
    } else if (activeTab === 'interaction') {
      runInteractionTest();
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500"
        >
          Deschide Tester
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-96 shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Tester Aplicație</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0"
            >
              ✕
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="auto">Automat</TabsTrigger>
              <TabsTrigger value="interaction">Interacțiuni</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general">
              <p className="text-sm text-slate-500 mb-4">
                Testul general verifică elementele de bază din pagină (butoane, inputuri, link-uri).
              </p>
            </TabsContent>
            
            <TabsContent value="auto">
              <p className="text-sm text-slate-500 mb-4">
                Testul automat verifică toate paginile aplicației și afișează rezultatele.
              </p>
            </TabsContent>
            
            <TabsContent value="interaction">
              <p className="text-sm text-slate-500 mb-4">
                Testul de interacțiuni verifică butoanele, inputurile și formularele din pagină.
              </p>
            </TabsContent>
            
            <Button 
              onClick={runSelectedTest}
              className="w-full bg-indigo-600 hover:bg-indigo-500 mt-2"
            >
              Rulează Testul
            </Button>
            
            {logs.length > 0 && (
              <div className="mt-4 p-2 bg-slate-800 text-slate-200 rounded-md text-xs h-40 overflow-y-auto">
                {logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log.includes('✅') ? (
                      <span className="text-green-400">{log}</span>
                    ) : log.includes('❌') ? (
                      <span className="text-red-400">{log}</span>
                    ) : (
                      <span>{log}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestRunner;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, FileText, Code, Server, Zap } from 'lucide-react';

interface ComponentHealth {
  name: string;
  path: string;
  hasTest: boolean;
  testPassing: boolean | null;
  testError: string | null;
  complexity: {
    lines: number;
    hooks: number;
    props: number;
    states: number;
    effects: number;
    isComplex: boolean;
  };
  performanceIssues: string[];
}

interface HealthReport {
  timestamp: string;
  summary: {
    totalComponents: number;
    testedComponents: number;
    passingTests: number;
    failingTests: number;
    highComplexityComponents: number;
    performanceIssues: number;
    healthScore: number;
  };
  components: ComponentHealth[];
}

const TestDashboardPage: React.FC = () => {
  const [report, setReport] = useState<HealthReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [filter, setFilter] = useState('all');

  // Simulate loading the report
  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    setLoading(true);
    
    try {
      // In a real implementation, this would load the actual report from the file
      // For demo purposes, we'll create a mock report
      const mockReport: HealthReport = {
        timestamp: new Date().toISOString(),
        summary: {
          totalComponents: 42,
          testedComponents: 28,
          passingTests: 25,
          failingTests: 3,
          highComplexityComponents: 5,
          performanceIssues: 12,
          healthScore: 78.5,
        },
        components: [
          {
            name: 'SplineWidget',
            path: 'src/components/dashboard/SplineWidget.tsx',
            hasTest: true,
            testPassing: true,
            testError: null,
            complexity: {
              lines: 120,
              hooks: 2,
              props: 1,
              states: 2,
              effects: 0,
              isComplex: false,
            },
            performanceIssues: [],
          },
          {
            name: 'WelcomeOverlay',
            path: 'src/components/welcome/WelcomeOverlay.tsx',
            hasTest: true,
            testPassing: true,
            testError: null,
            complexity: {
              lines: 203,
              hooks: 3,
              props: 1,
              states: 2,
              effects: 1,
              isComplex: false,
            },
            performanceIssues: [],
          },
          {
            name: 'AppLayout',
            path: 'src/components/layout/AppLayout.tsx',
            hasTest: true,
            testPassing: true,
            testError: null,
            complexity: {
              lines: 251,
              hooks: 5,
              props: 0,
              states: 3,
              effects: 4,
              isComplex: false,
            },
            performanceIssues: [],
          },
          {
            name: 'AuthContext',
            path: 'src/contexts/AuthContext.tsx',
            hasTest: true,
            testPassing: true,
            testError: null,
            complexity: {
              lines: 679,
              hooks: 4,
              props: 1,
              states: 4,
              effects: 5,
              isComplex: true,
            },
            performanceIssues: ['Large component with many responsibilities'],
          },
          {
            name: 'DashboardPage',
            path: 'src/pages/DashboardPage.tsx',
            hasTest: false,
            testPassing: null,
            testError: null,
            complexity: {
              lines: 441,
              hooks: 3,
              props: 0,
              states: 3,
              effects: 1,
              isComplex: true,
            },
            performanceIssues: ['Component with state/effects not wrapped in memo'],
          },
        ],
      };
      
      setReport(mockReport);
    } catch (error) {
      console.error('Error loading report:', error);
    } finally {
      setLoading(false);
    }
  };

  const runTests = async () => {
    setLoading(true);
    
    try {
      // In a real implementation, this would run the tests
      // For demo purposes, we'll just wait a bit and reload the report
      await new Promise(resolve => setTimeout(resolve, 2000));
      await loadReport();
    } catch (error) {
      console.error('Error running tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getFilteredComponents = () => {
    if (!report) return [];
    
    switch (filter) {
      case 'untested':
        return report.components.filter(c => !c.hasTest);
      case 'failing':
        return report.components.filter(c => c.testPassing === false);
      case 'complex':
        return report.components.filter(c => c.complexity.isComplex);
      case 'performance':
        return report.components.filter(c => c.performanceIssues.length > 0);
      default:
        return report.components;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center">
          <RefreshCw className="h-12 w-12 text-primary animate-spin" />
          <p className="mt-4 text-lg">Analizarea componentelor...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500" />
          <p className="mt-4 text-lg">Nu s-a putut încărca raportul de testare</p>
          <Button onClick={loadReport} className="mt-4">
            Reîncarcă
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard Testare Componente</h1>
          <p className="text-slate-400">
            Monitorizarea stării componentelor și a testelor
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button onClick={runTests} disabled={loading} className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Rulează testele
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Componente testate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {report.summary.testedComponents}/{report.summary.totalComponents}
            </div>
            <Progress 
              value={(report.summary.testedComponents / report.summary.totalComponents) * 100} 
              className="h-2 mt-2"
            />
            <p className="text-xs text-slate-400 mt-2">
              {Math.round((report.summary.testedComponents / report.summary.totalComponents) * 100)}% din componente au teste
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Teste trecute
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {report.summary.passingTests}/{report.summary.testedComponents}
            </div>
            <Progress 
              value={(report.summary.passingTests / report.summary.testedComponents) * 100} 
              className="h-2 mt-2 bg-slate-700"
              indicatorClassName={report.summary.passingTests === report.summary.testedComponents ? "bg-green-500" : "bg-yellow-500"}
            />
            <p className="text-xs text-slate-400 mt-2">
              {Math.round((report.summary.passingTests / report.summary.testedComponents) * 100)}% din teste trec
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Complexitate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {report.summary.highComplexityComponents}
            </div>
            <Progress 
              value={(report.summary.highComplexityComponents / report.summary.totalComponents) * 100} 
              className="h-2 mt-2 bg-slate-700"
              indicatorClassName="bg-amber-500"
            />
            <p className="text-xs text-slate-400 mt-2">
              {Math.round((report.summary.highComplexityComponents / report.summary.totalComponents) * 100)}% din componente au complexitate ridicată
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Scor de sănătate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getHealthScoreColor(report.summary.healthScore)}`}>
              {report.summary.healthScore}/100
            </div>
            <Progress 
              value={report.summary.healthScore} 
              className="h-2 mt-2 bg-slate-700"
              indicatorClassName={
                report.summary.healthScore >= 80 ? "bg-green-500" : 
                report.summary.healthScore >= 60 ? "bg-yellow-500" : 
                "bg-red-500"
              }
            />
            <p className="text-xs text-slate-400 mt-2">
              Ultima actualizare: {new Date(report.timestamp).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Prezentare generală</TabsTrigger>
          <TabsTrigger value="components">Componente</TabsTrigger>
          <TabsTrigger value="issues">Probleme</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg">Distribuția testelor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-64">
                  <div className="w-48 h-48 rounded-full border-8 border-slate-700 relative">
                    <div 
                      className="absolute inset-0 rounded-full border-8 border-green-500" 
                      style={{ 
                        clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos(2 * Math.PI * (report.summary.passingTests / report.summary.totalComponents))}% ${50 - 50 * Math.sin(2 * Math.PI * (report.summary.passingTests / report.summary.totalComponents))}%, 50% 0%)`,
                        transform: 'rotate(90deg)',
                      }}
                    />
                    <div 
                      className="absolute inset-0 rounded-full border-8 border-yellow-500" 
                      style={{ 
                        clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos(2 * Math.PI * (report.summary.passingTests / report.summary.totalComponents))}% ${50 - 50 * Math.sin(2 * Math.PI * (report.summary.passingTests / report.summary.totalComponents))}%, ${50 + 50 * Math.cos(2 * Math.PI * ((report.summary.passingTests + report.summary.failingTests) / report.summary.totalComponents))}% ${50 - 50 * Math.sin(2 * Math.PI * ((report.summary.passingTests + report.summary.failingTests) / report.summary.totalComponents))}%)`,
                        transform: 'rotate(90deg)',
                      }}
                    />
                    <div 
                      className="absolute inset-0 rounded-full border-8 border-red-500" 
                      style={{ 
                        clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos(2 * Math.PI * ((report.summary.passingTests + report.summary.failingTests) / report.summary.totalComponents))}% ${50 - 50 * Math.sin(2 * Math.PI * ((report.summary.passingTests + report.summary.failingTests) / report.summary.totalComponents))}%, ${50 + 50 * Math.cos(2 * Math.PI)}% ${50 - 50 * Math.sin(2 * Math.PI)})`,
                        transform: 'rotate(90deg)',
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{report.summary.testedComponents}</div>
                        <div className="text-xs text-slate-400">testate</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm">{report.summary.passingTests} trecute</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                    <span className="text-sm">{report.summary.failingTests} eșuate</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    <span className="text-sm">{report.summary.totalComponents - report.summary.testedComponents} fără teste</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg">Probleme identificate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <XCircle className="h-5 w-5 text-red-500 mr-2" />
                      <span>Componente fără teste</span>
                    </div>
                    <Badge variant="outline" className="bg-slate-700">
                      {report.summary.totalComponents - report.summary.testedComponents}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                      <span>Teste eșuate</span>
                    </div>
                    <Badge variant="outline" className="bg-slate-700">
                      {report.summary.failingTests}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Code className="h-5 w-5 text-amber-500 mr-2" />
                      <span>Componente complexe</span>
                    </div>
                    <Badge variant="outline" className="bg-slate-700">
                      {report.summary.highComplexityComponents}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Zap className="h-5 w-5 text-purple-500 mr-2" />
                      <span>Probleme de performanță</span>
                    </div>
                    <Badge variant="outline" className="bg-slate-700">
                      {report.summary.performanceIssues}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="components">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Lista componentelor</CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant={filter === 'all' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  Toate
                </Button>
                <Button 
                  variant={filter === 'untested' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setFilter('untested')}
                >
                  Fără teste
                </Button>
                <Button 
                  variant={filter === 'failing' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setFilter('failing')}
                >
                  Eșuate
                </Button>
                <Button 
                  variant={filter === 'complex' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setFilter('complex')}
                >
                  Complexe
                </Button>
                <Button 
                  variant={filter === 'performance' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setFilter('performance')}
                >
                  Performanță
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getFilteredComponents().map((component, index) => (
                  <motion.div
                    key={component.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 bg-slate-700 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-blue-400 mr-2" />
                        <span className="font-medium">{component.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {component.hasTest ? (
                          component.testPassing ? (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Teste trecute
                            </Badge>
                          ) : (
                            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                              <XCircle className="h-3 w-3 mr-1" />
                              Teste eșuate
                            </Badge>
                          )
                        ) : (
                          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Fără teste
                          </Badge>
                        )}
                        
                        {component.complexity.isComplex && (
                          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                            <Code className="h-3 w-3 mr-1" />
                            Complex
                          </Badge>
                        )}
                        
                        {component.performanceIssues.length > 0 && (
                          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                            <Zap className="h-3 w-3 mr-1" />
                            Performanță
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-slate-400 mb-2">{component.path}</p>
                    
                    <div className="grid grid-cols-5 gap-2 text-xs text-slate-400">
                      <div>
                        <span className="block">Linii</span>
                        <span className={component.complexity.lines > 300 ? 'text-amber-400' : 'text-slate-300'}>
                          {component.complexity.lines}
                        </span>
                      </div>
                      <div>
                        <span className="block">Hooks</span>
                        <span className={component.complexity.hooks > 5 ? 'text-amber-400' : 'text-slate-300'}>
                          {component.complexity.hooks}
                        </span>
                      </div>
                      <div>
                        <span className="block">Props</span>
                        <span className={component.complexity.props > 10 ? 'text-amber-400' : 'text-slate-300'}>
                          {component.complexity.props}
                        </span>
                      </div>
                      <div>
                        <span className="block">State</span>
                        <span className={component.complexity.states > 8 ? 'text-amber-400' : 'text-slate-300'}>
                          {component.complexity.states}
                        </span>
                      </div>
                      <div>
                        <span className="block">Effects</span>
                        <span className={component.complexity.effects > 5 ? 'text-amber-400' : 'text-slate-300'}>
                          {component.complexity.effects}
                        </span>
                      </div>
                    </div>
                    
                    {component.performanceIssues.length > 0 && (
                      <div className="mt-2 text-xs text-purple-400">
                        <span className="font-medium">Probleme de performanță:</span>
                        <ul className="list-disc list-inside mt-1">
                          {component.performanceIssues.map((issue, i) => (
                            <li key={i}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="issues">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle>Probleme și recomandări</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center">
                    <XCircle className="h-5 w-5 text-red-500 mr-2" />
                    Componente fără teste
                  </h3>
                  <p className="text-slate-400 mb-4">
                    {report.summary.totalComponents - report.summary.testedComponents} componente nu au teste asociate. Acest lucru poate duce la regresii și probleme nedetectate.
                  </p>
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Recomandări:</h4>
                    <ul className="list-disc list-inside text-sm space-y-1 text-slate-300">
                      <li>Creați teste pentru componentele critice mai întâi</li>
                      <li>Folosiți Testing Library pentru a testa comportamentul, nu implementarea</li>
                      <li>Implementați cel puțin teste de bază pentru fiecare componentă</li>
                    </ul>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                    Teste eșuate
                  </h3>
                  <p className="text-slate-400 mb-4">
                    {report.summary.failingTests} teste eșuează în prezent. Acestea indică probleme în cod care trebuie rezolvate.
                  </p>
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Recomandări:</h4>
                    <ul className="list-disc list-inside text-sm space-y-1 text-slate-300">
                      <li>Rezolvați testele eșuate înainte de a adăuga funcționalități noi</li>
                      <li>Verificați dacă testele sunt încă relevante sau necesită actualizare</li>
                      <li>Asigurați-vă că testele sunt izolate și nu depind de starea globală</li>
                    </ul>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center">
                    <Code className="h-5 w-5 text-amber-500 mr-2" />
                    Componente complexe
                  </h3>
                  <p className="text-slate-400 mb-4">
                    {report.summary.highComplexityComponents} componente au complexitate ridicată. Acestea sunt mai greu de întreținut și testat.
                  </p>
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Recomandări:</h4>
                    <ul className="list-disc list-inside text-sm space-y-1 text-slate-300">
                      <li>Refactorizați componentele mari în componente mai mici și reutilizabile</li>
                      <li>Extrageți logica complexă în hooks personalizate</li>
                      <li>Folosiți pattern-uri precum Compound Components pentru a simplifica interfețele</li>
                    </ul>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center">
                    <Zap className="h-5 w-5 text-purple-500 mr-2" />
                    Probleme de performanță
                  </h3>
                  <p className="text-slate-400 mb-4">
                    Au fost detectate {report.summary.performanceIssues} probleme potențiale de performanță în componente.
                  </p>
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Recomandări:</h4>
                    <ul className="list-disc list-inside text-sm space-y-1 text-slate-300">
                      <li>Folosiți React.memo pentru a preveni re-renderizări inutile</li>
                      <li>Evitați definirea funcțiilor inline în JSX</li>
                      <li>Utilizați useCallback și useMemo pentru a memora funcții și valori</li>
                      <li>Optimizați array-urile de dependențe în useEffect</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TestDashboardPage;

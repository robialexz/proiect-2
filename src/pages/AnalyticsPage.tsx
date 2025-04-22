import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { CalendarIcon, Download, BarChart3, LineChart, PieChart, TrendingUp, Users, Package, Clock, DollarSign } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';

// Componenta pentru graficul de bare
const BarChartComponent = ({ data, isLoading }: { data: any; isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  return (
    <div className="w-full h-64 flex items-end justify-between space-x-2">
      {data.map((item: any, index: number) => (
        <div key={index} className="flex flex-col items-center">
          <div
            className="bg-indigo-600 rounded-t-sm w-12"
            style={{ height: `${(item.value / Math.max(...data.map((d: any) => d.value))) * 200}px` }}
          ></div>
          <span className="text-xs mt-2">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

// Componenta pentru graficul liniar
const LineChartComponent = ({ data, isLoading }: { data: any; isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d: any) => d.value));
  const points = data.map((item: any, index: number) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - (item.value / maxValue) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full h-64 relative">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke="rgb(79, 70, 229)"
          strokeWidth="2"
        />
      </svg>
      <div className="absolute bottom-0 left-0 right-0 flex justify-between">
        {data.map((item: any, index: number) => (
          <span key={index} className="text-xs">{item.label}</span>
        ))}
      </div>
    </div>
  );
};

// Componenta pentru graficul circular
const PieChartComponent = ({ data, isLoading }: { data: any; isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <Skeleton className="w-full h-full rounded-full" />
      </div>
    );
  }

  const total = data.reduce((sum: number, item: any) => sum + item.value, 0);
  let cumulativePercentage = 0;

  return (
    <div className="w-full h-64 flex items-center justify-center">
      <div className="relative w-48 h-48">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {data.map((item: any, index: number) => {
            const percentage = (item.value / total) * 100;
            const startAngle = (cumulativePercentage / 100) * 360;
            const endAngle = ((cumulativePercentage + percentage) / 100) * 360;
            
            const startRad = (startAngle - 90) * (Math.PI / 180);
            const endRad = (endAngle - 90) * (Math.PI / 180);
            
            const x1 = 50 + 50 * Math.cos(startRad);
            const y1 = 50 + 50 * Math.sin(startRad);
            const x2 = 50 + 50 * Math.cos(endRad);
            const y2 = 50 + 50 * Math.sin(endRad);
            
            const largeArcFlag = percentage > 50 ? 1 : 0;
            
            const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
            
            cumulativePercentage += percentage;
            
            const colors = ['rgb(79, 70, 229)', 'rgb(16, 185, 129)', 'rgb(245, 158, 11)', 'rgb(239, 68, 68)', 'rgb(59, 130, 246)'];
            
            return (
              <path
                key={index}
                d={pathData}
                fill={colors[index % colors.length]}
              />
            );
          })}
        </svg>
      </div>
      <div className="ml-8 space-y-2">
        {data.map((item: any, index: number) => {
          const colors = ['bg-indigo-600', 'bg-emerald-500', 'bg-amber-500', 'bg-red-500', 'bg-blue-500'];
          return (
            <div key={index} className="flex items-center">
              <div className={`w-3 h-3 ${colors[index % colors.length]} rounded-sm mr-2`}></div>
              <span className="text-sm">{item.label} ({((item.value / total) * 100).toFixed(1)}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Componenta pentru card statistic
const StatCard = ({ title, value, icon, change, isLoading }: { title: string; value: string; icon: React.ReactNode; change?: string; isLoading: boolean }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-28" />
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {change && (
              <p className={`text-xs ${change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                {change} față de luna trecută
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

// Pagina principală de analiză
const AnalyticsPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
    to: new Date(),
  });
  const [isLoading, setIsLoading] = useState(true);
  const [projectFilter, setProjectFilter] = useState('all');
  const { toast } = useToast();

  // Date de exemplu pentru grafice
  const [barChartData, setBarChartData] = useState([]);
  const [lineChartData, setLineChartData] = useState([]);
  const [pieChartData, setPieChartData] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: '0',
    activeProjects: '0',
    totalMaterials: '0',
    totalHours: '0',
    totalCost: '0 RON',
    projectsChange: '+0%',
    materialsChange: '+0%',
    hoursChange: '+0%',
    costChange: '+0%',
  });

  // Simulăm încărcarea datelor
  useEffect(() => {
    setIsLoading(true);
    
    // Simulăm un apel API
    const timer = setTimeout(() => {
      // Date pentru graficul de bare (proiecte pe luni)
      setBarChartData([
        { label: 'Ian', value: 5 },
        { label: 'Feb', value: 8 },
        { label: 'Mar', value: 12 },
        { label: 'Apr', value: 10 },
        { label: 'Mai', value: 15 },
        { label: 'Iun', value: 18 },
        { label: 'Iul', value: 14 },
        { label: 'Aug', value: 12 },
        { label: 'Sep', value: 20 },
        { label: 'Oct', value: 22 },
        { label: 'Nov', value: 25 },
        { label: 'Dec', value: 28 },
      ]);
      
      // Date pentru graficul liniar (ore lucrate)
      setLineChartData([
        { label: 'S1', value: 40 },
        { label: 'S2', value: 45 },
        { label: 'S3', value: 55 },
        { label: 'S4', value: 48 },
        { label: 'S5', value: 52 },
        { label: 'S6', value: 60 },
        { label: 'S7', value: 58 },
        { label: 'S8', value: 65 },
      ]);
      
      // Date pentru graficul circular (distribuția materialelor)
      setPieChartData([
        { label: 'Lemn', value: 35 },
        { label: 'Metal', value: 25 },
        { label: 'Plastic', value: 15 },
        { label: 'Sticlă', value: 10 },
        { label: 'Altele', value: 15 },
      ]);
      
      // Date pentru statistici
      setStats({
        totalProjects: '42',
        activeProjects: '18',
        totalMaterials: '1,250',
        totalHours: '3,845',
        totalCost: '285,750 RON',
        projectsChange: '+15%',
        materialsChange: '+8%',
        hoursChange: '+12%',
        costChange: '+10%',
      });
      
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [dateRange, projectFilter, activeTab]);

  // Funcție pentru exportul datelor
  const handleExport = (format: string) => {
    toast({
      title: 'Export inițiat',
      description: `Raportul va fi exportat în format ${format.toUpperCase()}.`,
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analiză și Rapoarte</h1>
          <p className="text-muted-foreground">
            Monitorizați performanța proiectelor și analizați datele importante.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start text-left font-normal w-[240px]">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, 'P', { locale: ro })} -{' '}
                      {format(dateRange.to, 'P', { locale: ro })}
                    </>
                  ) : (
                    format(dateRange.from, 'P', { locale: ro })
                  )
                ) : (
                  'Selectați perioada'
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={dateRange}
                onSelect={(range) => setDateRange(range as any)}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Toate proiectele" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toate proiectele</SelectItem>
              <SelectItem value="active">Proiecte active</SelectItem>
              <SelectItem value="completed">Proiecte finalizate</SelectItem>
              <SelectItem value="delayed">Proiecte întârziate</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => handleExport('pdf')}>
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => handleExport('excel')}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Proiecte"
          value={stats.totalProjects}
          icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
          change={stats.projectsChange}
          isLoading={isLoading}
        />
        <StatCard
          title="Materiale Utilizate"
          value={stats.totalMaterials}
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
          change={stats.materialsChange}
          isLoading={isLoading}
        />
        <StatCard
          title="Ore Lucrate"
          value={stats.totalHours}
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
          change={stats.hoursChange}
          isLoading={isLoading}
        />
        <StatCard
          title="Cost Total"
          value={stats.totalCost}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          change={stats.costChange}
          isLoading={isLoading}
        />
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <TrendingUp className="h-4 w-4 mr-2" />
            Prezentare generală
          </TabsTrigger>
          <TabsTrigger value="projects">
            <BarChart3 className="h-4 w-4 mr-2" />
            Proiecte
          </TabsTrigger>
          <TabsTrigger value="materials">
            <PieChart className="h-4 w-4 mr-2" />
            Materiale
          </TabsTrigger>
          <TabsTrigger value="hours">
            <LineChart className="h-4 w-4 mr-2" />
            Ore lucrate
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Proiecte lunare</CardTitle>
                <CardDescription>Numărul de proiecte pe luni în ultimul an</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChartComponent data={barChartData} isLoading={isLoading} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Distribuția materialelor</CardTitle>
                <CardDescription>Tipuri de materiale utilizate</CardDescription>
              </CardHeader>
              <CardContent>
                <PieChartComponent data={pieChartData} isLoading={isLoading} />
              </CardContent>
            </Card>
            
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Ore lucrate săptămânal</CardTitle>
                <CardDescription>Evoluția orelor lucrate în ultimele săptămâni</CardDescription>
              </CardHeader>
              <CardContent>
                <LineChartComponent data={lineChartData} isLoading={isLoading} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analiza proiectelor</CardTitle>
              <CardDescription>Detalii despre proiectele în desfășurare și finalizate</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChartComponent data={barChartData} isLoading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="materials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analiza materialelor</CardTitle>
              <CardDescription>Utilizarea materialelor în proiecte</CardDescription>
            </CardHeader>
            <CardContent>
              <PieChartComponent data={pieChartData} isLoading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="hours" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analiza orelor lucrate</CardTitle>
              <CardDescription>Distribuția orelor lucrate pe proiecte și echipe</CardDescription>
            </CardHeader>
            <CardContent>
              <LineChartComponent data={lineChartData} isLoading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsPage;

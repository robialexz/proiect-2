import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import {
  CalendarIcon,
  Download,
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  Users,
  Package,
  Clock,
  DollarSign,
  RefreshCw,
  Filter,
  ArrowUpDown,
} from 'lucide-react';

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
            className="bg-primary rounded-t-sm w-12"
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
          stroke="hsl(var(--primary))"
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
            
            const colors = [
              'hsl(var(--primary))', 
              'hsl(var(--success))', 
              'hsl(var(--warning))', 
              'hsl(var(--destructive))', 
              'hsl(var(--info))'
            ];
            
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
          const colors = [
            'bg-primary', 
            'bg-green-500', 
            'bg-amber-500', 
            'bg-red-500', 
            'bg-blue-500'
          ];
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
const StatCard = ({ 
  title, 
  value, 
  icon, 
  change, 
  isLoading 
}: { 
  title: string; 
  value: string; 
  icon: React.ReactNode; 
  change?: string; 
  isLoading: boolean 
}) => {
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
const AnalyticsPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
    to: new Date(),
  });
  const [isLoading, setIsLoading] = useState(true);
  const [projectFilter, setProjectFilter] = useState('all');
  const { toast } = useToast();

  // Date de exemplu pentru grafice
  const [barChartData, setBarChartData] = useState<any[]>([]);
  const [lineChartData, setLineChartData] = useState<any[]>([]);
  const [pieChartData, setPieChartData] = useState<any[]>([]);
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
      title: t('analytics.export.title', 'Export inițiat'),
      description: t('analytics.export.description', `Raportul va fi exportat în format ${format.toUpperCase()}.`),
    });
  };

  // Funcție pentru reîmprospătarea datelor
  const handleRefresh = () => {
    setIsLoading(true);
    
    // Simulăm un apel API
    setTimeout(() => {
      setIsLoading(false);
      
      toast({
        title: t('analytics.refresh.success', 'Date actualizate'),
        description: t('analytics.refresh.successDescription', 'Datele au fost actualizate cu succes.'),
      });
    }, 1500);
  };

  // Funcție pentru resetarea filtrelor
  const resetFilters = () => {
    setProjectFilter('all');
    setDateRange({
      from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
      to: new Date(),
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('analytics.title', 'Analiză și Rapoarte')}
          </h1>
          <p className="text-muted-foreground">
            {t('analytics.description', 'Monitorizați performanța proiectelor și analizați datele importante.')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {t('common.refresh', 'Reîmprospătează')}
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('excel')}>
            <Download className="mr-2 h-4 w-4" />
            Excel
          </Button>
        </div>
      </div>

      <Separator />

      {/* Filtre */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-start text-left font-normal w-full">
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
                t('analytics.selectPeriod', 'Selectați perioada')
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
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
          <SelectTrigger>
            <SelectValue placeholder={t('analytics.selectProject', 'Selectează proiectul')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all', 'Toate proiectele')}</SelectItem>
            <SelectItem value="active">{t('analytics.activeProjects', 'Proiecte active')}</SelectItem>
            <SelectItem value="completed">{t('analytics.completedProjects', 'Proiecte finalizate')}</SelectItem>
            <SelectItem value="delayed">{t('analytics.delayedProjects', 'Proiecte întârziate')}</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={resetFilters}>
          <Filter className="mr-2 h-4 w-4" />
          {t('common.resetFilters', 'Resetează filtrele')}
        </Button>
      </div>

      {/* Statistici */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('analytics.totalProjects', 'Total Proiecte')}
          value={stats.totalProjects}
          icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
          change={stats.projectsChange}
          isLoading={isLoading}
        />
        <StatCard
          title={t('analytics.materialsUsed', 'Materiale Utilizate')}
          value={stats.totalMaterials}
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
          change={stats.materialsChange}
          isLoading={isLoading}
        />
        <StatCard
          title={t('analytics.hoursWorked', 'Ore Lucrate')}
          value={stats.totalHours}
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
          change={stats.hoursChange}
          isLoading={isLoading}
        />
        <StatCard
          title={t('analytics.totalCost', 'Cost Total')}
          value={stats.totalCost}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          change={stats.costChange}
          isLoading={isLoading}
        />
      </div>
      
      {/* Tabs pentru diferite tipuri de analiză */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="overview">
            <TrendingUp className="h-4 w-4 mr-2" />
            {t('analytics.overview', 'Prezentare generală')}
          </TabsTrigger>
          <TabsTrigger value="projects">
            <BarChart3 className="h-4 w-4 mr-2" />
            {t('analytics.projects', 'Proiecte')}
          </TabsTrigger>
          <TabsTrigger value="materials">
            <PieChart className="h-4 w-4 mr-2" />
            {t('analytics.materials', 'Materiale')}
          </TabsTrigger>
          <TabsTrigger value="hours">
            <LineChart className="h-4 w-4 mr-2" />
            {t('analytics.hours', 'Ore lucrate')}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>{t('analytics.monthlyProjects', 'Proiecte lunare')}</CardTitle>
                <CardDescription>
                  {t('analytics.monthlyProjectsDescription', 'Numărul de proiecte pe luni în ultimul an')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BarChartComponent data={barChartData} isLoading={isLoading} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{t('analytics.materialsDistribution', 'Distribuția materialelor')}</CardTitle>
                <CardDescription>
                  {t('analytics.materialsDistributionDescription', 'Tipuri de materiale utilizate')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PieChartComponent data={pieChartData} isLoading={isLoading} />
              </CardContent>
            </Card>
            
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>{t('analytics.weeklyHours', 'Ore lucrate săptămânal')}</CardTitle>
                <CardDescription>
                  {t('analytics.weeklyHoursDescription', 'Evoluția orelor lucrate în ultimele săptămâni')}
                </CardDescription>
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
              <CardTitle>{t('analytics.projectsAnalysis', 'Analiza proiectelor')}</CardTitle>
              <CardDescription>
                {t('analytics.projectsAnalysisDescription', 'Detalii despre proiectele în desfășurare și finalizate')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BarChartComponent data={barChartData} isLoading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="materials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('analytics.materialsAnalysis', 'Analiza materialelor')}</CardTitle>
              <CardDescription>
                {t('analytics.materialsAnalysisDescription', 'Utilizarea materialelor în proiecte')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PieChartComponent data={pieChartData} isLoading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="hours" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('analytics.hoursAnalysis', 'Analiza orelor lucrate')}</CardTitle>
              <CardDescription>
                {t('analytics.hoursAnalysisDescription', 'Distribuția orelor lucrate pe proiecte și echipe')}
              </CardDescription>
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

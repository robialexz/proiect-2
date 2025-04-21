import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import {
  BarChart3,
  Package,
  Users,
  Truck,
  DollarSign,
  Clock,
  AlertTriangle,
  TrendingUp,
  Layers,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardOverviewProps {
  stats?: {
    projects: number;
    materials: number;
    teams: number;
    deliveries: number;
  };
  className?: string;
}

type WidgetType = {
  id: string;
  title: string;
  icon: React.ReactNode;
  value: number;
  subtitle: string;
  color: string;
  visible: boolean;
  order: number;
};

const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  stats = { projects: 0, materials: 0, teams: 0, deliveries: 0 },
  className,
}) => {
  const { t } = useTranslation();
  const [widgets, setWidgets] = useState<WidgetType[]>([]);
  const [isCustomizing, setIsCustomizing] = useState(false);

  // Initialize widgets with default values and saved preferences
  useEffect(() => {
    const defaultWidgets: WidgetType[] = [
      {
        id: "projects",
        title: t("dashboard.projects", "Projects"),
        icon: <BarChart3 className="h-5 w-5 mr-2 text-blue-400" />,
        value: stats.projects,
        subtitle: t("dashboard.activeProjects", "Active projects"),
        color: "text-blue-400",
        visible: true,
        order: 0,
      },
      {
        id: "materials",
        title: t("dashboard.materials", "Materials"),
        icon: <Package className="h-5 w-5 mr-2 text-green-400" />,
        value: stats.materials,
        subtitle: t("dashboard.totalMaterials", "Total materials"),
        color: "text-green-400",
        visible: true,
        order: 1,
      },
      {
        id: "teams",
        title: t("dashboard.teams", "Teams"),
        icon: <Users className="h-5 w-5 mr-2 text-yellow-400" />,
        value: stats.teams,
        subtitle: t("dashboard.activeTeams", "Active teams"),
        color: "text-yellow-400",
        visible: true,
        order: 2,
      },
      {
        id: "deliveries",
        title: t("dashboard.deliveries", "Deliveries"),
        icon: <Truck className="h-5 w-5 mr-2 text-purple-400" />,
        value: stats.deliveries,
        subtitle: t("dashboard.pendingDeliveries", "Pending deliveries"),
        color: "text-purple-400",
        visible: true,
        order: 3,
      },
      {
        id: "budget",
        title: t("dashboard.budget", "Budget"),
        icon: <DollarSign className="h-5 w-5 mr-2 text-emerald-400" />,
        value: 85,
        subtitle: t("dashboard.budgetRemaining", "% of budget remaining"),
        color: "text-emerald-400",
        visible: false,
        order: 4,
      },
      {
        id: "deadlines",
        title: t("dashboard.deadlines", "Deadlines"),
        icon: <Clock className="h-5 w-5 mr-2 text-orange-400" />,
        value: 3,
        subtitle: t("dashboard.upcomingDeadlines", "Upcoming deadlines"),
        color: "text-orange-400",
        visible: false,
        order: 5,
      },
      {
        id: "issues",
        title: t("dashboard.issues", "Issues"),
        icon: <AlertTriangle className="h-5 w-5 mr-2 text-red-400" />,
        value: 2,
        subtitle: t("dashboard.openIssues", "Open issues"),
        color: "text-red-400",
        visible: false,
        order: 6,
      },
      {
        id: "performance",
        title: t("dashboard.performance", "Performance"),
        icon: <TrendingUp className="h-5 w-5 mr-2 text-cyan-400" />,
        value: 12,
        subtitle: t("dashboard.performanceIncrease", "% increase this month"),
        color: "text-cyan-400",
        visible: false,
        order: 7,
      },
    ];

    // Try to load saved widget preferences from localStorage
    try {
      const savedWidgets = localStorage.getItem("dashboardWidgets");
      if (savedWidgets) {
        const parsedWidgets = JSON.parse(savedWidgets) as WidgetType[];
        // Update values from current stats
        parsedWidgets.forEach((widget) => {
          if (widget.id === "projects") widget.value = stats.projects;
          if (widget.id === "materials") widget.value = stats.materials;
          if (widget.id === "teams") widget.value = stats.teams;
          if (widget.id === "deliveries") widget.value = stats.deliveries;
        });
        setWidgets(parsedWidgets);
      } else {
        setWidgets(defaultWidgets);
      }
    } catch (error) {
      // Removed console statement
      setWidgets(defaultWidgets);
    }
  }, [stats, t]);

  // Save widget preferences when they change
  useEffect(() => {
    if (widgets.length > 0) {
      localStorage.setItem("dashboardWidgets", JSON.stringify(widgets));
    }
  }, [widgets]);

  const toggleWidgetVisibility = (id: string) => {
    setWidgets((prev) =>
      prev.map((widget) =>
        widget.id === id ? { ...widget, visible: !widget.visible } : widget,
      ),
    );
  };

  const moveWidgetUp = (id: string) => {
    setWidgets((prev) => {
      const index = prev.findIndex((w) => w.id === id);
      if (index <= 0) return prev;

      const newWidgets = [...prev];
      const widget = newWidgets[index];
      const prevWidget = newWidgets[index - 1];

      // Swap orders
      const tempOrder = widget.order;
      newWidgets[index] = { ...widget, order: prevWidget.order };
      newWidgets[index - 1] = { ...prevWidget, order: tempOrder };

      return newWidgets.sort((a, b) => a.order - b.order);
    });
  };

  const moveWidgetDown = (id: string) => {
    setWidgets((prev) => {
      const index = prev.findIndex((w) => w.id === id);
      if (index >= prev.length - 1) return prev;

      const newWidgets = [...prev];
      const widget = newWidgets[index];
      const nextWidget = newWidgets[index + 1];

      // Swap orders
      const tempOrder = widget.order;
      newWidgets[index] = { ...widget, order: nextWidget.order };
      newWidgets[index + 1] = { ...nextWidget, order: tempOrder };

      return newWidgets.sort((a, b) => a.order - b.order);
    });
  };

  const resetToDefaults = () => {
    localStorage.removeItem("dashboardWidgets");
    window.location.reload();
  };

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          {t("dashboard.overview", "Dashboard Overview")}
        </h2>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "border-slate-700",
                    isCustomizing && "bg-primary/20 border-primary/50",
                  )}
                  onClick={() => setIsCustomizing(!isCustomizing)}
                >
                  <Settings className="h-4 w-4 mr-1" />
                  {t("dashboard.customize", "Customize")}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {t(
                    "dashboard.customizeTooltip",
                    "Customize your dashboard widgets",
                  )}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {isCustomizing && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-700"
                >
                  <Layers className="h-4 w-4 mr-1" />
                  {t("dashboard.widgetOptions", "Widget Options")}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-slate-800 border-slate-700 text-white">
                {widgets.map((widget) => (
                  <DropdownMenuItem
                    key={widget.id}
                    className="flex items-center justify-between cursor-pointer hover:bg-slate-700"
                    onClick={() => toggleWidgetVisibility(widget.id)}
                  >
                    <span className="flex items-center">
                      {widget.icon}
                      <span className="ml-2">{widget.title}</span>
                    </span>
                    <span
                      className={
                        widget.visible ? "text-green-400" : "text-slate-500"
                      }
                    >
                      {widget.visible ? "✓" : "○"}
                    </span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem
                  className="border-t border-slate-700 mt-2 pt-2 cursor-pointer hover:bg-slate-700 text-red-400"
                  onClick={resetToDefaults}
                >
                  {t("dashboard.resetToDefaults", "Reset to Defaults")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {widgets
          .filter((widget) => widget.visible)
          .sort((a, b) => a.order - b.order)
          .map((widget, index) => (
            <motion.div
              key={widget.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="relative"
            >
              {isCustomizing && (
                <div className="absolute -top-3 -right-3 flex gap-1 z-10">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6 bg-slate-800 border-slate-700 hover:bg-slate-700"
                    onClick={() => moveWidgetUp(widget.id)}
                    disabled={index === 0}
                  >
                    <span className="sr-only">Move up</span>
                    <svg
                      xmlns="{process.env.WWW_W3_ORG_2000_SVG}"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m18 15-6-6-6 6" />
                    </svg>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6 bg-slate-800 border-slate-700 hover:bg-slate-700"
                    onClick={() => moveWidgetDown(widget.id)}
                    disabled={
                      index === widgets.filter((w) => w.visible).length - 1
                    }
                  >
                    <span className="sr-only">Move down</span>
                    <svg
                      xmlns="{process.env.WWW_W3_ORG_2000_SVG}"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6 bg-slate-800 border-slate-700 hover:bg-red-900/50"
                    onClick={() => toggleWidgetVisibility(widget.id)}
                  >
                    <span className="sr-only">Remove</span>
                    <svg
                      xmlns="{process.env.WWW_W3_ORG_2000_SVG}"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                  </Button>
                </div>
              )}

              <Card className="bg-slate-800 border-slate-700 hover:border-primary/50 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    {widget.icon}
                    {widget.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{widget.value}</div>
                  <p className="text-sm text-slate-400 mt-1">
                    {widget.subtitle}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
      </div>
    </div>
  );
};

export default DashboardOverview;

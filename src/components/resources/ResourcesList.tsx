import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BookOpen,
  MoreHorizontal,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  Wrench,
  Truck,
  Briefcase,
  HardHat,
  Settings,
  Hammer,
  Cpu,
  Printer,
  Truck as TruckIcon
} from "lucide-react";
import { Database } from "@/types/supabase";

type Resource = Database["public"]["Tables"]["resources"]["Row"];

interface ResourcesListProps {
  resources: Resource[];
  isLoading: boolean;
  onEditResource: (resource: Resource) => void;
  onDeleteResource: (resourceId: string) => void;
  onViewAllocations: (resource: Resource) => void;
  onViewMaintenance: (resource: Resource) => void;
}

const ResourcesList: React.FC<ResourcesListProps> = ({
  resources,
  isLoading,
  onEditResource,
  onDeleteResource,
  onViewAllocations,
  onViewMaintenance,
}) => {
  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "N/A";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return 'bg-green-500/20 text-green-500';
      case 'in_use':
        return 'bg-blue-500/20 text-blue-500';
      case 'maintenance':
        return 'bg-amber-500/20 text-amber-500';
      case 'retired':
        return 'bg-slate-500/20 text-slate-400';
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getResourceTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'equipment':
        return <Settings className="h-10 w-10 text-blue-500" />;
      case 'vehicle':
        return <Truck className="h-10 w-10 text-emerald-500" />;
      case 'tool':
        return <Wrench className="h-10 w-10 text-amber-500" />;
      case 'machinery':
        return <Hammer className="h-10 w-10 text-purple-500" />;
      case 'electronics':
        return <Cpu className="h-10 w-10 text-rose-500" />;
      case 'office':
        return <Printer className="h-10 w-10 text-slate-500" />;
      case 'personnel':
        return <HardHat className="h-10 w-10 text-indigo-500" />;
      default:
        return <Briefcase className="h-10 w-10 text-slate-500" />;
    }
  };

  const getResourceTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'equipment':
        return 'bg-blue-500/10 border-blue-500/20';
      case 'vehicle':
        return 'bg-emerald-500/10 border-emerald-500/20';
      case 'tool':
        return 'bg-amber-500/10 border-amber-500/20';
      case 'machinery':
        return 'bg-purple-500/10 border-purple-500/20';
      case 'electronics':
        return 'bg-rose-500/10 border-rose-500/20';
      case 'office':
        return 'bg-slate-500/10 border-slate-500/20';
      case 'personnel':
        return 'bg-indigo-500/10 border-indigo-500/20';
      default:
        return 'bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {isLoading ? (
        // Loading skeletons
        Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="bg-slate-800 border-slate-700 h-[250px] animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-6 w-24 bg-slate-700 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-32 bg-slate-700 rounded mb-4"></div>
              <div className="h-4 w-full bg-slate-700 rounded mb-2"></div>
              <div className="h-4 w-2/3 bg-slate-700 rounded mb-4"></div>
            </CardContent>
          </Card>
        ))
      ) : resources.length === 0 ? (
        <div className="col-span-3 text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto text-slate-500 mb-4" />
          <h3 className="text-xl font-medium mb-2">
            No resources found
          </h3>
          <p className="text-slate-400 max-w-md mx-auto mb-6">
            Create your first resource to start managing your assets
          </p>
          <Button>
            Add Resource
          </Button>
        </div>
      ) : (
        resources.map((resource) => (
          <motion.div
            key={resource.id}
            whileHover={{
              y: -5,
              boxShadow: "0 10px 30px -15px rgba(0, 0, 0, 0.3)",
            }}
            className="h-full"
          >
            <Card className={`h-full bg-slate-800 border-slate-700 overflow-hidden ${getResourceTypeColor(resource.type)}`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge className={`${getStatusColor(resource.status)} px-2 py-1 text-xs font-medium`}>
                    {resource.status}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-slate-800 border-slate-700 text-white"
                    >
                      <DropdownMenuLabel>
                        Manage Resource
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-slate-700" />
                      <DropdownMenuItem
                        className="flex items-center cursor-pointer hover:bg-slate-700"
                        onClick={() => onViewAllocations(resource)}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        View Allocations
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex items-center cursor-pointer hover:bg-slate-700"
                        onClick={() => onViewMaintenance(resource)}
                      >
                        <Tool className="mr-2 h-4 w-4" />
                        Maintenance History
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex items-center cursor-pointer hover:bg-slate-700"
                        onClick={() => onEditResource(resource)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-slate-700" />
                      <DropdownMenuItem
                        className="flex items-center cursor-pointer text-red-500 hover:bg-red-500/10 hover:text-red-400"
                        onClick={() => onDeleteResource(resource.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  {getResourceTypeIcon(resource.type)}
                  <div>
                    <CardTitle className="text-xl">{resource.name}</CardTitle>
                    <Badge variant="outline" className="mt-1 capitalize">
                      {resource.type}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-400 mb-4">
                  {resource.description || "No description provided"}
                </CardDescription>

                <div className="flex justify-between text-sm text-slate-400">
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    <span>
                      {formatCurrency(resource.cost_per_day)}/day
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:text-primary hover:bg-primary/10"
                    onClick={() => onViewAllocations(resource)}
                  >
                    <Calendar className="h-4 w-4 mr-1" />
                    Allocations
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))
      )}
    </div>
  );
};

export default ResourcesList;

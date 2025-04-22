import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import {
  Calendar,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  ArrowLeft,
  Plus,
  Briefcase,
  Clock,
  CalendarDays,
  Wrench
} from "lucide-react";
import { Database } from "@/types/supabase";

type Resource = Database["public"]["Tables"]["resources"]["Row"];
type ResourceAllocation = Database["public"]["Tables"]["resource_allocations"]["Row"];
type Project = Database["public"]["Tables"]["projects"]["Row"];

interface ResourceAllocationsProps {
  resource: Resource;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ResourceAllocations: React.FC<ResourceAllocationsProps> = ({
  resource,
  open,
  onOpenChange
}) => {
  const [allocations, setAllocations] = useState<(ResourceAllocation & { project_name?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (open && resource) {
      fetchAllocations();
      fetchProjects();
    }
  }, [open, resource]);

  const fetchAllocations = async () => {
    if (!resource) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("resource_allocations")
        .select("*")
        .eq("resource_id", resource.id)
        .order("start_date", { ascending: false });

      if (error) {
        throw error;
      }

      setAllocations(data || []);
    } catch (error) {
      // Removed console statement
      toast({
        variant: "destructive",
        title: "Error loading allocations",
        description: "Could not load resource allocations. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name");

      if (error) {
        throw error;
      }

      setProjects(data || []);

      // Update allocations with project names
      setAllocations(prevAllocations =>
        prevAllocations.map(allocation => {
          const project = data?.find(p => p.id === allocation.project_id);
          return {
            ...allocation,
            project_name: project?.name
          };
        })
      );
    } catch (error) {
      // Removed console statement
    }
  };

  const handleDeleteAllocation = async (allocationId: string) => {
    try {
      const { error } = await supabase
        .from("resource_allocations")
        .delete()
        .eq("id", allocationId);

      if (error) {
        throw error;
      }

      setAllocations(allocations.filter(allocation => allocation.id !== allocationId));
      toast({
        title: "Allocation deleted",
        description: "The allocation has been deleted successfully",
      });
    } catch (error) {
      // Removed console statement
      toast({
        variant: "destructive",
        title: "Error deleting allocation",
        description: "Could not delete the allocation. Please try again.",
      });
    }
  };

  const filteredAllocations = allocations.filter(allocation =>
    (allocation.project_name && allocation.project_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (allocation.notes && allocation.notes.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {resource?.name} - Allocations
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            View and manage resource allocations
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resource Summary */}
          <Card className="bg-slate-700 border-slate-600">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Resource Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400">Type</p>
                  <p className="font-medium capitalize">{resource.type}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Status</p>
                  <Badge className={`mt-1 px-2 py-1 text-xs font-medium ${
                    resource.status === 'available' ? 'bg-green-500/20 text-green-500' :
                    resource.status === 'in_use' ? 'bg-blue-500/20 text-blue-500' :
                    resource.status === 'maintenance' ? 'bg-amber-500/20 text-amber-500' :
                    'bg-slate-500/20 text-slate-400'
                  }`}>
                    {resource.status}
                  </Badge>
                </div>
                {resource.cost_per_day && (
                  <div>
                    <p className="text-sm text-slate-400">Cost Per Day</p>
                    <p className="font-medium">${resource.cost_per_day}</p>
                  </div>
                )}
                {resource.description && (
                  <div className="col-span-2">
                    <p className="text-sm text-slate-400">Description</p>
                    <p>{resource.description}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Allocations List */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search allocations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 bg-slate-700 border-slate-600"
                />
              </div>
              <Button className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                Add Allocation
              </Button>
            </div>

            <div className="rounded-md border border-slate-700">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Project</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index} className="hover:bg-slate-700/50">
                        <TableCell><Skeleton className="h-6 w-[150px] bg-slate-700" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-[100px] bg-slate-700" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-[100px] bg-slate-700" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-[60px] bg-slate-700" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-[200px] bg-slate-700" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-[80px] bg-slate-700" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredAllocations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {searchQuery
                          ? "No allocations found matching your search"
                          : "No allocations found for this resource"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    <AnimatePresence>
                      {filteredAllocations.map((allocation) => (
                        <motion.tr
                          key={allocation.id}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit={{ opacity: 0, y: -10 }}
                          className="border-b border-slate-700 hover:bg-slate-700/50"
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Briefcase className="h-4 w-4 text-primary" />
                              {allocation.project_name || "Unknown Project"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <CalendarDays className="h-4 w-4 text-slate-500" />
                              {formatDate(allocation.start_date)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <CalendarDays className="h-4 w-4 text-slate-500" />
                              {formatDate(allocation.end_date)}
                            </div>
                          </TableCell>
                          <TableCell>{allocation.quantity || 1}</TableCell>
                          <TableCell>
                            <div className="max-w-[200px] truncate">
                              {allocation.notes || "-"}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700 text-white">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-slate-700" />
                                <DropdownMenuItem
                                  className="flex items-center cursor-pointer hover:bg-slate-700"
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-slate-700" />
                                <DropdownMenuItem
                                  className="flex items-center cursor-pointer text-red-500 hover:bg-red-500/10 hover:text-red-400"
                                  onClick={() => handleDeleteAllocation(allocation.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-1 bg-slate-700 border-slate-600 hover:bg-slate-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Resources
          </Button>
          <div className="text-sm text-muted-foreground">
            {filteredAllocations.length} allocations found
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResourceAllocations;

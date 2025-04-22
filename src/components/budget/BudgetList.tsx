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
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DollarSign,
  MoreHorizontal,
  Edit,
  Trash2,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Clock
} from "lucide-react";
import { Database } from "@/types/supabase";

type Budget = Database["public"]["Tables"]["budgets"]["Row"];
type BudgetWithExpenses = Budget & {
  spent: number;
  remaining: number;
  percentSpent: number;
};

interface BudgetListProps {
  budgets: BudgetWithExpenses[];
  isLoading: boolean;
  onEditBudget: (budget: Budget) => void;
  onDeleteBudget: (budgetId: string) => void;
  onViewExpenses: (budget: Budget) => void;
  onCreateBudget?: () => void;
}

const BudgetList: React.FC<BudgetListProps> = ({
  budgets,
  isLoading,
  onEditBudget,
  onDeleteBudget,
  onViewExpenses,
  onCreateBudget,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-500/20 text-green-500';
      case 'completed':
        return 'bg-blue-500/20 text-blue-500';
      case 'archived':
        return 'bg-slate-500/20 text-slate-400';
      case 'draft':
        return 'bg-amber-500/20 text-amber-500';
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getProgressColor = (percentSpent: number) => {
    if (percentSpent > 90) return "bg-red-500";
    if (percentSpent > 75) return "bg-amber-500";
    return "bg-emerald-500";
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
              <div className="h-2 w-full bg-slate-700 rounded"></div>
            </CardContent>
          </Card>
        ))
      ) : budgets.length === 0 ? (
        <div className="col-span-3 text-center py-12">
          <DollarSign className="h-12 w-12 mx-auto text-slate-500 mb-4" />
          <h3 className="text-xl font-medium mb-2">
            No budgets found
          </h3>
          <p className="text-slate-400 max-w-md mx-auto mb-6">
            Create your first budget to start tracking your expenses
          </p>
          <Button onClick={onCreateBudget}>
            Create Budget
          </Button>
        </div>
      ) : (
        budgets.map((budget) => (
          <motion.div
            key={budget.id}
            whileHover={{
              y: -5,
              boxShadow: "0 10px 30px -15px rgba(0, 0, 0, 0.3)",
            }}
            className="h-full"
          >
            <Card className="h-full bg-slate-800 border-slate-700 overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge className={`${getStatusColor(budget.status)} px-2 py-1 text-xs font-medium`}>
                    {budget.status}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0 cursor-pointer">
                        <MoreHorizontal className="h-4 w-4" />
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-slate-800 border-slate-700 text-white"
                    >
                      <DropdownMenuLabel>
                        Manage Budget
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-slate-700" />
                      <DropdownMenuItem
                        className="flex items-center cursor-pointer hover:bg-slate-700"
                        onClick={() => onViewExpenses(budget)}
                      >
                        <PieChart className="mr-2 h-4 w-4" />
                        View Expenses
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex items-center cursor-pointer hover:bg-slate-700"
                        onClick={() => onEditBudget(budget)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-slate-700" />
                      <DropdownMenuItem
                        className="flex items-center cursor-pointer text-red-500 hover:bg-red-500/10 hover:text-red-400"
                        onClick={() => onDeleteBudget(budget.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardTitle className="mt-2 text-xl">{budget.name}</CardTitle>
                <CardDescription className="text-slate-400">
                  {budget.description || "No description provided"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-2">
                  <div className="text-2xl font-bold">
                    {formatCurrency(budget.total_amount)}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center text-emerald-500">
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                      <span>{formatCurrency(budget.remaining)}</span>
                    </div>
                    <div className="text-slate-400">|</div>
                    <div className="flex items-center text-rose-500">
                      <ArrowDownRight className="h-4 w-4 mr-1" />
                      <span>{formatCurrency(budget.spent)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 mb-4">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Spent: {budget.percentSpent}%</span>
                    <span>Remaining: {100 - budget.percentSpent}%</span>
                  </div>
                  <Progress
                    value={budget.percentSpent}
                    className="h-2 bg-slate-700"
                  />
                </div>

                <div className="flex justify-between text-sm text-slate-400">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>
                      {budget.start_date && new Date(budget.start_date).toLocaleDateString()} -
                      {budget.end_date && new Date(budget.end_date).toLocaleDateString()}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:text-primary hover:bg-primary/10"
                    onClick={() => onViewExpenses(budget)}
                  >
                    <PieChart className="h-4 w-4 mr-1" />
                    Details
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

export default BudgetList;

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
  DollarSign, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  ArrowLeft,
  Plus,
  Receipt,
  Calendar,
  FileText
} from "lucide-react";
import { Database } from "@/types/supabase";

type Budget = Database["public"]["Tables"]["budgets"]["Row"];
type Expense = Database["public"]["Tables"]["expenses"]["Row"];
type BudgetCategory = Database["public"]["Tables"]["budget_categories"]["Row"];

interface ExpensesListProps {
  budget: Budget;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ExpensesList: React.FC<ExpensesListProps> = ({ 
  budget,
  open,
  onOpenChange
}) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalSpent, setTotalSpent] = useState(0);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (open && budget) {
      fetchExpenses();
      fetchCategories();
    }
  }, [open, budget]);

  const fetchExpenses = async () => {
    if (!budget) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("budget_id", budget.id)
        .order("date", { ascending: false });

      if (error) {
        throw error;
      }

      setExpenses(data || []);
      
      // Calculate total spent
      const total = (data || []).reduce((sum, expense) => sum + expense.amount, 0);
      setTotalSpent(total);
      setRemaining(budget.total_amount - total);
    } catch (error) {
      // Removed console statement
      toast({
        variant: "destructive",
        title: "Error loading expenses",
        description: "Could not load expenses. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    if (!budget) return;
    
    try {
      const { data, error } = await supabase
        .from("budget_categories")
        .select("*")
        .eq("budget_id", budget.id)
        .order("name");

      if (error) {
        throw error;
      }

      setCategories(data || []);
    } catch (error) {
      // Removed console statement
    }
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return "Uncategorized";
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : "Uncategorized";
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-500/20 text-green-500';
      case 'pending':
        return 'bg-amber-500/20 text-amber-500';
      case 'rejected':
        return 'bg-red-500/20 text-red-500';
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const filteredExpenses = expenses.filter(expense => 
    expense.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (expense.description && expense.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    getCategoryName(expense.category_id).toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <DollarSign className="h-5 w-5" />
            {budget?.name} - Expenses
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Manage expenses for this budget
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Budget Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(budget.total_amount)}</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Spent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-rose-500">{formatCurrency(totalSpent)}</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Remaining</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-500">{formatCurrency(remaining)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Expenses List */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search expenses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 bg-slate-700 border-slate-600"
                />
              </div>
              <Button className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                Add Expense
              </Button>
            </div>

            <div className="rounded-md border border-slate-700">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index} className="hover:bg-slate-700/50">
                        <TableCell><Skeleton className="h-6 w-[150px] bg-slate-700" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-[100px] bg-slate-700" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-[80px] bg-slate-700" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-[100px] bg-slate-700" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-[80px] bg-slate-700" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-[80px] bg-slate-700" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredExpenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {searchQuery 
                          ? "No expenses found matching your search" 
                          : "No expenses found. Add your first expense!"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    <AnimatePresence>
                      {filteredExpenses.map((expense) => (
                        <motion.tr
                          key={expense.id}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit={{ opacity: 0, y: -10 }}
                          className="border-b border-slate-700 hover:bg-slate-700/50"
                        >
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span>{expense.name}</span>
                              {expense.description && (
                                <span className="text-xs text-slate-400 truncate max-w-[200px]">
                                  {expense.description}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getCategoryName(expense.category_id)}</TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(expense.amount)}
                          </TableCell>
                          <TableCell>
                            {new Date(expense.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(expense.status)} px-2 py-1 text-xs font-medium`}>
                              {expense.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700 text-white">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-slate-700" />
                                {expense.receipt_url && (
                                  <DropdownMenuItem 
                                    className="flex items-center cursor-pointer hover:bg-slate-700"
                                    onClick={() => window.open(expense.receipt_url, '_blank')}
                                  >
                                    <Receipt className="mr-2 h-4 w-4" />
                                    View Receipt
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem 
                                  className="flex items-center cursor-pointer hover:bg-slate-700"
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-slate-700" />
                                <DropdownMenuItem 
                                  className="flex items-center cursor-pointer text-red-500 hover:bg-red-500/10 hover:text-red-400"
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
            Back to Budgets
          </Button>
          <div className="text-sm text-muted-foreground">
            {filteredExpenses.length} expenses found
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExpensesList;

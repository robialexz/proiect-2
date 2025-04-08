import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/supabase";
import { PlusCircle, Search, DollarSign } from "lucide-react";
import BudgetList from "@/components/budget/BudgetList";
import BudgetForm from "@/components/budget/BudgetForm";
import ExpensesList from "@/components/budget/ExpensesList";

type Budget = Database["public"]["Tables"]["budgets"]["Row"];
type BudgetWithExpenses = Budget & {
  spent: number;
  remaining: number;
  percentSpent: number;
};

const BudgetPage: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const [budgets, setBudgets] = useState<BudgetWithExpenses[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isExpensesDialogOpen, setIsExpensesDialogOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

  useEffect(() => {
    if (user) {
      fetchBudgets();
    }
  }, [user]);

  const fetchBudgets = async () => {
    try {
      setIsLoading(true);

      // First, fetch all budgets
      const { data: budgetsData, error: budgetsError } = await supabase
        .from("budgets")
        .select("*")
        .order("created_at", { ascending: false });

      if (budgetsError) throw budgetsError;

      // Then, fetch all expenses to calculate spent amounts
      const { data: expensesData, error: expensesError } = await supabase
        .from("expenses")
        .select("budget_id, amount");

      if (expensesError) throw expensesError;

      // Calculate spent amount for each budget
      const budgetsWithExpenses = (budgetsData || []).map(budget => {
        const budgetExpenses = (expensesData || []).filter(expense => expense.budget_id === budget.id);
        const spent = budgetExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        const remaining = budget.total_amount - spent;
        const percentSpent = budget.total_amount > 0 ? Math.round((spent / budget.total_amount) * 100) : 0;

        return {
          ...budget,
          spent,
          remaining,
          percentSpent
        };
      });

      setBudgets(budgetsWithExpenses);
    } catch (error: any) {
      console.error("Error fetching budgets:", error);
      toast({
        variant: "destructive",
        title: "Error loading budgets",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBudget = async (budgetId: string) => {
    try {
      const { error } = await supabase
        .from("budgets")
        .delete()
        .eq("id", budgetId);

      if (error) throw error;

      setBudgets(budgets.filter((budget) => budget.id !== budgetId));
      toast({
        title: "Budget deleted",
        description: "The budget has been successfully deleted",
      });
    } catch (error: any) {
      console.error("Error deleting budget:", error);
      toast({
        variant: "destructive",
        title: "Error deleting budget",
        description: error.message,
      });
    }
  };

  const handleEditBudget = (budget: Budget) => {
    setSelectedBudget(budget);
    setIsCreateDialogOpen(true);
  };

  const handleViewExpenses = (budget: Budget) => {
    setSelectedBudget(budget);
    setIsExpensesDialogOpen(true);
  };

  const filteredBudgets = budgets.filter(
    (budget) =>
      budget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (budget.description || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-white">{t("common.loading", "Loading...")}</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex h-screen bg-slate-900 text-white">
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800 px-6 py-4 shrink-0">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">
              Budget Management
            </h1>
            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  type="search"
                  placeholder="Search budgets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full bg-slate-800 border-slate-700 focus:ring-primary"
                />
              </div>
              <Button onClick={() => {
                setSelectedBudget(null);
                setIsCreateDialogOpen(true);
              }}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Budget
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <BudgetList
              budgets={filteredBudgets}
              isLoading={isLoading}
              onEditBudget={handleEditBudget}
              onDeleteBudget={handleDeleteBudget}
              onViewExpenses={handleViewExpenses}
              onCreateBudget={() => {
                setSelectedBudget(null);
                setIsCreateDialogOpen(true);
              }}
            />
          </motion.div>
        </main>
      </div>

      {/* Budget Form Dialog */}
      <BudgetForm
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        budget={selectedBudget || undefined}
        onSuccess={fetchBudgets}
      />

      {/* Expenses Dialog */}
      {selectedBudget && (
        <ExpensesList
          budget={selectedBudget}
          open={isExpensesDialogOpen}
          onOpenChange={setIsExpensesDialogOpen}
        />
      )}
    </div>
  );
};

export default BudgetPage;



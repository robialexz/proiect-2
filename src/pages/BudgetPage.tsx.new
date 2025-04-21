import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/supabase";
import {
  PlusCircle,
  Search,
  DollarSign,
  Loader2,
  AlertCircle,
  BarChart3,
  Wallet,
  TrendingUp,
  Filter,
} from "lucide-react";
import BudgetList from "@/components/budget/BudgetList";
import BudgetForm from "@/components/budget/BudgetForm";
import ExpensesList from "@/components/budget/ExpensesList";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  const [isSearching, setIsSearching] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isExpensesDialogOpen, setIsExpensesDialogOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const prefersReducedMotion = useReducedMotion();

  const fetchBudgets = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: budgetsData, error: budgetsError } = await supabase
        .from("budgets")
        .select("*")
        .order("created_at", { ascending: false });

      if (budgetsError) throw budgetsError;

      const { data: expensesData, error: expensesError } = await supabase
        .from("expenses")
        .select("budget_id, amount");

      if (expensesError) throw expensesError;

      const budgetsWithExpenses = (budgetsData || []).map((budget) => {
        const budgetExpenses = (expensesData || []).filter(
          (expense) => expense.budget_id === budget.id
        );
        const spent = budgetExpenses.reduce(
          (sum, expense) => sum + expense.amount,
          0
        );
        const remaining = budget.total_amount - spent;
        const percentSpent =
          budget.total_amount > 0
            ? Math.round((spent / budget.total_amount) * 100)
            : 0;

        return {
          ...budget,
          spent,
          remaining,
          percentSpent,
        };
      });

      setBudgets(budgetsWithExpenses);
    } catch (error: any) {
      console.error("Error fetching budgets:", error);
      setError(error.message);
      toast({
        variant: "destructive",
        title: t("budgets.error.loading", "Error loading budgets"),
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, t]);

  useEffect(() => {
    if (user) {
      fetchBudgets();
    }
  }, [user, fetchBudgets]);

  useEffect(() => {
    if (searchTerm) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        setIsSearching(false);
      }, 300);
      return () => clearTimeout(timer);
    }
    return () => {};
  }, [searchTerm]);

  const handleDeleteBudget = async (budgetId: string) => {
    try {
      const { error } = await supabase
        .from("budgets")
        .delete()
        .eq("id", budgetId);

      if (error) throw error;

      setBudgets(budgets.filter((budget) => budget.id !== budgetId));
      toast({
        title: t("budgets.deleted", "Budget deleted"),
        description: t(
          "budgets.deletedDesc",
          "The budget has been successfully deleted"
        ),
        className: "bg-green-500/10 border-green-500/20 text-green-200",
      });
    } catch (error: any) {
      console.error("Error deleting budget:", error);
      toast({
        variant: "destructive",
        title: t("budgets.error.deleting", "Error deleting budget"),
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

  const filteredBudgets = useMemo(() => {
    let filtered = budgets;

    if (searchTerm) {
      filtered = filtered.filter(
        (budget) =>
          budget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (budget.description || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    if (activeFilter) {
      filtered = filtered.filter((budget) => budget.category === activeFilter);
    }

    return filtered;
  }, [budgets, searchTerm, activeFilter]);

  const budgetStats = useMemo(() => {
    const totalBudget = budgets.reduce(
      (sum, budget) => sum + budget.total_amount,
      0
    );
    const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
    const totalRemaining = totalBudget - totalSpent;
    const overBudgetCount = budgets.filter(
      (budget) => budget.spent > budget.total_amount
    ).length;

    return {
      totalBudget,
      totalSpent,
      totalRemaining,
      overBudgetCount,
      budgetCount: budgets.length,
    };
  }, [budgets]);

  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    budgets.forEach((budget) => {
      if (budget.category) {
        uniqueCategories.add(budget.category);
      }
    });
    return Array.from(uniqueCategories);
  }, [budgets]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  };

  const errorVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3,
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="relative mb-4">
            <motion.div
              className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-0 border-4 border-blue-500/20 rounded-full"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <motion.p
            className="text-blue-400 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {t("common.loading", "Loading...")}
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full bg-blue-500/5 blur-3xl"
          animate={
            prefersReducedMotion
              ? {}
              : {
                  x: [100, 50, 100],
                  y: [-100, -50, -100],
                  scale: [1, 1.1, 1],
                }
          }
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-purple-500/5 blur-3xl"
          animate={
            prefersReducedMotion
              ? {}
              : {
                  x: [-50, -100, -50],
                  y: [50, 100, 50],
                  scale: [1, 1.2, 1],
                }
          }
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full bg-indigo-500/5 blur-3xl"
          animate={
            prefersReducedMotion
              ? {}
              : {
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.6, 0.3],
                }
          }
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <header className="sticky top-0 z-10 bg-gradient-to-r from-slate-900/90 to-slate-800/90 border-b border-slate-700/50 backdrop-blur-sm shadow-lg px-6 py-4 shrink-0">
          <motion.div
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className="flex items-center">
              <motion.h1
                className="text-2xl font-bold bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent"
                whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
              >
                <DollarSign className="inline-block h-6 w-6 mr-2 text-blue-400" />
                {t("budgets.title", "Budget Management")}
              </motion.h1>
              <motion.div
                className="ml-4 px-2 py-1 bg-blue-500/20 rounded-full text-xs font-medium text-blue-300"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                {budgets.length} {budgets.length === 1 ? "budget" : "budgets"}
              </motion.div>
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row items-center gap-3"
              variants={itemVariants}
            >
              <div className="relative flex-1 w-full sm:w-64">
                <Search
                  className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
                    isSearching ? "text-blue-400" : "text-slate-500"
                  } transition-colors`}
                />
                {isSearching && (
                  <motion.div
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
                  </motion.div>
                )}
                <Input
                  type="search"
                  placeholder={t(
                    "budgets.searchPlaceholder",
                    "Search budgets..."
                  )}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10 py-2 bg-slate-800/50 border-slate-700/50 rounded-full focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all shadow-inner"
                  aria-label={t("budgets.searchAriaLabel", "Search budgets")}
                />
              </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                      whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                    >
                      <Button
                        onClick={() => {
                          setSelectedBudget(null);
                          setIsCreateDialogOpen(true);
                        }}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 shadow-md shadow-blue-900/20 border border-blue-600/20 rounded-full px-4 w-full sm:w-auto"
                        aria-label={t(
                          "budgets.createAriaLabel",
                          "Create new budget"
                        )}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        {t("budgets.createButton", "Create Budget")}
                      </Button>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("budgets.tooltips.create", "Create a new budget")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </motion.div>
          </motion.div>
        </header>

        <motion.div
          className="px-6 py-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: t("budgets.stats.totalBudget", "Total Budget"),
                value: new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(budgetStats.totalBudget),
                icon: <Wallet className="h-5 w-5" />,
                color: "from-blue-600 to-blue-800",
                bgColor: "bg-blue-500/10",
                borderColor: "border-blue-500/20",
              },
              {
                title: t("budgets.stats.totalSpent", "Total Spent"),
                value: new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(budgetStats.totalSpent),
                icon: <DollarSign className="h-5 w-5" />,
                color: "from-purple-600 to-purple-800",
                bgColor: "bg-purple-500/10",
                borderColor: "border-purple-500/20",
              },
              {
                title: t("budgets.stats.remaining", "Remaining"),
                value: new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(budgetStats.totalRemaining),
                icon: <BarChart3 className="h-5 w-5" />,
                color: "from-emerald-600 to-emerald-800",
                bgColor: "bg-emerald-500/10",
                borderColor: "border-emerald-500/20",
              },
              {
                title: t("budgets.stats.overBudget", "Over Budget"),
                value: budgetStats.overBudgetCount.toString(),
                icon: <TrendingUp className="h-5 w-5" />,
                color: "from-red-600 to-red-800",
                bgColor: "bg-red-500/10",
                borderColor: "border-red-500/20",
              },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * i + 0.3 }}
                whileHover={prefersReducedMotion ? {} : { y: -5 }}
                className="h-full"
              >
                <Card
                  className={`bg-slate-800/50 backdrop-blur-sm border-slate-700 h-full overflow-hidden relative ${stat.bgColor} border ${stat.borderColor} shadow-lg hover:shadow-xl transition-all duration-300`}
                >
                  <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                    <CardTitle className="text-sm font-medium text-slate-200">
                      {stat.title}
                    </CardTitle>
                    <motion.div
                      className={`p-2 rounded-full bg-gradient-to-br ${stat.color} shadow-md`}
                      whileHover={
                        prefersReducedMotion ? {} : { scale: 1.1, rotate: 5 }
                      }
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {stat.icon}
                    </motion.div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <motion.div
                      className="text-2xl font-bold"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + 0.1 * i }}
                    >
                      {stat.value}
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="px-6 py-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex items-center overflow-x-auto scrollbar-hide pb-2">
            <Filter className="h-4 w-4 text-slate-400 mr-2 flex-shrink-0" />
            <div className="flex space-x-2">
              <motion.button
                key="all"
                className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeFilter === null
                    ? "bg-blue-500 text-white"
                    : "bg-slate-700/50 text-slate-300 hover:bg-slate-700"
                }`}
                onClick={() => setActiveFilter(null)}
                whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
              >
                All Categories
              </motion.button>

              {categories.map((category) => (
                <motion.button
                  key={category}
                  className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    activeFilter === category
                      ? "bg-blue-500 text-white"
                      : "bg-slate-700/50 text-slate-300 hover:bg-slate-700"
                  }`}
                  onClick={() => setActiveFilter(category)}
                  whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                >
                  {category}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="flex-1 px-6 py-4">
          {error && (
            <AnimatePresence>
              <motion.div
                className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-200"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={errorVariants}
              >
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <h3 className="font-medium">
                    {t("common.error", "Error")}
                  </h3>
                </div>
                <p>{error}</p>
              </motion.div>
            </AnimatePresence>
          )}

          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, index) => (
                  <motion.div
                    key={index}
                    className="h-24 bg-slate-800/50 rounded-lg animate-pulse"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                  />
                ))}
              </div>
            ) : (
              <BudgetList
                budgets={filteredBudgets}
                isLoading={false}
                onEditBudget={handleEditBudget}
                onDeleteBudget={handleDeleteBudget}
                onViewExpenses={handleViewExpenses}
                onCreateBudget={() => {
                  setSelectedBudget(null);
                  setIsCreateDialogOpen(true);
                }}
              />
            )}

            {!isLoading && filteredBudgets.length === 0 && (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <motion.div
                  className="inline-block mb-6 p-4 bg-slate-800/50 rounded-full"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                  }}
                >
                  <DollarSign className="h-10 w-10 text-slate-400" />
                </motion.div>
                <motion.h3
                  className="text-xl font-medium mb-2"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {searchTerm || activeFilter
                    ? t("budgets.noResults", "No matching budgets")
                    : t("budgets.noBudgets", "No budgets yet")}
                </motion.h3>
                <motion.p
                  className="text-slate-400 mb-6 max-w-md mx-auto"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {searchTerm || activeFilter
                    ? t(
                        "budgets.tryDifferentSearch",
                        "Try a different search term or filter"
                      )
                    : t(
                        "budgets.createFirstBudgetDesc",
                        "Create your first budget to start tracking your expenses"
                      )}
                </motion.p>

                {!searchTerm && !activeFilter && (
                  <motion.button
                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-full font-medium flex items-center gap-2 mx-auto"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                    whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                  >
                    <PlusCircle className="h-5 w-5" />
                    <span
                      onClick={() => {
                        setSelectedBudget(null);
                        setIsCreateDialogOpen(true);
                      }}
                    >
                      {t("budgets.createFirstBudget", "Create Your")}
                      <span className="hidden sm:inline"> First Budget</span>
                    </span>
                  </motion.button>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      <BudgetForm
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        budget={selectedBudget || undefined}
        onSuccess={fetchBudgets}
      />

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

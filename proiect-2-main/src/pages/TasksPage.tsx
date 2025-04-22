import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import { Search, Filter, CheckCircle2, Clock } from "lucide-react";
import TaskManagement from "@/components/tasks/TaskManagement";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TasksPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

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
            <h1 className="text-2xl font-bold flex items-center">
              <CheckCircle2 className="mr-2 h-6 w-6 text-primary" />
              {t("tasks.title", "Task Management")}
            </h1>
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
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder={t("tasks.searchPlaceholder", "Search tasks...")}
                  className="pl-10 bg-slate-800 border-slate-700"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    {selectedFilter === "all"
                      ? t("tasks.filters.all", "All Tasks")
                      : selectedFilter === "todo"
                      ? t("tasks.filters.todo", "To Do")
                      : selectedFilter === "in_progress"
                      ? t("tasks.filters.inProgress", "In Progress")
                      : selectedFilter === "completed"
                      ? t("tasks.filters.completed", "Completed")
                      : t("tasks.filters.all", "All Tasks")}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-slate-800 border-slate-700 text-white">
                  <DropdownMenuItem
                    className="cursor-pointer hover:bg-slate-700"
                    onClick={() => setSelectedFilter("all")}
                  >
                    {t("tasks.filters.all", "All Tasks")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer hover:bg-slate-700"
                    onClick={() => setSelectedFilter("todo")}
                  >
                    {t("tasks.filters.todo", "To Do")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer hover:bg-slate-700"
                    onClick={() => setSelectedFilter("in_progress")}
                  >
                    {t("tasks.filters.inProgress", "In Progress")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer hover:bg-slate-700"
                    onClick={() => setSelectedFilter("completed")}
                  >
                    {t("tasks.filters.completed", "Completed")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Task Management Component */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle>{t("tasks.management", "Task Management")}</CardTitle>
              </CardHeader>
              <CardContent>
                <TaskManagement />
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default TasksPage;

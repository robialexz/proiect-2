import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter } from "lucide-react";
import { User } from "./TaskManagement";

interface TaskFiltersProps {
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  priorityFilter: string;
  setPriorityFilter: (value: string) => void;
  assigneeFilter: string;
  setAssigneeFilter: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  users: User[];
  clearFilters: () => void;
}

const TaskFilters: React.FC<TaskFiltersProps> = React.memo(({
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  assigneeFilter,
  setAssigneeFilter,
  searchQuery,
  setSearchQuery,
  users,
  clearFilters
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            {t("tasks.filter", "Filter")}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-slate-800 border-slate-700 text-white p-4 w-64">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("tasks.filters.status", "Status")}</Label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white"
              >
                <option value="all">{t("tasks.filters.allStatuses", "All Statuses")}</option>
                <option value="todo">{t("tasks.status.todo", "To Do")}</option>
                <option value="in_progress">{t("tasks.status.inProgress", "In Progress")}</option>
                <option value="completed">{t("tasks.status.completed", "Completed")}</option>
                <option value="blocked">{t("tasks.status.blocked", "Blocked")}</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>{t("tasks.filters.priority", "Priority")}</Label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white"
              >
                <option value="all">{t("tasks.filters.allPriorities", "All Priorities")}</option>
                <option value="low">{t("tasks.priority.low", "Low")}</option>
                <option value="medium">{t("tasks.priority.medium", "Medium")}</option>
                <option value="high">{t("tasks.priority.high", "High")}</option>
                <option value="urgent">{t("tasks.priority.urgent", "Urgent")}</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>{t("tasks.filters.assignee", "Assignee")}</Label>
              <select
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white"
              >
                <option value="all">{t("tasks.filters.allAssignees", "All Assignees")}</option>
                <option value="unassigned">{t("tasks.filters.unassigned", "Unassigned")}</option>
                <option value="me">{t("tasks.filters.assignedToMe", "Assigned to Me")}</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.full_name || user.email}
                  </option>
                ))}
              </select>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={clearFilters}
            >
              {t("tasks.filters.clearAll", "Clear All Filters")}
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <Input
        placeholder={t("tasks.search", "Search tasks...")}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full sm:w-auto min-w-[200px] bg-slate-700 border-slate-600"
      />
    </div>
  );
});

TaskFilters.displayName = "TaskFilters";

export default TaskFilters;

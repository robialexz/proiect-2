import React from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Task } from "./TaskManagement";
import TaskItem from "./TaskItem";

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  hasFilters: boolean;
  onStatusChange: (taskId: string, newStatus: Task["status"]) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  clearFilters: () => void;
}

const TaskList: React.FC<TaskListProps> = React.memo(({
  tasks,
  loading,
  hasFilters,
  onStatusChange,
  onEdit,
  onDelete,
  clearFilters
}) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-800 border border-slate-700 rounded-lg">
        <h3 className="text-xl font-medium mb-2">{t("tasks.noTasks", "No Tasks Found")}</h3>
        <p className="text-slate-400">
          {hasFilters
            ? t("tasks.noTasksFiltered", "No tasks match your current filters.")
            : t("tasks.noTasksYet", "You don't have any tasks yet. Create your first task to get started.")
          }
        </p>
        {hasFilters && (
          <Button
            variant="outline"
            className="mt-4"
            onClick={clearFilters}
          >
            {t("tasks.clearFilters", "Clear Filters")}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onStatusChange={onStatusChange}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
});

TaskList.displayName = "TaskList";

export default TaskList;

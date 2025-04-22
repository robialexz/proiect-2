import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CheckCircle2,
  Clock,
  Calendar,
  User,
  Tag,
  MoreVertical,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Task } from "./TaskManagement";

interface TaskItemProps {
  task: Task;
  onStatusChange: (taskId: string, newStatus: Task["status"]) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = React.memo(({
  task,
  onStatusChange,
  onEdit,
  onDelete
}) => {
  const { t } = useTranslation();

  const getStatusIcon = React.useCallback((status: Task["status"]) => {
    switch (status) {
      case "todo":
        return <Clock className="h-4 w-4 text-slate-400" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-400" />;
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-400" />;
      case "blocked":
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Clock className="h-4 w-4 text-slate-400" />;
    }
  }, []);

  const getPriorityColor = React.useCallback((priority: Task["priority"]) => {
    switch (priority) {
      case "low":
        return "bg-slate-600 text-slate-200";
      case "medium":
        return "bg-blue-600 text-blue-100";
      case "high":
        return "bg-yellow-600 text-yellow-100";
      case "urgent":
        return "bg-red-600 text-red-100";
      default:
        return "bg-slate-600 text-slate-200";
    }
  }, []);

  const formatDate = React.useCallback((dateString: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString();
  }, []);

  const isOverdue = React.useCallback((task: Task) => {
    if (!task.due_date || task.status === "completed") return false;
    const dueDate = new Date(task.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  }, []);

  const handleToggleComplete = React.useCallback(() => {
    onStatusChange(
      task.id,
      task.status === "completed" ? "todo" : "completed"
    );
  }, [task.id, task.status, onStatusChange]);

  const handleEdit = React.useCallback(() => {
    onEdit(task);
  }, [task, onEdit]);

  const handleDelete = React.useCallback(() => {
    onDelete(task.id);
  }, [task.id, onDelete]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors ${task.status === "completed" ? "opacity-70" : ""}`}>
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-3 flex-1">
              <button
                onClick={handleToggleComplete}
                className={`mt-1 flex-shrink-0 h-5 w-5 rounded-full border ${task.status === "completed" ? "bg-green-500 border-green-600" : "border-slate-500"} flex items-center justify-center hover:border-primary transition-colors`}
              >
                {task.status === "completed" && (
                  <CheckCircle2 className="h-4 w-4 text-white" />
                )}
              </button>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`font-medium ${task.status === "completed" ? "line-through text-slate-400" : ""}`}>
                    {task.title}
                  </h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                    {t(`tasks.priority.${task.priority}`, task.priority)}
                  </span>
                </div>

                {task.description && (
                  <p className="text-sm text-slate-400 mb-3">
                    {task.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <div className="flex items-center">
                    {getStatusIcon(task.status)}
                    <span className="ml-1">
                      {t(`tasks.status.${task.status}`, task.status)}
                    </span>
                  </div>

                  {task.due_date && (
                    <div className={`flex items-center ${isOverdue(task) ? "text-red-400" : ""}`}>
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(task.due_date)}
                      {isOverdue(task) && (
                        <span className="ml-1">
                          ({t("tasks.overdue", "Overdue")})
                        </span>
                      )}
                    </div>
                  )}

                  {task.assigned_to && (
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {task.assigned_to_name || t("tasks.assignedUser", "Assigned")}
                    </div>
                  )}

                  {task.tags && task.tags.length > 0 && (
                    <div className="flex items-center">
                      <Tag className="h-4 w-4 mr-1" />
                      {task.tags.join(", ")}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700 text-white">
                <DropdownMenuItem
                  className="flex items-center cursor-pointer hover:bg-slate-700"
                  onClick={handleEdit}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {t("tasks.actions.edit", "Edit")}
                </DropdownMenuItem>

                {task.status !== "completed" && (
                  <DropdownMenuItem
                    className="flex items-center cursor-pointer hover:bg-slate-700"
                    onClick={() => onStatusChange(task.id, "completed")}
                  >
                    <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                    {t("tasks.actions.markComplete", "Mark Complete")}
                  </DropdownMenuItem>
                )}

                {task.status === "completed" && (
                  <DropdownMenuItem
                    className="flex items-center cursor-pointer hover:bg-slate-700"
                    onClick={() => onStatusChange(task.id, "todo")}
                  >
                    <XCircle className="h-4 w-4 mr-2 text-yellow-400" />
                    {t("tasks.actions.markIncomplete", "Mark Incomplete")}
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem
                  className="flex items-center cursor-pointer hover:bg-red-900/20 text-red-400"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t("tasks.actions.delete", "Delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

TaskItem.displayName = "TaskItem";

export default TaskItem;

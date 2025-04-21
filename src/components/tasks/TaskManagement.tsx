import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import TaskFilters from "./TaskFilters";
import TaskForm from "./TaskForm";
import TaskList from "./TaskList";
import { useTasks } from "@/hooks/useTasks";

export interface TaskManagementProps {
  projectId?: string | null;
  className?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "completed" | "blocked";
  priority: "low" | "medium" | "high" | "urgent";
  due_date: string | null;
  assigned_to: string | null;
  assigned_to_name?: string;
  created_at: string;
  project_id: string | null;
  tags: string[] | null;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
}

const TaskManagement: React.FC<TaskManagementProps> = React.memo(({
  projectId = null,
  className,
}) => {
  const { t } = useTranslation();

  // State for dialogs
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  // Use the custom hook for task management
  const {
    tasks,
    loading,
    users,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    assigneeFilter,
    setAssigneeFilter,
    searchQuery,
    setSearchQuery,
    hasFilters,
    clearFilters,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus
  } = useTasks(projectId);

  // New task form state
  const [newTask, setNewTask] = useState<Omit<Task, 'id' | 'created_at'>>({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    due_date: null,
    assigned_to: null,
    project_id: projectId,
    tags: [],
  });

  // Handler functions
  const handleCreateTask = React.useCallback(async () => {
    try {
    const success = await createTask(newTask);
    } catch (error) {
      // Handle error appropriately
    }
    if (success) {
      // Reset form and close dialog
      setNewTask({
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        due_date: null,
        assigned_to: null,
        project_id: projectId,
        tags: [],
      });
      setIsAddTaskOpen(false);
    }
  }, [newTask, createTask, projectId]);

  const handleUpdateTask = React.useCallback(async () => {
    if (!taskToEdit) return;

    try {
    const success = await updateTask(taskToEdit);
    } catch (error) {
      // Handle error appropriately
    }
    if (success) {
      setIsEditTaskOpen(false);
      setTaskToEdit(null);
    }
  }, [taskToEdit, updateTask]);

  const handleEditTask = React.useCallback((task: Task) => {
    setTaskToEdit(task);
    setIsEditTaskOpen(true);
  }, []);

  return (
    <div className={className}>
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">
          {t("tasks.title", "Task Management")}
        </h2>

        <div className="flex flex-wrap gap-2">
          <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t("tasks.addTask", "Add Task")}
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
              <DialogHeader>
                <DialogTitle>{t("tasks.newTask", "New Task")}</DialogTitle>
                <DialogDescription>
                  {t("tasks.newTaskDesc", "Create a new task with details below.")}
                </DialogDescription>
              </DialogHeader>

              <TaskForm
                task={newTask}
                setTask={setNewTask}
                users={users}
                onSubmit={handleCreateTask}
                onCancel={() => setIsAddTaskOpen(false)}
              />
            </DialogContent>
          </Dialog>

          <TaskFilters
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            assigneeFilter={assigneeFilter}
            setAssigneeFilter={setAssigneeFilter}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            users={users}
            clearFilters={clearFilters}
          />
        </div>
      </div>

      <TaskList
        tasks={tasks}
        loading={loading}
        hasFilters={hasFilters}
        onStatusChange={updateTaskStatus}
        onEdit={handleEditTask}
        onDelete={deleteTask}
        clearFilters={clearFilters}
      />

      {/* Edit Task Dialog */}
      <Dialog open={isEditTaskOpen} onOpenChange={setIsEditTaskOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>{t("tasks.editTask", "Edit Task")}</DialogTitle>
            <DialogDescription>
              {t("tasks.editTaskDesc", "Update task details below.")}
            </DialogDescription>
          </DialogHeader>

          {taskToEdit && (
            <TaskForm
              task={taskToEdit}
              setTask={setTaskToEdit}
              users={users}
              onSubmit={handleUpdateTask}
              onCancel={() => setIsEditTaskOpen(false)}
              isEdit
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
});

TaskManagement.displayName = "TaskManagement";

export default TaskManagement;
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CheckCircle2,
  Clock,
  Plus,
  Calendar,
  User,
  Tag,
  MoreVertical,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Filter,
} from "lucide-react";

interface TaskManagementProps {
  projectId?: string | null;
  className?: string;
}

interface Task {
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

interface User {
  id: string;
  email: string;
  full_name?: string;
}

const TaskManagement: React.FC<TaskManagementProps> = ({
  projectId = null,
  className,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

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

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Load tasks when component mounts or projectId changes
  useEffect(() => {
    loadTasks();
    loadUsers();
  }, [projectId]);

  // Apply filters when tasks or filter criteria change
  useEffect(() => {
    applyFilters();
  }, [tasks, statusFilter, priorityFilter, assigneeFilter, searchQuery]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("tasks")
        .select("*, profiles(full_name)")
        .order("created_at", { ascending: false });

      // If projectId is provided, filter by project
      if (projectId) {
        query = query.eq("project_id", projectId);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        const formattedTasks = data.map(task => ({
          ...task,
          assigned_to_name: task.profiles?.full_name || null
        }));
        setTasks(formattedTasks);
        setFilteredTasks(formattedTasks);
      }
    } catch (error: any) {
      console.error("Error loading tasks:", error);
      toast({
        variant: "destructive",
        title: t("tasks.loadError", "Error Loading Tasks"),
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .order("full_name");

      if (error) throw error;

      if (data) {
        setUsers(data);
      }
    } catch (error: any) {
      console.error("Error loading users:", error);
    }
  };

  const applyFilters = () => {
    let filtered = [...tasks];

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    // Apply priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    // Apply assignee filter
    if (assigneeFilter !== "all") {
      if (assigneeFilter === "unassigned") {
        filtered = filtered.filter(task => !task.assigned_to);
      } else if (assigneeFilter === "me" && user) {
        filtered = filtered.filter(task => task.assigned_to === user.id);
      } else {
        filtered = filtered.filter(task => task.assigned_to === assigneeFilter);
      }
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        task =>
          task.title.toLowerCase().includes(query) ||
          (task.description && task.description.toLowerCase().includes(query)) ||
          (task.tags && task.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }

    setFilteredTasks(filtered);
  };

  const createTask = async () => {
    if (!newTask.title.trim()) {
      toast({
        variant: "destructive",
        title: t("tasks.validation.titleRequired", "Title Required"),
        description: t("tasks.validation.pleaseEnterTitle", "Please enter a task title."),
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("tasks")
        .insert([{
          ...newTask,
          project_id: projectId,
          created_by: user?.id
        }])
        .select();

      if (error) throw error;

      toast({
        title: t("tasks.createSuccess", "Task Created"),
        description: t("tasks.createSuccessDesc", "Task has been created successfully."),
      });

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

      // Reload tasks
      loadTasks();
    } catch (error: any) {
      console.error("Error creating task:", error);
      toast({
        variant: "destructive",
        title: t("tasks.createError", "Error Creating Task"),
        description: error.message,
      });
    }
  };

  const updateTask = async () => {
    if (!taskToEdit) return;

    if (!taskToEdit.title.trim()) {
      toast({
        variant: "destructive",
        title: t("tasks.validation.titleRequired", "Title Required"),
        description: t("tasks.validation.pleaseEnterTitle", "Please enter a task title."),
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("tasks")
        .update({
          title: taskToEdit.title,
          description: taskToEdit.description,
          status: taskToEdit.status,
          priority: taskToEdit.priority,
          due_date: taskToEdit.due_date,
          assigned_to: taskToEdit.assigned_to,
          tags: taskToEdit.tags,
        })
        .eq("id", taskToEdit.id)
        .select();

      if (error) throw error;

      toast({
        title: t("tasks.updateSuccess", "Task Updated"),
        description: t("tasks.updateSuccessDesc", "Task has been updated successfully."),
      });

      // Close dialog and reset state
      setIsEditTaskOpen(false);
      setTaskToEdit(null);

      // Reload tasks
      loadTasks();
    } catch (error: any) {
      console.error("Error updating task:", error);
      toast({
        variant: "destructive",
        title: t("tasks.updateError", "Error Updating Task"),
        description: error.message,
      });
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId);

      if (error) throw error;

      toast({
        title: t("tasks.deleteSuccess", "Task Deleted"),
        description: t("tasks.deleteSuccessDesc", "Task has been deleted successfully."),
      });

      // Update local state
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error: any) {
      console.error("Error deleting task:", error);
      toast({
        variant: "destructive",
        title: t("tasks.deleteError", "Error Deleting Task"),
        description: error.message,
      });
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: Task["status"]) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ status: newStatus })
        .eq("id", taskId);

      if (error) throw error;

      // Update local state
      setTasks(tasks.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      ));

      toast({
        title: t("tasks.statusUpdated", "Status Updated"),
        description: t("tasks.statusUpdatedDesc", "Task status has been updated."),
      });
    } catch (error: any) {
      console.error("Error updating task status:", error);
      toast({
        variant: "destructive",
        title: t("tasks.updateError", "Error Updating Task"),
        description: error.message,
      });
    }
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsEditTaskOpen(true);
  };

  const getStatusIcon = (status: Task["status"]) => {
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
  };

  const getPriorityColor = (priority: Task["priority"]) => {
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
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString();
  };

  const isOverdue = (task: Task) => {
    if (!task.due_date || task.status === "completed") return false;
    const dueDate = new Date(task.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

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

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">{t("tasks.form.title", "Title")}*</Label>
                  <Input
                    id="title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    placeholder={t("tasks.form.titlePlaceholder", "Enter task title")}
                    className="bg-slate-700 border-slate-600"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">{t("tasks.form.description", "Description")}</Label>
                  <Textarea
                    id="description"
                    value={newTask.description || ""}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    placeholder={t("tasks.form.descriptionPlaceholder", "Enter task description")}
                    className="bg-slate-700 border-slate-600 min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">{t("tasks.form.status", "Status")}</Label>
                    <select
                      id="status"
                      value={newTask.status}
                      onChange={(e) => setNewTask({...newTask, status: e.target.value as Task["status"]})}
                      className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white"
                    >
                      <option value="todo">{t("tasks.status.todo", "To Do")}</option>
                      <option value="in_progress">{t("tasks.status.inProgress", "In Progress")}</option>
                      <option value="completed">{t("tasks.status.completed", "Completed")}</option>
                      <option value="blocked">{t("tasks.status.blocked", "Blocked")}</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">{t("tasks.form.priority", "Priority")}</Label>
                    <select
                      id="priority"
                      value={newTask.priority}
                      onChange={(e) => setNewTask({...newTask, priority: e.target.value as Task["priority"]})}
                      className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white"
                    >
                      <option value="low">{t("tasks.priority.low", "Low")}</option>
                      <option value="medium">{t("tasks.priority.medium", "Medium")}</option>
                      <option value="high">{t("tasks.priority.high", "High")}</option>
                      <option value="urgent">{t("tasks.priority.urgent", "Urgent")}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="due_date">{t("tasks.form.dueDate", "Due Date")}</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={newTask.due_date || ""}
                      onChange={(e) => setNewTask({...newTask, due_date: e.target.value || null})}
                      className="bg-slate-700 border-slate-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="assigned_to">{t("tasks.form.assignedTo", "Assigned To")}</Label>
                    <select
                      id="assigned_to"
                      value={newTask.assigned_to || ""}
                      onChange={(e) => setNewTask({...newTask, assigned_to: e.target.value || null})}
                      className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white"
                    >
                      <option value="">{t("tasks.form.unassigned", "Unassigned")}</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.full_name || user.email}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">{t("tasks.form.tags", "Tags (comma separated)")}</Label>
                  <Input
                    id="tags"
                    value={newTask.tags ? newTask.tags.join(", ") : ""}
                    onChange={(e) => {
                      const tagsArray = e.target.value.split(",").map(tag => tag.trim()).filter(Boolean);
                      setNewTask({...newTask, tags: tagsArray.length > 0 ? tagsArray : null});
                    }}
                    placeholder={t("tasks.form.tagsPlaceholder", "e.g. frontend, bug, feature")}
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddTaskOpen(false)}>
                  {t("common.cancel", "Cancel")}
                </Button>
                <Button onClick={createTask}>
                  {t("tasks.create", "Create Task")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

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
                  onClick={() => {
                    setStatusFilter("all");
                    setPriorityFilter("all");
                    setAssigneeFilter("all");
                    setSearchQuery("");
                  }}
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
      </div>

      {/* Task list */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-12 bg-slate-800 border border-slate-700 rounded-lg">
          <h3 className="text-xl font-medium mb-2">{t("tasks.noTasks", "No Tasks Found")}</h3>
          <p className="text-slate-400">
            {searchQuery || statusFilter !== "all" || priorityFilter !== "all" || assigneeFilter !== "all"
              ? t("tasks.noTasksFiltered", "No tasks match your current filters.")
              : t("tasks.noTasksYet", "You don't have any tasks yet. Create your first task to get started.")
            }
          </p>
          {(searchQuery || statusFilter !== "all" || priorityFilter !== "all" || assigneeFilter !== "all") && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setStatusFilter("all");
                setPriorityFilter("all");
                setAssigneeFilter("all");
                setSearchQuery("");
              }}
            >
              {t("tasks.clearFilters", "Clear Filters")}
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card className={`bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors ${task.status === "completed" ? "opacity-70" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3 flex-1">
                      <button
                        onClick={() => updateTaskStatus(
                          task.id,
                          task.status === "completed" ? "todo" : "completed"
                        )}
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
                          onClick={() => handleEditTask(task)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          {t("tasks.actions.edit", "Edit")}
                        </DropdownMenuItem>

                        {task.status !== "completed" && (
                          <DropdownMenuItem
                            className="flex items-center cursor-pointer hover:bg-slate-700"
                            onClick={() => updateTaskStatus(task.id, "completed")}
                          >
                            <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                            {t("tasks.actions.markComplete", "Mark Complete")}
                          </DropdownMenuItem>
                        )}

                        {task.status === "completed" && (
                          <DropdownMenuItem
                            className="flex items-center cursor-pointer hover:bg-slate-700"
                            onClick={() => updateTaskStatus(task.id, "todo")}
                          >
                            <XCircle className="h-4 w-4 mr-2 text-yellow-400" />
                            {t("tasks.actions.markIncomplete", "Mark Incomplete")}
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuItem
                          className="flex items-center cursor-pointer hover:bg-red-900/20 text-red-400"
                          onClick={() => deleteTask(task.id)}
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
          ))}
        </div>
      )}

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
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">{t("tasks.form.title", "Title")}*</Label>
                <Input
                  id="edit-title"
                  value={taskToEdit.title}
                  onChange={(e) => setTaskToEdit({...taskToEdit, title: e.target.value})}
                  placeholder={t("tasks.form.titlePlaceholder", "Enter task title")}
                  className="bg-slate-700 border-slate-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">{t("tasks.form.description", "Description")}</Label>
                <Textarea
                  id="edit-description"
                  value={taskToEdit.description || ""}
                  onChange={(e) => setTaskToEdit({...taskToEdit, description: e.target.value})}
                  placeholder={t("tasks.form.descriptionPlaceholder", "Enter task description")}
                  className="bg-slate-700 border-slate-600 min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-status">{t("tasks.form.status", "Status")}</Label>
                  <select
                    id="edit-status"
                    value={taskToEdit.status}
                    onChange={(e) => setTaskToEdit({...taskToEdit, status: e.target.value as Task["status"]})}
                    className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white"
                  >
                    <option value="todo">{t("tasks.status.todo", "To Do")}</option>
                    <option value="in_progress">{t("tasks.status.inProgress", "In Progress")}</option>
                    <option value="completed">{t("tasks.status.completed", "Completed")}</option>
                    <option value="blocked">{t("tasks.status.blocked", "Blocked")}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-priority">{t("tasks.form.priority", "Priority")}</Label>
                  <select
                    id="edit-priority"
                    value={taskToEdit.priority}
                    onChange={(e) => setTaskToEdit({...taskToEdit, priority: e.target.value as Task["priority"]})}
                    className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white"
                  >
                    <option value="low">{t("tasks.priority.low", "Low")}</option>
                    <option value="medium">{t("tasks.priority.medium", "Medium")}</option>
                    <option value="high">{t("tasks.priority.high", "High")}</option>
                    <option value="urgent">{t("tasks.priority.urgent", "Urgent")}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-due-date">{t("tasks.form.dueDate", "Due Date")}</Label>
                  <Input
                    id="edit-due-date"
                    type="date"
                    value={taskToEdit.due_date || ""}
                    onChange={(e) => setTaskToEdit({...taskToEdit, due_date: e.target.value || null})}
                    className="bg-slate-700 border-slate-600"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-assigned-to">{t("tasks.form.assignedTo", "Assigned To")}</Label>
                  <select
                    id="edit-assigned-to"
                    value={taskToEdit.assigned_to || ""}
                    onChange={(e) => setTaskToEdit({...taskToEdit, assigned_to: e.target.value || null})}
                    className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white"
                  >
                    <option value="">{t("tasks.form.unassigned", "Unassigned")}</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.full_name || user.email}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-tags">{t("tasks.form.tags", "Tags (comma separated)")}</Label>
                <Input
                  id="edit-tags"
                  value={taskToEdit.tags ? taskToEdit.tags.join(", ") : ""}
                  onChange={(e) => {
                    const tagsArray = e.target.value.split(",").map(tag => tag.trim()).filter(Boolean);
                    setTaskToEdit({...taskToEdit, tags: tagsArray.length > 0 ? tagsArray : null});
                  }}
                  placeholder={t("tasks.form.tagsPlaceholder", "e.g. frontend, bug, feature")}
                  className="bg-slate-700 border-slate-600"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditTaskOpen(false)}>
              {t("common.cancel", "Cancel")}
            </Button>
            <Button onClick={updateTask}>
              {t("tasks.update", "Update Task")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskManagement;
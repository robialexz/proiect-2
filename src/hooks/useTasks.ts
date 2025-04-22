import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { Task, User } from "@/components/tasks/TaskManagement";

export const useTasks = (projectId: string | null = null) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const loadTasks = useCallback(async () => {
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

      try {
      const { data, error } = await query;
      } catch (error) {
        // Handle error appropriately
      }

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
      // Removed console statement
      toast({
        variant: "destructive",
        title: t("tasks.loadError", "Error Loading Tasks"),
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  }, [projectId, t, toast]);

  const loadUsers = useCallback(async () => {
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
      // Removed console statement
    }
  }, []);

  const applyFilters = useCallback(() => {
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
  }, [tasks, statusFilter, priorityFilter, assigneeFilter, searchQuery, user]);

  const createTask = useCallback(async (newTask: Omit<Task, 'id' | 'created_at'>) => {
    if (!newTask.title.trim()) {
      toast({
        variant: "destructive",
        title: t("tasks.validation.titleRequired", "Title Required"),
        description: t("tasks.validation.pleaseEnterTitle", "Please enter a task title."),
      });
      return false;
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

      // Reload tasks
      loadTasks();
      return true;
    } catch (error: any) {
      // Removed console statement
      toast({
        variant: "destructive",
        title: t("tasks.createError", "Error Creating Task"),
        description: error.message,
      });
      return false;
    }
  }, [projectId, user, loadTasks, t, toast]);

  const updateTask = useCallback(async (taskToEdit: Task) => {
    if (!taskToEdit.title.trim()) {
      toast({
        variant: "destructive",
        title: t("tasks.validation.titleRequired", "Title Required"),
        description: t("tasks.validation.pleaseEnterTitle", "Please enter a task title."),
      });
      return false;
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

      // Reload tasks
      loadTasks();
      return true;
    } catch (error: any) {
      // Removed console statement
      toast({
        variant: "destructive",
        title: t("tasks.updateError", "Error Updating Task"),
        description: error.message,
      });
      return false;
    }
  }, [loadTasks, t, toast]);

  const deleteTask = useCallback(async (taskId: string) => {
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
      return true;
    } catch (error: any) {
      // Removed console statement
      toast({
        variant: "destructive",
        title: t("tasks.deleteError", "Error Deleting Task"),
        description: error.message,
      });
      return false;
    }
  }, [tasks, t, toast]);

  const updateTaskStatus = useCallback(async (taskId: string, newStatus: Task["status"]) => {
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
      return true;
    } catch (error: any) {
      // Removed console statement
      toast({
        variant: "destructive",
        title: t("tasks.updateError", "Error Updating Task"),
        description: error.message,
      });
      return false;
    }
  }, [tasks, t, toast]);

  const clearFilters = useCallback(() => {
    setStatusFilter("all");
    setPriorityFilter("all");
    setAssigneeFilter("all");
    setSearchQuery("");
  }, []);

  // Load tasks when component mounts or projectId changes
  useEffect(() => {
    loadTasks();
    loadUsers();
  }, [loadTasks, loadUsers]);

  // Apply filters when tasks or filter criteria change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const hasFilters = statusFilter !== "all" || priorityFilter !== "all" || assigneeFilter !== "all" || searchQuery !== "";

  return {
    tasks: filteredTasks,
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
    updateTaskStatus,
  };
};

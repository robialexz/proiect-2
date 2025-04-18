import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";
import {
  DialogFooter,
} from "@/components/ui/dialog";
import { Task, User } from "./TaskManagement";

interface TaskFormProps {
  task: Partial<Task>;
  setTask: React.Dispatch<React.SetStateAction<any>>;
  users: User[];
  onSubmit: () => void;
  onCancel: () => void;
  isEdit?: boolean;
}

const TaskForm: React.FC<TaskFormProps> = React.memo(({
  task,
  setTask,
  users,
  onSubmit,
  onCancel,
  isEdit = false
}) => {
  const { t } = useTranslation();

  const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setTask(prev => ({
      ...prev,
      [id.replace('edit-', '')]: value === '' ? null : value
    }));
  }, [setTask]);

  const handleTagsChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const tagsArray = e.target.value.split(",").map(tag => tag.trim()).filter(Boolean);
    setTask(prev => ({
      ...prev,
      tags: tagsArray.length > 0 ? tagsArray : null
    }));
  }, [setTask]);

  const handleStatusChange = React.useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setTask(prev => ({
      ...prev,
      status: e.target.value as Task["status"]
    }));
  }, [setTask]);

  const handlePriorityChange = React.useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setTask(prev => ({
      ...prev,
      priority: e.target.value as Task["priority"]
    }));
  }, [setTask]);

  const handleAssigneeChange = React.useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setTask(prev => ({
      ...prev,
      assigned_to: e.target.value || null
    }));
  }, [setTask]);

  const prefix = isEdit ? "edit-" : "";

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor={`${prefix}title`}>{t("tasks.form.title", "Title")}*</Label>
        <Input
          id={`${prefix}title`}
          value={task.title || ""}
          onChange={handleChange}
          placeholder={t("tasks.form.titlePlaceholder", "Enter task title")}
          className="bg-slate-700 border-slate-600"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${prefix}description`}>{t("tasks.form.description", "Description")}</Label>
        <Textarea
          id={`${prefix}description`}
          value={task.description || ""}
          onChange={handleChange}
          placeholder={t("tasks.form.descriptionPlaceholder", "Enter task description")}
          className="bg-slate-700 border-slate-600 min-h-[100px]"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`${prefix}status`}>{t("tasks.form.status", "Status")}</Label>
          <select
            id={`${prefix}status`}
            value={task.status || "todo"}
            onChange={handleStatusChange}
            className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white"
          >
            <option value="todo">{t("tasks.status.todo", "To Do")}</option>
            <option value="in_progress">{t("tasks.status.inProgress", "In Progress")}</option>
            <option value="completed">{t("tasks.status.completed", "Completed")}</option>
            <option value="blocked">{t("tasks.status.blocked", "Blocked")}</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${prefix}priority`}>{t("tasks.form.priority", "Priority")}</Label>
          <select
            id={`${prefix}priority`}
            value={task.priority || "medium"}
            onChange={handlePriorityChange}
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
          <Label htmlFor={`${prefix}due_date`}>{t("tasks.form.dueDate", "Due Date")}</Label>
          <Input
            id={`${prefix}due_date`}
            type="date"
            value={task.due_date || ""}
            onChange={handleChange}
            className="bg-slate-700 border-slate-600"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${prefix}assigned_to`}>{t("tasks.form.assignedTo", "Assigned To")}</Label>
          <select
            id={`${prefix}assigned_to`}
            value={task.assigned_to || ""}
            onChange={handleAssigneeChange}
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
        <Label htmlFor={`${prefix}tags`}>{t("tasks.form.tags", "Tags (comma separated)")}</Label>
        <Input
          id={`${prefix}tags`}
          value={task.tags ? task.tags.join(", ") : ""}
          onChange={handleTagsChange}
          placeholder={t("tasks.form.tagsPlaceholder", "e.g. frontend, bug, feature")}
          className="bg-slate-700 border-slate-600"
        />
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          {t("common.cancel", "Cancel")}
        </Button>
        <Button onClick={onSubmit}>
          {isEdit 
            ? t("tasks.update", "Update Task") 
            : t("tasks.create", "Create Task")
          }
        </Button>
      </DialogFooter>
    </div>
  );
});

TaskForm.displayName = "TaskForm";

export default TaskForm;

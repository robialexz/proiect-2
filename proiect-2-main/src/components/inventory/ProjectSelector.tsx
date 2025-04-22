import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { Project, ProjectStatus } from "@/models/project.model";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface ProjectSelectorProps {
  selectedProjectId: string | null;
  onProjectChange: (projectId: string | null) => void;
  className?: string;
}

const ProjectSelector: React.FC<ProjectSelectorProps> = React.memo(
  ({ selectedProjectId, onProjectChange, className }) => {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);

    // Folosim hook-ul de autentificare pentru a obține utilizatorul curent
    const { user } = useAuth();

    // Încărcăm proiectele la montare
    useEffect(() => {
      const loadProjects = async () => {
        if (!user) return;

        setLoading(true);
        try {
          // Obținem proiectele utilizatorului din Supabase
          const { data, error } = await supabase
            .from("projects")
            .select("id, name, status")
            .eq("manager_id", user.id)
            .order("name", { ascending: true });

          if (error) {
            throw error;
          }

          // Convertim statusul la tipul ProjectStatus
          const projectsWithCorrectStatus = (data || []).map((project) => ({
            ...project,
            status: project.status as ProjectStatus,
          }));

          setProjects(projectsWithCorrectStatus);
        } catch (error: any) {
          // Removed console statement
          toast({
            title: t(
              "inventory.errors.projectsLoadFailed",
              "Eroare la încărcarea proiectelor"
            ),
            description:
              error.message || "A apărut o eroare la încărcarea proiectelor",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      };

      loadProjects();
    }, [user, t, toast]);

    // Gestionăm schimbarea proiectului
    const handleProjectChange = (value: string) => {
      onProjectChange(value === "all" ? null : value);
    };

    return (
      <div className={className}>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="project-select">
            {t("inventory.projectSelector.label", "Proiect")}
          </Label>
          <Select
            value={selectedProjectId || "all"}
            onValueChange={handleProjectChange}
            disabled={loading}
          >
            <SelectTrigger id="project-select" className="w-full md:w-[250px]">
              <SelectValue
                placeholder={t(
                  "inventory.projectSelector.placeholder",
                  "Selectează un proiect"
                )}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("inventory.projectSelector.allProjects", "Toate proiectele")}
              </SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }
);

ProjectSelector.displayName = "ProjectSelector";

export default ProjectSelector;

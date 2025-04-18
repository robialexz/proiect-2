import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { enhancedSupabaseService } from '@/lib/enhanced-supabase-service';
import { Project } from '@/types';
import { useToast } from '@/components/ui/use-toast';

interface ProjectSelectorProps {
  selectedProjectId: string | null;
  onProjectChange: (projectId: string | null) => void;
  className?: string;
}

const ProjectSelector: React.FC<ProjectSelectorProps> = React.memo(({
  selectedProjectId,
  onProjectChange,
  className
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  // Încărcăm proiectele la montare
  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      try {
        const response = await enhancedSupabaseService.select<Project[]>(
          'projects',
          'id, name, status',
          {
            order: { column: 'name', ascending: true }
          }
        );

        if (response.error) {
          throw new Error(response.error.message);
        }

        setProjects(response.data || []);
      } catch (error) {
        console.error('Error loading projects:', error);
        toast({
          title: t('inventory.errors.projectsLoadFailed', 'Eroare la încărcarea proiectelor'),
          description: error instanceof Error ? error.message : 'A apărut o eroare la încărcarea proiectelor',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [t, toast]);

  // Gestionăm schimbarea proiectului
  const handleProjectChange = (value: string) => {
    onProjectChange(value === 'all' ? null : value);
  };

  return (
    <div className={className}>
      <div className="flex flex-col space-y-1.5">
        <Label htmlFor="project-select">
          {t('inventory.projectSelector.label', 'Proiect')}
        </Label>
        <Select
          value={selectedProjectId || 'all'}
          onValueChange={handleProjectChange}
          disabled={loading}
        >
          <SelectTrigger id="project-select" className="w-full md:w-[250px]">
            <SelectValue placeholder={t('inventory.projectSelector.placeholder', 'Selectează un proiect')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {t('inventory.projectSelector.allProjects', 'Toate proiectele')}
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
});

ProjectSelector.displayName = 'ProjectSelector';

export default ProjectSelector;

import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Material } from '@/types';
import MaterialForm from './MaterialForm';

interface MaterialDialogProps {
  material: Material | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (material: Partial<Material>) => Promise<{ success: boolean; error?: string }>;
  isEdit?: boolean;
}

const MaterialDialog: React.FC<MaterialDialogProps> = ({
  material,
  isOpen,
  onClose,
  onSubmit,
  isEdit = false
}) => {
  const { t } = useTranslation();

  // Gestionăm trimiterea formularului
  const handleSubmit = async (data: Partial<Material>) => {
    try {
    const result = await onSubmit(data);
    } catch (error) {
      // Handle error appropriately
    }
    
    if (result.success) {
      onClose();
    }
    
    return result;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? t('inventory.dialog.editTitle', 'Editează material')
              : t('inventory.dialog.addTitle', 'Adaugă material nou')
            }
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? t('inventory.dialog.editDescription', 'Modifică detaliile materialului')
              : t('inventory.dialog.addDescription', 'Completează detaliile pentru noul material')
            }
          </DialogDescription>
        </DialogHeader>
        
        <MaterialForm
          material={material || undefined}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isEdit={isEdit}
        />
      </DialogContent>
    </Dialog>
  );
};

export default MaterialDialog;

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';
import { Material } from '@/types';

interface DeleteConfirmationDialogProps {
  material: Material | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => Promise<{ success: boolean; error?: string }>;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  material,
  isOpen,
  onClose,
  onConfirm
}) => {
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);

  // Gestionăm confirmarea ștergerii
  const handleConfirm = async () => {
    if (!material) return;
    
    setIsDeleting(true);
    
    try {
      const result = await onConfirm(material.id);
      
      if (result.success) {
        onClose();
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (!material) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t('inventory.delete.title', 'Confirmare ștergere')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t('inventory.delete.description', 'Ești sigur că vrei să ștergi materialul')} <strong>{material.name}</strong>?
            {t('inventory.delete.warning', 'Această acțiune nu poate fi anulată.')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {t('common.cancel', 'Anulează')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('inventory.delete.confirm', 'Șterge')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteConfirmationDialog;

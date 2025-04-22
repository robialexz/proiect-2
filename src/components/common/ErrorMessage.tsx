import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title,
  message,
  onRetry,
}) => {
  const { t } = useTranslation();
  
  return (
    <Alert variant="destructive" className="my-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title || t('common.error', 'Eroare')}</AlertTitle>
      <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
        <span>{message}</span>
        {onRetry && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry}
            className="mt-2 sm:mt-0"
          >
            {t('common.retry', 'Încearcă din nou')}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default ErrorMessage;

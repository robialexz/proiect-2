import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { 
  Plus, 
  Edit, 
  Trash, 
  ArrowUp, 
  ArrowDown, 
  RefreshCw,
  User
} from 'lucide-react';

interface ActivityProps {
  activity: {
    id: string;
    type: 'create' | 'update' | 'delete' | 'increase' | 'decrease' | 'transfer';
    description: string;
    user: string;
    timestamp: string;
  };
}

export const RecentActivityCard: React.FC<ActivityProps> = ({ activity }) => {
  const { t } = useTranslation();
  
  // Funcție pentru a obține iconul în funcție de tipul activității
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'create':
        return <Plus className="h-4 w-4 text-green-500" />;
      case 'update':
        return <Edit className="h-4 w-4 text-blue-500" />;
      case 'delete':
        return <Trash className="h-4 w-4 text-red-500" />;
      case 'increase':
        return <ArrowUp className="h-4 w-4 text-green-500" />;
      case 'decrease':
        return <ArrowDown className="h-4 w-4 text-amber-500" />;
      case 'transfer':
        return <RefreshCw className="h-4 w-4 text-purple-500" />;
      default:
        return <Edit className="h-4 w-4 text-slate-500" />;
    }
  };
  
  // Funcție pentru a obține clasa de culoare pentru background în funcție de tipul activității
  const getActivityBgColor = (type: string) => {
    switch (type) {
      case 'create':
        return 'bg-green-100';
      case 'update':
        return 'bg-blue-100';
      case 'delete':
        return 'bg-red-100';
      case 'increase':
        return 'bg-green-100';
      case 'decrease':
        return 'bg-amber-100';
      case 'transfer':
        return 'bg-purple-100';
      default:
        return 'bg-slate-100';
    }
  };
  
  // Formatăm timpul relativ (ex: "acum 5 minute")
  const timeAgo = formatDistanceToNow(new Date(activity.timestamp), { 
    addSuffix: true,
    locale: ro
  });
  
  return (
    <div className="flex items-start gap-3 p-3 border rounded-lg hover:bg-slate-50 transition-colors">
      <div className={`flex-shrink-0 h-8 w-8 rounded-full ${getActivityBgColor(activity.type)} flex items-center justify-center`}>
        {getActivityIcon(activity.type)}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm">{activity.description}</p>
        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>{activity.user}</span>
          </div>
          <span>•</span>
          <span>{timeAgo}</span>
        </div>
      </div>
    </div>
  );
};

export default RecentActivityCard;

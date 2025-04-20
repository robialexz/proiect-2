import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { UserRoles } from '@/types/supabase-tables';

interface WelcomeMessageProps {
  className?: string;
}

const WelcomeMessage: React.FC<WelcomeMessageProps> = ({ className = '' }) => {
  const { userProfile, userRole } = useAuth();
  const [message, setMessage] = useState<string>('');
  const [timeOfDay, setTimeOfDay] = useState<string>('');

  useEffect(() => {
    // Determinăm momentul zilei
    const hour = new Date().getHours();
    let newTimeOfDay = '';
    
    if (hour >= 5 && hour < 12) {
      newTimeOfDay = 'dimineața';
    } else if (hour >= 12 && hour < 18) {
      newTimeOfDay = 'ziua';
    } else {
      newTimeOfDay = 'seara';
    }
    
    setTimeOfDay(newTimeOfDay);
    
    // Generăm mesajul personalizat în funcție de rol
    if (userProfile && userRole) {
      let newMessage = '';
      
      switch (userRole) {
        case UserRoles.ADMIN:
          newMessage = `Bună ${newTimeOfDay}, șefule!`;
          break;
        case UserRoles.MANAGER:
          newMessage = `Bună ${newTimeOfDay}, manager!`;
          break;
        case UserRoles.TEAM_LEAD:
          newMessage = `Bună ${newTimeOfDay}, team lead!`;
          break;
        case UserRoles.INVENTORY_MANAGER:
          newMessage = `Bună ${newTimeOfDay}, ${userProfile.displayName}!`;
          break;
        case UserRoles.WORKER:
          newMessage = `Bună ${newTimeOfDay}, ${userProfile.displayName}!`;
          break;
        default:
          newMessage = `Bună ${newTimeOfDay}, ${userProfile.displayName}!`;
      }
      
      setMessage(newMessage);
    } else {
      setMessage(`Bună ${newTimeOfDay}!`);
    }
  }, [userProfile, userRole]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`text-sm bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700 ${className}`}
    >
      <span className="text-slate-300 font-medium">{message}</span>
    </motion.div>
  );
};

export default WelcomeMessage;

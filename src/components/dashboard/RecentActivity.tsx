import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Package,
  Users,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActivityItem {
  id: string;
  type:
    | "inventory"
    | "team"
    | "document"
    | "alert"
    | "success"
    | "pending"
    | "delivery";
  title: string;
  description: string;
  time: string;
  read: boolean;
}

interface RecentActivityProps {
  className?: string;
}

const RecentActivity = ({ className = "" }: RecentActivityProps) => {
  const { t } = useTranslation();
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  // Simulate fetching activities from an API
  useEffect(() => {
    // In a real app, this would be an API call
    const mockActivities: ActivityItem[] = [
      {
        id: "1",
        type: "inventory",
        title: t("New Material Added"),
        description: t("Steel Pipes - 50 units added to inventory"),
        time: "10 min ago",
        read: false,
      },
      {
        id: "2",
        type: "team",
        title: t("Team Member Joined"),
        description: t("Alex Popescu joined the procurement team"),
        time: "1 hour ago",
        read: false,
      },
      {
        id: "3",
        type: "alert",
        title: t("Low Stock Alert"),
        description: t("Concrete Mix is running low (5 units remaining)"),
        time: "2 hours ago",
        read: true,
      },
      {
        id: "4",
        type: "document",
        title: t("Document Updated"),
        description: t("Project A specifications updated by Maria"),
        time: "Yesterday",
        read: true,
      },
      {
        id: "5",
        type: "success",
        title: t("Order Completed"),
        description: t("Order #1234 has been successfully fulfilled"),
        time: "Yesterday",
        read: true,
      },
      {
        id: "6",
        type: "delivery",
        title: t("New Delivery"),
        description: t("Supplier XYZ scheduled a delivery for tomorrow"),
        time: "2 days ago",
        read: true,
      },
    ];

    setActivities(mockActivities);
  }, [t]);

  const markAsRead = (id: string) => {
    setActivities((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
  };

  const markAllAsRead = () => {
    setActivities((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const getIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "inventory":
        return <Package className="h-5 w-5 text-secondary" />;
      case "team":
        return <Users className="h-5 w-5 text-success" />;
      case "document":
        return <FileText className="h-5 w-5 text-primary" />;
      case "alert":
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      case "success":
        return <CheckCircle className="h-5 w-5 text-success" />;
      case "pending":
        return <Clock className="h-5 w-5 text-warning" />;
      case "delivery":
        return <Truck className="h-5 w-5 text-info" />;
      default:
        return <Package className="h-5 w-5 text-secondary" />;
    }
  };

  return (
    <div className={`${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{t("Recent Activity")}</h2>
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-400 hover:text-white"
          onClick={markAllAsRead}
        >
          {t("Mark all as read")}
        </Button>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {activities.length > 0 ? (
          activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              className={`p-3 rounded-lg flex items-start gap-3 ${activity.read ? "bg-slate-800/50" : "bg-slate-800 border-l-4 border-primary"}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              onClick={() => markAsRead(activity.id)}
            >
              <div className="p-2 rounded-full bg-slate-700">
                {getIcon(activity.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium">{activity.title}</h3>
                  <span className="text-xs text-slate-400">
                    {activity.time}
                  </span>
                </div>
                <p className="text-sm text-slate-400 mt-1">
                  {activity.description}
                </p>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-8 text-slate-400">
            <p>{t("No recent activity")}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;

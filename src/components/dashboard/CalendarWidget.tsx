import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useAuth } from "@/contexts/AuthContext";

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  location?: string;
  isAllDay?: boolean;
}

interface CalendarWidgetProps {
  className?: string;
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({ className = "" }) => {
  const { t } = useTranslation();
  const { userProfile } = useAuth();
  const [date, setDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<"month" | "day">("month");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Mock events - in a real app, these would come from the Microsoft Graph API
  useEffect(() => {
    // Simulate loading events
    const mockEvents: CalendarEvent[] = [
      {
        id: "1",
        title: "Team Meeting",
        start: new Date(new Date().setHours(10, 0, 0, 0)),
        end: new Date(new Date().setHours(11, 30, 0, 0)),
        location: "Conference Room A",
      },
      {
        id: "2",
        title: "Project Review",
        start: new Date(new Date().setHours(14, 0, 0, 0)),
        end: new Date(new Date().setHours(15, 0, 0, 0)),
        location: "Online",
      },
      {
        id: "3",
        title: "Client Call",
        start: new Date(new Date().setDate(new Date().getDate() + 1)).setHours(
          11,
          0,
          0,
          0,
        ),
        end: new Date(new Date().setDate(new Date().getDate() + 1)).setHours(
          12,
          0,
          0,
          0,
        ),
        location: "Phone",
      },
      {
        id: "4",
        title: "Site Visit",
        start: new Date(new Date().setDate(new Date().getDate() + 2)),
        end: new Date(new Date().setDate(new Date().getDate() + 2)),
        isAllDay: true,
        location: "Construction Site",
      },
    ];

    setEvents(mockEvents);
  }, []);

  const connectToOutlook = () => {
    setIsLoading(true);
    // In a real implementation, this would initiate the OAuth flow with Microsoft
    setTimeout(() => {
      setIsConnected(true);
      setIsLoading(false);
    }, 1500);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const getDayEvents = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.start);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setCurrentView("day");
    }
  };

  return (
    <div className={`${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{t("Calendar")}</h2>
        {isConnected ? (
          <Button variant="outline" size="sm" className="gap-2">
            <ExternalLink className="h-4 w-4" />
            {t("Open in Outlook")}
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={connectToOutlook}
            disabled={isLoading}
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            {isLoading ? t("Connecting...") : t("Connect to Outlook")}
          </Button>
        )}
      </div>

      {isConnected ? (
        <div>
          {currentView === "month" ? (
            <div className="bg-slate-800/50 rounded-lg p-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                className="rounded-md border-slate-700"
              />
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">
                  {t("Upcoming Events")}
                </h3>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {events.length > 0 ? (
                    events
                      .filter((event) => new Date(event.start) >= new Date())
                      .sort(
                        (a, b) =>
                          new Date(a.start).getTime() -
                          new Date(b.start).getTime(),
                      )
                      .slice(0, 3)
                      .map((event) => (
                        <div
                          key={event.id}
                          className="p-2 bg-slate-700/50 rounded-md hover:bg-slate-700 transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-sm">
                              {event.title}
                            </h4>
                            {event.isAllDay ? (
                              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                                {t("All Day")}
                              </span>
                            ) : null}
                          </div>
                          <p className="text-xs text-slate-400 mt-1">
                            {formatDate(new Date(event.start))}{" "}
                            {!event.isAllDay
                              ? `${formatTime(new Date(event.start))} - ${formatTime(new Date(event.end))}`
                              : ""}
                          </p>
                          {event.location && (
                            <p className="text-xs text-slate-500 mt-0.5">
                              {event.location}
                            </p>
                          )}
                        </div>
                      ))
                  ) : (
                    <p className="text-sm text-slate-400">
                      {t("No upcoming events")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentView("month")}
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {t("Month View")}
                </Button>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon" onClick={handlePrevDay}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">
                    {formatDate(selectedDate)}
                  </span>
                  <Button variant="ghost" size="icon" onClick={handleNextDay}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {getDayEvents(selectedDate).length > 0 ? (
                  getDayEvents(selectedDate)
                    .sort(
                      (a, b) =>
                        new Date(a.start).getTime() -
                        new Date(b.start).getTime(),
                    )
                    .map((event) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="p-3 bg-slate-700/50 rounded-md hover:bg-slate-700 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">{event.title}</h4>
                          {event.isAllDay ? (
                            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                              {t("All Day")}
                            </span>
                          ) : null}
                        </div>
                        {!event.isAllDay && (
                          <p className="text-sm text-slate-400 mt-1">
                            {formatTime(new Date(event.start))} -{" "}
                            {formatTime(new Date(event.end))}
                          </p>
                        )}
                        {event.location && (
                          <p className="text-sm text-slate-500 mt-1">
                            {event.location}
                          </p>
                        )}
                      </motion.div>
                    ))
                ) : (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-12 w-12 mx-auto text-slate-600 mb-2" />
                    <p className="text-slate-400">
                      {t("No events for this day")}
                    </p>
                    <Button variant="outline" size="sm" className="mt-4 gap-2">
                      <Plus className="h-4 w-4" />
                      {t("Add Event")}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 bg-slate-800/50 rounded-lg">
          <CalendarIcon className="h-16 w-16 mx-auto mb-2 text-slate-500" />
          <p className="text-slate-400 mb-4">
            {t(
              "Connect your Outlook calendar to view and manage your schedule",
            )}
          </p>
          <Button onClick={connectToOutlook} disabled={isLoading}>
            {isLoading ? t("Connecting...") : t("Connect Calendar")}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CalendarWidget;

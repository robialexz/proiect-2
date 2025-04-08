import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Users,
  X,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isToday,
  addWeeks,
  subWeeks,
} from "date-fns";

interface Event {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  location?: string;
  description?: string;
  attendees?: string[];
  project?: string;
  type: "meeting" | "delivery" | "inspection" | "deadline" | "other";
}

const SchedulePage: React.FC = () => {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const { toast } = useToast();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );
  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = useState(false);
  const [isViewEventDialogOpen, setIsViewEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const [newEvent, setNewEvent] = useState<Omit<Event, "id">>({
    title: "",
    date: new Date(),
    startTime: "09:00",
    endTime: "10:00",
    location: "",
    description: "",
    project: "",
    type: "meeting",
  });

  // Mock events data
  const [events, setEvents] = useState<Event[]>([
    {
      id: "1",
      title: "Team Meeting",
      date: new Date(),
      startTime: "10:00",
      endTime: "11:30",
      location: "Conference Room A",
      description: "Weekly team meeting to discuss project progress",
      attendees: ["John Doe", "Maria Smith", "Alex Johnson"],
      project: "Office Building Renovation",
      type: "meeting",
    },
    {
      id: "2",
      title: "Site Inspection",
      date: addDays(new Date(), 1),
      startTime: "14:00",
      endTime: "16:00",
      location: "Construction Site",
      description: "Inspect the progress of the foundation work",
      attendees: ["John Doe", "Sarah Williams"],
      project: "Residential Complex Phase 1",
      type: "inspection",
    },
    {
      id: "3",
      title: "Material Delivery",
      date: addDays(new Date(), 2),
      startTime: "09:00",
      endTime: "11:00",
      location: "Construction Site",
      description: "Delivery of steel beams and concrete",
      project: "Highway Bridge Repair",
      type: "delivery",
    },
    {
      id: "4",
      title: "Project Deadline",
      date: addDays(new Date(), 4),
      startTime: "18:00",
      endTime: "18:00",
      description: "Final deadline for phase 1 completion",
      project: "Shopping Mall Extension",
      type: "deadline",
    },
  ]);

  const weekDays = eachDayOfInterval({
    start: currentWeekStart,
    end: endOfWeek(currentWeekStart, { weekStartsOn: 1 }),
  });

  const handlePrevWeek = () => {
    setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setNewEvent((prev) => ({ ...prev, date }));
  };

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.startTime || !newEvent.endTime) {
      toast({
        variant: "destructive",
        title: t("Missing Information"),
        description: t("Please fill in all required fields."),
      });
      return;
    }

    const newEventWithId: Event = {
      ...newEvent,
      id: Date.now().toString(),
    };

    setEvents((prev) => [...prev, newEventWithId]);
    setIsAddEventDialogOpen(false);
    setNewEvent({
      title: "",
      date: new Date(),
      startTime: "09:00",
      endTime: "10:00",
      location: "",
      description: "",
      project: "",
      type: "meeting",
    });

    toast({
      title: t("Event Added"),
      description: t("Your event has been successfully added to the calendar."),
    });
  };

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((event) => event.id !== id));
    setIsViewEventDialogOpen(false);
    setSelectedEvent(null);

    toast({
      title: t("Event Deleted"),
      description: t("The event has been removed from your calendar."),
    });
  };

  const getEventTypeColor = (type: Event["type"]) => {
    switch (type) {
      case "meeting":
        return "bg-blue-500/20 text-blue-500 border-blue-500/20";
      case "delivery":
        return "bg-green-500/20 text-green-500 border-green-500/20";
      case "inspection":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/20";
      case "deadline":
        return "bg-red-500/20 text-red-500 border-red-500/20";
      default:
        return "bg-slate-500/20 text-slate-500 border-slate-500/20";
    }
  };

  const getEventsForDay = (date: Date) => {
    return events.filter((event) => isSameDay(new Date(event.date), date));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-white">{t("common.loading", "Loading...")}</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex h-screen bg-slate-900 text-white">
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800 px-6 py-4 shrink-0">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold flex items-center">
              <CalendarIcon className="mr-2 h-6 w-6 text-primary" />
              {t("Schedule")}
            </h1>
            <Dialog
              open={isAddEventDialogOpen}
              onOpenChange={setIsAddEventDialogOpen}
            >
              <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2">
                <Plus className="mr-2 h-4 w-4" />
                {t("Add Event")}
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700 text-white">
                <DialogHeader>
                  <DialogTitle>{t("Add New Event")}</DialogTitle>
                  <DialogDescription className="text-slate-400">
                    {t(
                      "Fill in the details to add a new event to your calendar.",
                    )}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">{t("Event Title")}</Label>
                    <Input
                      id="title"
                      value={newEvent.title}
                      onChange={(e) =>
                        setNewEvent((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder={t("Enter event title")}
                      className="bg-slate-700 border-slate-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t("Date")}</Label>
                    <Calendar
                      mode="single"
                      selected={newEvent.date}
                      onSelect={(date) => date && handleDateSelect(date)}
                      className="rounded-md border border-slate-700 bg-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startTime">{t("Start Time")}</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={newEvent.startTime}
                        onChange={(e) =>
                          setNewEvent((prev) => ({
                            ...prev,
                            startTime: e.target.value,
                          }))
                        }
                        className="bg-slate-700 border-slate-600"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endTime">{t("End Time")}</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={newEvent.endTime}
                        onChange={(e) =>
                          setNewEvent((prev) => ({
                            ...prev,
                            endTime: e.target.value,
                          }))
                        }
                        className="bg-slate-700 border-slate-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">{t("Location")}</Label>
                    <Input
                      id="location"
                      value={newEvent.location || ""}
                      onChange={(e) =>
                        setNewEvent((prev) => ({
                          ...prev,
                          location: e.target.value,
                        }))
                      }
                      placeholder={t("Enter location")}
                      className="bg-slate-700 border-slate-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="project">{t("Project")}</Label>
                    <Select
                      value={newEvent.project || ""}
                      onValueChange={(value) =>
                        setNewEvent((prev) => ({ ...prev, project: value }))
                      }
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600">
                        <SelectValue placeholder={t("Select project")} />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="Office Building Renovation">
                          {t("Office Building Renovation")}
                        </SelectItem>
                        <SelectItem value="Residential Complex Phase 1">
                          {t("Residential Complex Phase 1")}
                        </SelectItem>
                        <SelectItem value="Highway Bridge Repair">
                          {t("Highway Bridge Repair")}
                        </SelectItem>
                        <SelectItem value="Shopping Mall Extension">
                          {t("Shopping Mall Extension")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">{t("Event Type")}</Label>
                    <Select
                      value={newEvent.type}
                      onValueChange={(value: Event["type"]) =>
                        setNewEvent((prev) => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600">
                        <SelectValue placeholder={t("Select event type")} />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="meeting">{t("Meeting")}</SelectItem>
                        <SelectItem value="delivery">
                          {t("Delivery")}
                        </SelectItem>
                        <SelectItem value="inspection">
                          {t("Inspection")}
                        </SelectItem>
                        <SelectItem value="deadline">
                          {t("Deadline")}
                        </SelectItem>
                        <SelectItem value="other">{t("Other")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">{t("Description")}</Label>
                    <Textarea
                      id="description"
                      value={newEvent.description || ""}
                      onChange={(e) =>
                        setNewEvent((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder={t("Enter event description")}
                      className="bg-slate-700 border-slate-600 min-h-[80px]"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddEventDialogOpen(false)}
                  >
                    {t("Cancel")}
                  </Button>
                  <Button onClick={handleAddEvent}>{t("Add Event")}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Calendar Navigation */}
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={handlePrevWeek}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                {t("Previous Week")}
              </Button>

              <h2 className="text-xl font-semibold">
                {format(currentWeekStart, "MMMM d")} -{" "}
                {format(
                  endOfWeek(currentWeekStart, { weekStartsOn: 1 }),
                  "MMMM d, yyyy",
                )}
              </h2>

              <Button variant="outline" size="sm" onClick={handleNextWeek}>
                {t("Next Week")}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>

            {/* Weekly Calendar View */}
            <div className="grid grid-cols-7 gap-4">
              {weekDays.map((day, index) => (
                <div key={index} className="min-h-[500px]">
                  <div
                    className={`text-center p-2 rounded-t-lg ${isToday(day) ? "bg-primary/20 text-primary" : "bg-slate-800"}`}
                  >
                    <div className="text-sm font-medium">
                      {format(day, "EEE")}
                    </div>
                    <div
                      className={`text-xl ${isToday(day) ? "font-bold" : ""}`}
                    >
                      {format(day, "d")}
                    </div>
                  </div>

                  <div className="bg-slate-800/50 rounded-b-lg p-2 h-full">
                    {getEventsForDay(day).length > 0 ? (
                      <div className="space-y-2">
                        {getEventsForDay(day).map((event) => (
                          <div
                            key={event.id}
                            className={`p-2 rounded-lg cursor-pointer ${getEventTypeColor(event.type)}`}
                            onClick={() => {
                              setSelectedEvent(event);
                              setIsViewEventDialogOpen(true);
                            }}
                          >
                            <div className="font-medium truncate">
                              {event.title}
                            </div>
                            <div className="text-xs flex items-center mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              {event.startTime} - {event.endTime}
                            </div>
                            {event.location && (
                              <div className="text-xs flex items-center mt-1">
                                <MapPin className="h-3 w-3 mr-1" />
                                {event.location}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full opacity-50">
                        <p className="text-xs text-slate-400">
                          {t("No events")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* View Event Dialog */}
            <Dialog
              open={isViewEventDialogOpen}
              onOpenChange={setIsViewEventDialogOpen}
            >
              <DialogContent className="bg-slate-800 border-slate-700 text-white">
                {selectedEvent && (
                  <>
                    <DialogHeader>
                      <div className="flex justify-between items-start">
                        <DialogTitle className="text-xl">
                          {selectedEvent.title}
                        </DialogTitle>
                        <div
                          className={`px-2 py-1 rounded-full text-xs ${getEventTypeColor(selectedEvent.type)}`}
                        >
                          {t(
                            selectedEvent.type.charAt(0).toUpperCase() +
                              selectedEvent.type.slice(1),
                          )}
                        </div>
                      </div>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-slate-400" />
                        <span>
                          {format(
                            new Date(selectedEvent.date),
                            "EEEE, MMMM d, yyyy",
                          )}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-slate-400" />
                        <span>
                          {selectedEvent.startTime} - {selectedEvent.endTime}
                        </span>
                      </div>

                      {selectedEvent.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-slate-400" />
                          <span>{selectedEvent.location}</span>
                        </div>
                      )}

                      {selectedEvent.project && (
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-5 w-5 text-slate-400" />
                          <span>{selectedEvent.project}</span>
                        </div>
                      )}

                      {selectedEvent.attendees &&
                        selectedEvent.attendees.length > 0 && (
                          <div className="flex items-start gap-2">
                            <Users className="h-5 w-5 text-slate-400 mt-0.5" />
                            <div>
                              <p className="font-medium mb-1">
                                {t("Attendees")}:
                              </p>
                              <div className="space-y-1">
                                {selectedEvent.attendees.map(
                                  (attendee, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center gap-2"
                                    >
                                      <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center">
                                        {attendee.charAt(0)}
                                      </div>
                                      <span>{attendee}</span>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                      {selectedEvent.description && (
                        <div className="mt-4">
                          <p className="font-medium mb-1">
                            {t("Description")}:
                          </p>
                          <p className="text-slate-300 bg-slate-700/50 p-3 rounded-md">
                            {selectedEvent.description}
                          </p>
                        </div>
                      )}
                    </div>

                    <DialogFooter>
                      <Button
                        variant="destructive"
                        onClick={() => handleDeleteEvent(selectedEvent.id)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        {t("Delete Event")}
                      </Button>
                      <Button onClick={() => setIsViewEventDialogOpen(false)}>
                        {t("Close")}
                      </Button>
                    </DialogFooter>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default SchedulePage;



import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { CalendarIcon, ChevronLeft, ChevronRight, Plus, MoreHorizontal, Trash, Edit, Clock, Users, MapPin } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// Tipuri pentru evenimente
interface Event {
  id: string;
  title: string;
  description?: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  location?: string;
  participants?: string[];
  color: string;
}

// Componenta pentru un eveniment în calendar
const CalendarEvent = ({ 
  event, 
  onClick 
}: { 
  event: Event; 
  onClick: (event: Event) => void;
}) => {
  return (
    <div
      className={`p-2 rounded-md mb-1 cursor-pointer hover:opacity-90 transition-opacity text-white`}
      style={{ backgroundColor: event.color }}
      onClick={() => onClick(event)}
    >
      <div className="flex justify-between items-start">
        <div className="font-medium truncate">{event.title}</div>
      </div>
      {event.startTime && (
        <div className="text-xs flex items-center mt-1">
          <Clock className="h-3 w-3 mr-1" />
          {event.startTime} {event.endTime ? `- ${event.endTime}` : ''}
        </div>
      )}
    </div>
  );
};

// Componenta pentru o zi în calendar
const CalendarDay = ({ 
  date, 
  events, 
  isCurrentMonth, 
  isToday,
  onEventClick,
  onAddEvent
}: { 
  date: Date; 
  events: Event[]; 
  isCurrentMonth: boolean;
  isToday: boolean;
  onEventClick: (event: Event) => void;
  onAddEvent: (date: Date) => void;
}) => {
  return (
    <div className={`border border-slate-700 p-1 min-h-[120px] ${isCurrentMonth ? 'bg-slate-800' : 'bg-slate-900 opacity-50'}`}>
      <div className="flex justify-between items-center mb-1">
        <span className={`text-sm font-medium ${isToday ? 'bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : ''}`}>
          {date.getDate()}
        </span>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-5 w-5 text-slate-400 hover:text-white"
          onClick={() => onAddEvent(date)}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
      <div className="space-y-1">
        {events.map((event) => (
          <CalendarEvent key={event.id} event={event} onClick={onEventClick} />
        ))}
      </div>
    </div>
  );
};

// Pagina principală de calendar
const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isViewEventOpen, setIsViewEventOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [newEventDate, setNewEventDate] = useState<Date>(new Date());
  
  // State pentru noul eveniment
  const [newEvent, setNewEvent] = useState<Omit<Event, 'id'>>({
    title: '',
    description: '',
    date: new Date(),
    startTime: '',
    endTime: '',
    location: '',
    participants: [],
    color: '#4f46e5', // Indigo
  });
  
  const { toast } = useToast();
  
  // Încărcăm evenimentele
  useEffect(() => {
    // Simulăm încărcarea evenimentelor
    const demoEvents: Event[] = [
      {
        id: '1',
        title: 'Întâlnire cu echipa',
        description: 'Discuție despre progresul proiectului',
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
        startTime: '10:00',
        endTime: '11:30',
        location: 'Sala de conferințe',
        participants: ['Alexandru', 'Maria', 'Ion'],
        color: '#4f46e5', // Indigo
      },
      {
        id: '2',
        title: 'Prezentare client',
        description: 'Prezentarea progresului pentru clientul X',
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 18),
        startTime: '14:00',
        endTime: '15:30',
        location: 'Online - Zoom',
        participants: ['Alexandru', 'Client X'],
        color: '#0ea5e9', // Sky
      },
      {
        id: '3',
        title: 'Deadline proiect',
        description: 'Termen limită pentru livrarea proiectului',
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 25),
        color: '#ef4444', // Red
      },
      {
        id: '4',
        title: 'Training',
        description: 'Training pentru noile tehnologii',
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 10),
        startTime: '09:00',
        endTime: '17:00',
        location: 'Sala de training',
        color: '#10b981', // Emerald
      },
    ];
    
    setEvents(demoEvents);
  }, []);
  
  // Generăm zilele pentru calendar
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Prima zi a lunii
    const firstDayOfMonth = new Date(year, month, 1);
    // Ultima zi a lunii
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // Ziua săptămânii pentru prima zi a lunii (0 = Duminică, 1 = Luni, etc.)
    let firstDayOfWeek = firstDayOfMonth.getDay();
    // Ajustăm pentru a începe săptămâna cu Luni (0 = Luni, 1 = Marți, etc.)
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    // Numărul de zile din luna curentă
    const daysInMonth = lastDayOfMonth.getDate();
    
    // Generăm zilele pentru afișare
    const days: Date[] = [];
    
    // Adăugăm zilele din luna anterioară pentru a completa prima săptămână
    for (let i = 0; i < firstDayOfWeek; i++) {
      const day = new Date(year, month, -firstDayOfWeek + i + 1);
      days.push(day);
    }
    
    // Adăugăm zilele din luna curentă
    for (let i = 1; i <= daysInMonth; i++) {
      const day = new Date(year, month, i);
      days.push(day);
    }
    
    // Adăugăm zilele din luna următoare pentru a completa ultima săptămână
    const remainingDays = 42 - days.length; // 6 săptămâni x 7 zile = 42
    for (let i = 1; i <= remainingDays; i++) {
      const day = new Date(year, month + 1, i);
      days.push(day);
    }
    
    return days;
  };
  
  // Verificăm dacă o dată este astăzi
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };
  
  // Obținem evenimentele pentru o zi
  const getEventsForDay = (date: Date) => {
    return events.filter(event => 
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()
    );
  };
  
  // Navigăm la luna anterioară
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  // Navigăm la luna următoare
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  // Navigăm la luna curentă
  const goToCurrentMonth = () => {
    setCurrentDate(new Date());
  };
  
  // Deschidem dialogul pentru adăugarea unui eveniment
  const handleAddEvent = (date: Date) => {
    setNewEventDate(date);
    setNewEvent({
      title: '',
      description: '',
      date,
      startTime: '',
      endTime: '',
      location: '',
      participants: [],
      color: '#4f46e5', // Indigo
    });
    setIsAddEventOpen(true);
    setIsEditMode(false);
  };
  
  // Deschidem dialogul pentru vizualizarea unui eveniment
  const handleViewEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsViewEventOpen(true);
  };
  
  // Deschidem dialogul pentru editarea unui eveniment
  const handleEditEvent = () => {
    if (selectedEvent) {
      setNewEvent({
        title: selectedEvent.title,
        description: selectedEvent.description || '',
        date: selectedEvent.date,
        startTime: selectedEvent.startTime || '',
        endTime: selectedEvent.endTime || '',
        location: selectedEvent.location || '',
        participants: selectedEvent.participants || [],
        color: selectedEvent.color,
      });
      setIsViewEventOpen(false);
      setIsAddEventOpen(true);
      setIsEditMode(true);
    }
  };
  
  // Ștergem un eveniment
  const handleDeleteEvent = () => {
    if (selectedEvent) {
      setEvents(events.filter(event => event.id !== selectedEvent.id));
      setIsViewEventOpen(false);
      
      toast({
        title: 'Eveniment șters',
        description: 'Evenimentul a fost șters cu succes.',
      });
    }
  };
  
  // Salvăm un eveniment
  const handleSaveEvent = () => {
    if (isEditMode && selectedEvent) {
      // Actualizăm evenimentul existent
      setEvents(events.map(event => 
        event.id === selectedEvent.id 
          ? { ...newEvent, id: selectedEvent.id } 
          : event
      ));
      
      toast({
        title: 'Eveniment actualizat',
        description: 'Evenimentul a fost actualizat cu succes.',
      });
    } else {
      // Adăugăm un eveniment nou
      const id = `event-${Date.now()}`;
      setEvents([...events, { ...newEvent, id, date: newEventDate }]);
      
      toast({
        title: 'Eveniment adăugat',
        description: 'Evenimentul a fost adăugat cu succes.',
      });
    }
    
    setIsAddEventOpen(false);
  };
  
  // Generăm zilele pentru calendar
  const calendarDays = generateCalendarDays();
  
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">
            Gestionați evenimentele și programul proiectelor.
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToCurrentMonth}>
            Astăzi
          </Button>
          <Button variant="outline" size="sm" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={() => handleAddEvent(new Date())}>
            <Plus className="h-4 w-4 mr-2" />
            Adaugă eveniment
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">
            {format(currentDate, 'LLLL yyyy', { locale: ro })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Zilele săptămânii */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {['Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă', 'Duminică'].map((day) => (
              <div key={day} className="text-center font-medium text-sm py-2">
                {day}
              </div>
            ))}
          </div>
          
          {/* Zilele calendarului */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => (
              <CalendarDay
                key={index}
                date={day}
                events={getEventsForDay(day)}
                isCurrentMonth={day.getMonth() === currentDate.getMonth()}
                isToday={isToday(day)}
                onEventClick={handleViewEvent}
                onAddEvent={handleAddEvent}
              />
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Dialog pentru adăugarea/editarea unui eveniment */}
      <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Editează evenimentul' : 'Adaugă eveniment nou'}</DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? 'Modificați detaliile evenimentului și apăsați Salvează pentru a actualiza.' 
                : 'Completați detaliile evenimentului și apăsați Adaugă pentru a crea.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titlu</Label>
              <Input
                id="title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="Titlul evenimentului"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(newEventDate, 'P', { locale: ro })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={newEventDate}
                    onSelect={(date) => date && setNewEventDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Ora de început</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={newEvent.startTime}
                  onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endTime">Ora de sfârșit</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={newEvent.endTime}
                  onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Locație</Label>
              <Input
                id="location"
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                placeholder="Locația evenimentului"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descriere</Label>
              <Textarea
                id="description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="Descrierea evenimentului"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="color">Culoare</Label>
              <div className="flex gap-2">
                {['#4f46e5', '#10b981', '#0ea5e9', '#ef4444', '#f59e0b', '#8b5cf6'].map((color) => (
                  <div
                    key={color}
                    className={`w-8 h-8 rounded-full cursor-pointer ${newEvent.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewEvent({ ...newEvent, color })}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEventOpen(false)}>
              Anulează
            </Button>
            <Button onClick={handleSaveEvent}>
              {isEditMode ? 'Salvează' : 'Adaugă'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog pentru vizualizarea unui eveniment */}
      {selectedEvent && (
        <Dialog open={isViewEventOpen} onOpenChange={setIsViewEventOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <div className="flex justify-between items-start">
                <DialogTitle>{selectedEvent.title}</DialogTitle>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={handleEditEvent}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleDeleteEvent}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span>{format(selectedEvent.date, 'PPP', { locale: ro })}</span>
              </div>
              
              {selectedEvent.startTime && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {selectedEvent.startTime} {selectedEvent.endTime ? `- ${selectedEvent.endTime}` : ''}
                  </span>
                </div>
              )}
              
              {selectedEvent.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedEvent.location}</span>
                </div>
              )}
              
              {selectedEvent.participants && selectedEvent.participants.length > 0 && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedEvent.participants.join(', ')}</span>
                </div>
              )}
              
              {selectedEvent.description && (
                <div className="pt-4 border-t border-slate-700">
                  <p className="text-sm">{selectedEvent.description}</p>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewEventOpen(false)}>
                Închide
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CalendarPage;

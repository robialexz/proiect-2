import React, { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, BellOff, Info, AlertCircle, CheckCircle } from 'lucide-react';

const NotificationsDemo: React.FC = () => {
  const {
    isSupported,
    hasPermission,
    requestPermission,
    showNotification,
    showSuccess,
    showError,
    showInfo,
  } = useNotifications();

  const [title, setTitle] = useState('Notificare test');
  const [message, setMessage] = useState('Acesta este un mesaj de test pentru notificări.');

  const handleRequestPermission = async () => {
    await requestPermission();
  };

  const handleShowNotification = async () => {
    await showNotification(title, { body: message });
  };

  const handleShowSuccess = async () => {
    await showSuccess(title, message);
  };

  const handleShowError = async () => {
    await showError(title, message);
  };

  const handleShowInfo = async () => {
    await showInfo(title, message);
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Demo Notificări</h1>

      <Card className="max-w-3xl mx-auto mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isSupported ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
            Stare Notificări
          </CardTitle>
          <CardDescription>
            Verifică starea notificărilor și solicită permisiunea dacă este necesar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Notificări suportate:</span>
              <span className={isSupported ? 'text-green-500' : 'text-red-500'}>
                {isSupported ? 'Da' : 'Nu'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Permisiune acordată:</span>
              <span className={hasPermission ? 'text-green-500' : 'text-amber-500'}>
                {hasPermission ? 'Da' : 'Nu'}
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleRequestPermission}
            disabled={!isSupported || hasPermission}
            className="w-full"
          >
            Solicită Permisiune
          </Button>
        </CardFooter>
      </Card>

      {isSupported && (
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Trimite Notificări</CardTitle>
            <CardDescription>
              Completează detaliile și trimite diferite tipuri de notificări.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titlu</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Introdu titlul notificării"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Mesaj</Label>
                <Input
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Introdu mesajul notificării"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Tabs defaultValue="default" className="w-full">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="default">Standard</TabsTrigger>
                <TabsTrigger value="success">Succes</TabsTrigger>
                <TabsTrigger value="error">Eroare</TabsTrigger>
                <TabsTrigger value="info">Info</TabsTrigger>
              </TabsList>
              <TabsContent value="default" className="w-full">
                <Button onClick={handleShowNotification} className="w-full">
                  Trimite Notificare Standard
                </Button>
              </TabsContent>
              <TabsContent value="success" className="w-full">
                <Button onClick={handleShowSuccess} className="w-full bg-green-600 hover:bg-green-700">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Trimite Notificare Succes
                </Button>
              </TabsContent>
              <TabsContent value="error" className="w-full">
                <Button onClick={handleShowError} className="w-full bg-red-600 hover:bg-red-700">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Trimite Notificare Eroare
                </Button>
              </TabsContent>
              <TabsContent value="info" className="w-full">
                <Button onClick={handleShowInfo} className="w-full bg-blue-600 hover:bg-blue-700">
                  <Info className="mr-2 h-4 w-4" />
                  Trimite Notificare Info
                </Button>
              </TabsContent>
            </Tabs>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default NotificationsDemo;

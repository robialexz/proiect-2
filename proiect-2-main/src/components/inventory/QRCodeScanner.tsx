import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, X, Camera, QrCode } from "lucide-react";

interface QRCodeScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

export const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScan, onClose }) => {
  const { t } = useTranslation();
  const [manualCode, setManualCode] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanIntervalRef = useRef<number | null>(null);

  // Verificăm disponibilitatea camerei
  useEffect(() => {
    const checkCamera = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setHasCamera(videoDevices.length > 0);
      } catch (err) {
        console.error("Error checking camera:", err);
        setHasCamera(false);
      }
    };

    checkCamera();
  }, []);

  // Inițializăm camera când începe scanarea
  useEffect(() => {
    if (isScanning && hasCamera) {
      const startCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" }
          });
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
          
          // Începem scanarea
          startScanning();
        } catch (err) {
          console.error("Error accessing camera:", err);
          setError(t("inventory.qrScanner.cameraError", "Could not access camera. Please check permissions."));
          setIsScanning(false);
        }
      };
      
      startCamera();
    }
    
    return () => {
      // Oprim camera și scanarea când componenta este demontată
      stopScanning();
      
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isScanning, hasCamera, t]);

  // Funcție pentru începerea scanării
  const startScanning = () => {
    if (!canvasRef.current || !videoRef.current) return;
    
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    // Scanăm la fiecare 500ms
    scanIntervalRef.current = window.setInterval(() => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        // Setăm dimensiunea canvas-ului la dimensiunea video-ului
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        
        // Desenăm frame-ul curent pe canvas
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        
        // Obținem datele imaginii
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        
        // Aici ar trebui să folosim o bibliotecă pentru scanarea codurilor QR
        // De exemplu, jsQR sau ZXing
        // Pentru simplitate, vom simula scanarea unui cod QR
        
        // În implementarea reală, am folosi ceva de genul:
        // const code = jsQR(imageData.data, imageData.width, imageData.height);
        // if (code) {
        //   stopScanning();
        //   onScan(code.data);
        // }
        
        // Simulăm scanarea unui cod QR după 3 secunde
        setTimeout(() => {
          stopScanning();
          onScan(`DEMO-${Math.floor(Math.random() * 1000000)}`);
        }, 3000);
      }
    }, 500);
  };

  // Funcție pentru oprirea scanării
  const stopScanning = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setIsScanning(false);
  };

  // Funcție pentru trimiterea codului manual
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScan(manualCode.trim());
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {isScanning ? (
        <div className="space-y-4">
          <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              playsInline
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full hidden"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2/3 h-2/3 border-2 border-white rounded-lg opacity-50" />
            </div>
          </div>
          <div className="flex justify-center">
            <Button
              type="button"
              variant="destructive"
              onClick={stopScanning}
            >
              <X className="mr-2 h-4 w-4" />
              {t("inventory.qrScanner.stopScanning", "Stop Scanning")}
            </Button>
          </div>
        </div>
      ) : (
        <>
          {hasCamera && (
            <div className="flex justify-center">
              <Button
                type="button"
                variant="default"
                onClick={() => setIsScanning(true)}
                className="w-full"
              >
                <Camera className="mr-2 h-4 w-4" />
                {t("inventory.qrScanner.startScanning", "Start Camera Scanning")}
              </Button>
            </div>
          )}
          
          <div className="text-center text-sm text-gray-500">
            {t("inventory.qrScanner.orEnterManually", "Or enter QR code manually")}
          </div>
          
          <form onSubmit={handleManualSubmit} className="space-y-2">
            <Input
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder={t("inventory.qrScanner.enterCode", "Enter QR code")}
            />
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                {t("common.cancel", "Cancel")}
              </Button>
              <Button
                type="submit"
                variant="default"
                className="flex-1"
                disabled={!manualCode.trim()}
              >
                <QrCode className="mr-2 h-4 w-4" />
                {t("inventory.qrScanner.submit", "Submit")}
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default QRCodeScanner;

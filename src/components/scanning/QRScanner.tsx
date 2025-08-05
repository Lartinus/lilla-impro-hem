import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, AlertCircle, Flashlight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface QRScannerProps {
  onScanSuccess: (ticket: any) => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScanSuccess }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const [currentStream, setCurrentStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      stopScanning();
    };
  }, []);

  const stopScanning = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop());
      setCurrentStream(null);
    }
    setIsScanning(false);
  };

  const startScanning = async () => {
    try {
      setError(null);
      setIsScanning(true);

      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      setCurrentStream(stream);
      setHasPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Initialize ZXing code reader
      const codeReader = new BrowserMultiFormatReader();
      codeReaderRef.current = codeReader;

      // Start decoding
      codeReader.decodeFromVideoDevice(undefined, videoRef.current!, async (result, error) => {
        if (result) {
          const qrData = result.getText();
          console.log('QR Code scanned:', qrData);
          
          // Stop scanning temporarily
          stopScanning();
          
          // Look up ticket in database
          const { data, error: dbError } = await supabase.rpc('get_ticket_by_qr', {
            qr_data_param: qrData
          });

          if (dbError) {
            console.error('Database error:', dbError);
            toast.error('Fel vid uppslagning av biljett');
            setIsScanning(false);
            return;
          }

          if (!data || data.length === 0) {
            toast.error('Ingen giltig biljett hittades');
            setIsScanning(false);
            return;
          }

          const ticket = data[0];
          if (ticket.payment_status !== 'paid') {
            toast.error('Biljetten är inte betald');
            setIsScanning(false);
            return;
          }

          // Success - pass ticket data to parent
          onScanSuccess(ticket);
          toast.success('Biljett scannad!');
        }
        
        if (error && !(error instanceof Error && error.name === 'NotFoundException')) {
          console.error('Scanning error:', error);
        }
      });

    } catch (err) {
      console.error('Error starting scanner:', err);
      setHasPermission(false);
      setError('Kunde inte komma åt kameran. Kontrollera behörigheter.');
      setIsScanning(false);
    }
  };

  if (hasPermission === false) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-4">
          <AlertCircle className="h-16 w-16 mx-auto text-destructive" />
          <h3 className="text-lg font-semibold">Kamerabehörighet krävs</h3>
          <p className="text-muted-foreground">
            För att scanna QR-koder behöver vi tillgång till din kamera.
          </p>
          <Button onClick={startScanning} className="w-full">
            <Camera className="h-4 w-4 mr-2" />
            Tillåt kameraåtkomst
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="overflow-hidden">
        <div className="relative bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-80 object-cover"
            style={{ transform: 'scaleX(-1)' }} // Mirror the video
          />
          
          {/* Scanning overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-48 border-2 border-white rounded-lg relative">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
              
              {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-pulse text-white bg-black bg-opacity-50 px-3 py-1 rounded">
                    Scannar...
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status indicator */}
          {isScanning && (
            <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              Kamera aktiv
            </div>
          )}
        </div>
        
        <div className="p-4 space-y-3">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Placera QR-koden inom ramen för att scanna
            </p>
          </div>
          
          <div className="flex gap-2">
            {!isScanning ? (
              <Button onClick={startScanning} className="flex-1">
                <Camera className="h-4 w-4 mr-2" />
                Starta scanner
              </Button>
            ) : (
              <Button onClick={stopScanning} variant="destructive" className="flex-1">
                Stoppa scanner
              </Button>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-2">Tips för bäst resultat:</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Håll telefonen stabilt</li>
          <li>• Se till att QR-koden är tydligt synlig</li>
          <li>• Undvik reflex från ljus</li>
          <li>• Scanna en QR-kod i taget</li>
        </ul>
      </Card>
    </div>
  );
};
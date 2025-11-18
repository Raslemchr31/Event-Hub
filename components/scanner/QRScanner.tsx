'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerProps {
  onScan: (url: string) => void;
  onError?: (error: string) => void;
}

export default function QRScanner({ onScan, onError }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerDivId = 'qr-reader';

  const startScanning = async () => {
    try {
      setIsScanning(true);

      const html5QrCode = new Html5Qrcode(scannerDivId);
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' }, // Use back camera
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // QR code successfully scanned
          stopScanning();
          onScan(decodedText);
        },
        (errorMessage) => {
          // Scanning error (usually just "no QR code found")
          // Don't show these to user as they're normal
        }
      );

      setHasPermission(true);
    } catch (err) {
      console.error('Error starting scanner:', err);
      setIsScanning(false);
      setHasPermission(false);
      onError?.(
        'Camera access denied or unavailable. Please check permissions and try again.'
      );
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <div className="w-full">
      <div id={scannerDivId} className="w-full rounded-lg overflow-hidden" />

      <div className="mt-4 flex gap-3">
        {!isScanning ? (
          <button
            onClick={startScanning}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Start QR Scanner
          </button>
        ) : (
          <button
            onClick={stopScanning}
            className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Stop Scanning
          </button>
        )}
      </div>

      {hasPermission === false && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            Camera access is required to scan QR codes. Please enable camera
            permissions in your browser settings.
          </p>
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ScanResult {
  name: string;
  roaster: string;
}

interface BarcodeScannerProps {
  onResult: (result: ScanResult) => void;
  onClose: () => void;
}

type Status = 'starting' | 'scanning' | 'loading' | 'found' | 'not-found' | 'error' | 'camera-error';

export default function BarcodeScanner({ onResult, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const detectedRef = useRef(false);

  const [status, setStatus] = useState<Status>('starting');
  const [preview, setPreview] = useState<ScanResult | null>(null);

  const stopAll = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  const lookupBarcode = useCallback(async (barcode: string) => {
    setStatus('loading');
    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await res.json();

      if (data.status === 1 && data.product) {
        const name = (data.product.product_name || data.product.product_name_en || '').trim();
        const roaster = (data.product.brands || '').split(',')[0].trim();

        if (name || roaster) {
          setPreview({ name, roaster });
          setStatus('found');
        } else {
          setStatus('not-found');
        }
      } else {
        setStatus('not-found');
      }
    } catch {
      setStatus('error');
    }
  }, []);

  const startScanner = useCallback(async () => {
    detectedRef.current = false;
    setStatus('starting');
    setPreview(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;

      if (!videoRef.current) return;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      readerRef.current = new BrowserMultiFormatReader();
      setStatus('scanning');

      // Poll canvas frames every 400ms — works reliably on iOS Safari
      intervalRef.current = setInterval(async () => {
        if (detectedRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas || video.readyState < 2) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d')?.drawImage(video, 0, 0);

        try {
          const result = await readerRef.current!.decodeFromCanvas(canvas);
          if (result && !detectedRef.current) {
            detectedRef.current = true;
            if (intervalRef.current) clearInterval(intervalRef.current);
            streamRef.current?.getTracks().forEach((t) => t.stop());
            await lookupBarcode(result.getText());
          }
        } catch {
          // NotFoundException on most frames — normal, keep scanning
        }
      }, 400);
    } catch {
      setStatus('camera-error');
    }
  }, [lookupBarcode]);

  useEffect(() => {
    startScanner();
    return () => stopAll();
  }, [startScanner, stopAll]);

  function handleUse() {
    if (preview) onResult(preview);
  }

  function handleRetry() {
    stopAll();
    startScanner();
  }

  const isDone = status === 'found' || status === 'not-found' || status === 'error' || status === 'camera-error';

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#0a0602' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 shrink-0"
        style={{ background: 'rgba(19,12,4,0.95)', borderBottom: '1px solid #3d2510' }}>
        <div>
          <p className="text-amber-gold text-xs font-semibold tracking-widest uppercase">Scan</p>
          <h2 className="text-cream-100 font-semibold" style={{ fontFamily: 'Georgia, serif' }}>
            Coffee Barcode
          </h2>
        </div>
        <button onClick={onClose}
          className="p-2 rounded-lg text-cream-400 hover:text-cream-100 transition-colors"
          style={{ background: '#2c1b0e' }}>
          <X size={18} />
        </button>
      </div>

      {/* Viewfinder */}
      <div className="relative flex-1 overflow-hidden bg-black">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          muted
          autoPlay
        />
        {/* Hidden canvas for frame capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="absolute inset-0" style={{ background: 'rgba(10,6,2,0.45)' }} />
          {/* Scan frame */}
          <div className="relative z-10 w-72 h-36">
            {(['tl','tr','bl','br'] as const).map((corner) => (
              <div key={corner} className={`absolute w-7 h-7
                ${corner.includes('t') ? 'top-0' : 'bottom-0'}
                ${corner.includes('l') ? 'left-0' : 'right-0'}`}
                style={{
                  borderTop:    corner.includes('t') ? '2.5px solid #c8860a' : 'none',
                  borderBottom: corner.includes('b') ? '2.5px solid #c8860a' : 'none',
                  borderLeft:   corner.includes('l') ? '2.5px solid #c8860a' : 'none',
                  borderRight:  corner.includes('r') ? '2.5px solid #c8860a' : 'none',
                  borderRadius: corner === 'tl' ? '4px 0 0 0' : corner === 'tr' ? '0 4px 0 0'
                    : corner === 'bl' ? '0 0 0 4px' : '0 0 4px 0',
                }}
              />
            ))}
            {/* Scan line */}
            {status === 'scanning' && (
              <div className="absolute left-2 right-2 h-px animate-bounce"
                style={{ background: 'linear-gradient(to right, transparent, #c8860a, transparent)', top: '50%' }} />
            )}
          </div>
        </div>
      </div>

      {/* Bottom panel */}
      <div className="shrink-0 px-4 py-5 space-y-4"
        style={{ background: 'rgba(19,12,4,0.97)', borderTop: '1px solid #3d2510' }}>

        {/* Status */}
        <div className="flex items-center gap-3">
          {(status === 'starting' || status === 'loading') && <Loader2 size={16} className="text-amber-gold animate-spin shrink-0" />}
          {status === 'scanning'  && <Loader2 size={16} className="text-amber-gold animate-spin shrink-0" />}
          {status === 'found'     && <CheckCircle2 size={16} className="text-green-400 shrink-0" />}
          {(status === 'not-found' || status === 'error' || status === 'camera-error') && <AlertCircle size={16} className="text-red-400 shrink-0" />}
          <p className="text-sm text-cream-300">
            {status === 'starting'     && 'Starting camera…'}
            {status === 'scanning'     && 'Hold the barcode steady inside the frame'}
            {status === 'loading'      && 'Barcode detected — looking up product…'}
            {status === 'found'        && 'Product found!'}
            {status === 'not-found'    && "Not in the Open Food Facts database — fill in manually."}
            {status === 'error'        && 'Could not reach the product database.'}
            {status === 'camera-error' && 'Camera access denied. Check your browser settings.'}
          </p>
        </div>

        {/* Result preview */}
        {status === 'found' && preview && (
          <div className="rounded-xl p-4 space-y-2" style={{ background: '#1e1208', border: '1px solid #3d2510' }}>
            {preview.name && (
              <div>
                <p className="text-xs text-amber-gold opacity-70 uppercase tracking-widest mb-0.5">Bean Name</p>
                <p className="text-cream-100 font-medium">{preview.name}</p>
              </div>
            )}
            {preview.roaster && (
              <div>
                <p className="text-xs text-amber-gold opacity-70 uppercase tracking-widest mb-0.5">Roaster</p>
                <p className="text-cream-100 font-medium">{preview.roaster}</p>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {status === 'found' && (
            <button onClick={handleUse}
              className="flex-1 bg-amber-gold hover:bg-amber-light text-espresso-900 font-semibold py-3 rounded-lg transition-colors">
              Use This Info
            </button>
          )}
          {isDone && (
            <button onClick={handleRetry}
              className="flex-1 py-3 rounded-lg text-cream-300 font-medium transition-colors"
              style={{ background: '#2c1b0e', border: '1px solid #3d2510' }}>
              Scan Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { NotFoundException } from '@zxing/library';
import { X, Camera, Loader2, AlertCircle } from 'lucide-react';

interface ScanResult {
  name: string;
  roaster: string;
}

interface BarcodeScannerProps {
  onResult: (result: ScanResult) => void;
  onClose: () => void;
}

type Status = 'scanning' | 'found' | 'not-found' | 'error';

export default function BarcodeScanner({ onResult, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const [status, setStatus] = useState<Status>('scanning');
  const [message, setMessage] = useState('Point your camera at the barcode on the coffee bag');
  const [preview, setPreview] = useState<ScanResult | null>(null);

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;

    reader.decodeFromConstraints(
      { video: { facingMode: 'environment' } },
      videoRef.current!,
      async (result, err) => {
        if (result) {
          const barcode = result.getText();
          stopScanner();
          await lookupBarcode(barcode);
        } else if (err && !(err instanceof NotFoundException)) {
          console.error('Scanner error:', err);
        }
      }
    );

    return () => stopScanner();
  }, []);

  function stopScanner() {
    if (readerRef.current) {
      BrowserMultiFormatReader.releaseAllStreams();
    }
  }

  async function lookupBarcode(barcode: string) {
    setStatus('scanning');
    setMessage('Barcode detected — looking up product…');

    try {
      const res = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
      );
      const data = await res.json();

      if (data.status === 1 && data.product) {
        const product = data.product;
        const name = product.product_name || product.product_name_en || '';
        const roaster = product.brands || '';

        if (name || roaster) {
          const scanResult = {
            name: name.trim(),
            roaster: roaster.split(',')[0].trim(), // take first brand if multiple
          };
          setPreview(scanResult);
          setStatus('found');
          setMessage('Product found!');
        } else {
          setStatus('not-found');
          setMessage('Product found but has no name or brand info.');
        }
      } else {
        setStatus('not-found');
        setMessage("This barcode isn't in the Open Food Facts database yet.");
      }
    } catch {
      setStatus('error');
      setMessage('Could not reach the product database. Check your connection.');
    }
  }

  function handleUse() {
    if (preview) onResult(preview);
  }

  function handleRetry() {
    setStatus('scanning');
    setPreview(null);
    setMessage('Point your camera at the barcode on the coffee bag');

    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;
    reader.decodeFromConstraints(
      { video: { facingMode: 'environment' } },
      videoRef.current!,
      async (result, err) => {
        if (result) {
          stopScanner();
          await lookupBarcode(result.getText());
        } else if (err && !(err instanceof NotFoundException)) {
          console.error(err);
        }
      }
    );
  }

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

      {/* Camera viewfinder */}
      <div className="relative flex-1 overflow-hidden">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          muted
        />

        {/* Overlay with cutout */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute inset-0" style={{ background: 'rgba(10,6,2,0.55)' }} />
          {/* Scan frame */}
          <div className="relative z-10 w-72 h-36">
            {/* Corner marks */}
            {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map((pos) => (
              <div key={pos} className={`absolute w-6 h-6 ${pos}`}
                style={{
                  borderTop: pos.includes('top') ? '2.5px solid #c8860a' : 'none',
                  borderBottom: pos.includes('bottom') ? '2.5px solid #c8860a' : 'none',
                  borderLeft: pos.includes('left') ? '2.5px solid #c8860a' : 'none',
                  borderRight: pos.includes('right') ? '2.5px solid #c8860a' : 'none',
                  borderRadius: pos.includes('top-0 left') ? '4px 0 0 0'
                    : pos.includes('top-0 right') ? '0 4px 0 0'
                    : pos.includes('bottom-0 left') ? '0 0 0 4px'
                    : '0 0 4px 0',
                }}
              />
            ))}
            {/* Scan line animation */}
            {status === 'scanning' && (
              <div className="absolute left-1 right-1 h-px animate-bounce"
                style={{ background: 'linear-gradient(to right, transparent, #c8860a, transparent)', top: '50%' }} />
            )}
          </div>
        </div>
      </div>

      {/* Bottom panel */}
      <div className="shrink-0 px-4 py-5 space-y-4"
        style={{ background: 'rgba(19,12,4,0.97)', borderTop: '1px solid #3d2510' }}>

        {/* Status message */}
        <div className="flex items-start gap-3">
          <div className="mt-0.5 shrink-0">
            {status === 'scanning' && <Loader2 size={16} className="text-amber-gold animate-spin" />}
            {status === 'found' && <Camera size={16} className="text-green-400" />}
            {(status === 'not-found' || status === 'error') && <AlertCircle size={16} className="text-red-400" />}
          </div>
          <p className="text-sm text-cream-300">{message}</p>
        </div>

        {/* Found result preview */}
        {status === 'found' && preview && (
          <div className="rounded-xl p-4 space-y-2" style={{ background: '#1e1208', border: '1px solid #3d2510' }}>
            {preview.name && (
              <div>
                <p className="text-xs text-amber-gold opacity-70 uppercase tracking-widest">Bean Name</p>
                <p className="text-cream-100 font-medium">{preview.name}</p>
              </div>
            )}
            {preview.roaster && (
              <div>
                <p className="text-xs text-amber-gold opacity-70 uppercase tracking-widest">Roaster</p>
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
          {(status === 'not-found' || status === 'error' || status === 'found') && (
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

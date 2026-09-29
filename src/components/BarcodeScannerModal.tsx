'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Order, OrderItem } from '@/lib/types';
import {
  X,
  Camera,
  Barcode,
  CheckCircle2,
  AlertCircle,
  Truck,
  Volume2,
  VolumeX,
  RefreshCw,
  QrCode,
  Sparkles
} from 'lucide-react';

interface BarcodeScannerModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onCompleteDispatch: (orderId: string, fulfillmentMap: Record<string, number>, notes?: string) => void;
}

export default function BarcodeScannerModal({
  order,
  isOpen,
  onClose,
  onCompleteDispatch
}: BarcodeScannerModalProps) {
  // Map of productId -> scanned quantity
  const [scannedCounts, setScannedCounts] = useState<Record<string, number>>({});
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [lastScannedFeedback, setLastScannedFeedback] = useState<{
    success: boolean;
    message: string;
    productName?: string;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const keyBufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);

  // Initialize scanned counts based on already dispatched quantities or 0
  useEffect(() => {
    if (order && isOpen) {
      const initial: Record<string, number> = {};
      order.items.forEach((item) => {
        initial[item.productId] = item.dispatchedQuantity ?? 0;
      });
      setScannedCounts(initial);
      setLastScannedFeedback(null);
      setManualCode('');
    }
  }, [order, isOpen]);

  // Audio synthesizer for warehouse scanner beeps using Web Audio API
  const playBeep = (isSuccess: boolean) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (isSuccess) {
        // High crisp double beep
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
        osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.08); // D6
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else {
        // Low error buzz
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch {
      // AudioContext unavailable or blocked by autoplay policy
    }
  };

  // Process a scanned barcode string (matches item SKU or product name or JSON payload)
  const handleBarcodeScanned = (scannedCode: string) => {
    const clean = scannedCode.trim().toUpperCase();
    if (!clean) return;

    // Check if code contains JSON payload from generated carton QR
    let matchedItem: OrderItem | undefined;
    try {
      if (clean.startsWith('{') && clean.endsWith('}')) {
        const parsed = JSON.parse(clean);
        if (parsed.sku) {
          matchedItem = order.items.find(
            (i) => i.sku.toUpperCase() === parsed.sku.toUpperCase() || i.productId === parsed.productId
          );
        }
      }
    } catch {
      // Not JSON, continue with standard SKU/Barcode matching
    }

    if (!matchedItem) {
      matchedItem = order.items.find(
        (i) =>
          i.sku.toUpperCase() === clean ||
          i.productId.toUpperCase() === clean ||
          i.productName.toUpperCase().includes(clean)
      );
    }

    if (matchedItem) {
      const current = scannedCounts[matchedItem.productId] || 0;
      if (current >= matchedItem.quantity) {
        playBeep(false);
        setLastScannedFeedback({
          success: false,
          message: `All ${matchedItem.quantity} cartons of ${matchedItem.productName} are already scanned!`,
          productName: matchedItem.productName
        });
        return;
      }

      const nextCount = current + 1;
      setScannedCounts((prev) => ({
        ...prev,
        [matchedItem!.productId]: nextCount
      }));

      playBeep(true);
      setLastScannedFeedback({
        success: true,
        message: `Verified 1 Carton (+1) • ${nextCount} of ${matchedItem.quantity} Packed`,
        productName: matchedItem.productName
      });
    } else {
      playBeep(false);
      setLastScannedFeedback({
        success: false,
        message: `Unrecognized Barcode: "${clean}". Not in this order!`,
        productName: undefined
      });
    }
  };

  // Hardware Handheld Laser Scanner Listener (captures rapid keyboard inputs)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is intentionally typing inside an input field
      if (e.target instanceof HTMLInputElement && e.target.id !== 'scanner-hidden-buffer') {
        return;
      }

      const now = Date.now();
      // Laser scanners type very fast (< 50ms between keys)
      if (now - lastKeyTimeRef.current > 300) {
        keyBufferRef.current = '';
      }
      lastKeyTimeRef.current = now;

      if (e.key === 'Enter') {
        if (keyBufferRef.current.length > 2) {
          handleBarcodeScanned(keyBufferRef.current);
          keyBufferRef.current = '';
        }
      } else if (e.key.length === 1) {
        keyBufferRef.current += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, scannedCounts, order]);

  // Start Camera Stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setCameraError('Camera access unavailable. Use manual SKU entry or handheld USB barcode scanner.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  if (!isOpen || !order) return null;

  // Calculation helpers
  const totalItemsRequired = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalItemsScanned = order.items.reduce(
    (sum, item) => sum + Math.min(item.quantity, scannedCounts[item.productId] || 0),
    0
  );
  const isFullyVerified = totalItemsScanned >= totalItemsRequired;
  const progressPercent = Math.round((totalItemsScanned / Math.max(1, totalItemsRequired)) * 100);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleBarcodeScanned(manualCode);
      setManualCode('');
    }
  };

  const handleFinishDispatch = () => {
    onCompleteDispatch(order.id, scannedCounts, 'Verified via Warehouse Barcode Scanner');
    stopCamera();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
              <Barcode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                  Warehouse Dispatch Scanner
                </h3>
                <span className="text-[11px] font-mono font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded-md">
                  {order.orderNumber}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Consignee: <span className="font-semibold text-slate-700 dark:text-slate-300">{order.businessName}</span> ({order.city})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute Scanner Beeps' : 'Enable Scanner Beeps'}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800 transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>
            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Packing Progress Bar */}
        <div className="px-5 py-3 bg-indigo-50/50 dark:bg-indigo-950/20 border-b border-indigo-100 dark:border-indigo-900/30">
          <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
            <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span>Cartons Packed:</span>
              <strong className="text-indigo-600 dark:text-indigo-400">
                {totalItemsScanned} / {totalItemsRequired} Cartons
              </strong>
            </span>
            <span className={isFullyVerified ? 'text-emerald-600 font-bold' : 'text-slate-500'}>
              {progressPercent}% Complete
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                isFullyVerified ? 'bg-emerald-500' : 'bg-indigo-600'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* Scanner Feedback Alert */}
          {lastScannedFeedback && (
            <div
              className={`p-3 rounded-2xl flex items-center gap-3 text-xs animate-in slide-in-from-top-2 duration-200 ${
                lastScannedFeedback.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
              }`}
            >
              {lastScannedFeedback.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <div className="flex-1 font-semibold">{lastScannedFeedback.message}</div>
            </div>
          )}

          {/* Camera View & Barcode Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Camera Box */}
            <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 flex flex-col items-center justify-center min-h-[170px] relative text-center p-3">
              {cameraActive ? (
                <>
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 h-1 bg-rose-500/80 shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse" />
                  <button
                    onClick={stopCamera}
                    className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/60 text-white text-[11px] hover:bg-black/80"
                  >
                    Turn Off Camera
                  </button>
                </>
              ) : (
                <div className="space-y-2 p-4">
                  <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div className="text-xs text-slate-400">
                    Scan carton barcode using your mobile camera or webcam
                  </div>
                  {cameraError ? (
                    <p className="text-[11px] text-amber-400">{cameraError}</p>
                  ) : (
                    <button
                      onClick={startCamera}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
                    >
                      Start Camera Scanner
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Hardware Scanner & Manual Code Input */}
            <div className="flex flex-col justify-between space-y-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block mb-1">
                  Hardware & Manual Scan
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  USB laser scanners work automatically. Or enter SKU / Barcode below:
                </p>
              </div>

              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. OIL-FORT-1L-12"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white uppercase font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!manualCode.trim()}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-xl text-xs font-bold disabled:opacity-50 transition-all"
                >
                  Scan
                </button>
              </form>

              {/* Quick Simulation Buttons for Easy Testing */}
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  ⚡ 1-Click Scan Simulation (For Dev/Demo):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {order.items.map((item) => (
                    <button
                      key={item.productId}
                      type="button"
                      onClick={() => handleBarcodeScanned(item.sku)}
                      className="px-2 py-1 rounded-lg bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-950/80 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-[10px] font-mono font-medium transition-all"
                    >
                      +1 {item.sku}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Packing Itemized Checklist */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Order Items Packing Checklist
            </h4>
            <div className="space-y-2">
              {order.items.map((item) => {
                const scanned = scannedCounts[item.productId] || 0;
                const isItemDone = scanned >= item.quantity;
                const isOverScanned = scanned > item.quantity;

                return (
                  <div
                    key={item.productId}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isItemDone
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                        : scanned > 0
                        ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {item.productName}
                        </span>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {item.sku}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.packSize} • Rate: ₹{item.wholesalePrice}
                      </div>
                    </div>

                    {/* Quantity Stepper & Badges */}
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xs font-bold">
                          <span className={isItemDone ? 'text-emerald-600 dark:text-emerald-400 font-extrabold' : 'text-slate-900 dark:text-white'}>
                            {scanned}
                          </span>
                          <span className="text-slate-400 font-normal"> / {item.quantity}</span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {isItemDone ? 'Ready to load' : `${item.quantity - scanned} pending`}
                        </div>
                      </div>

                      {/* Manual Increment/Decrement Adjuster */}
                      <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-xl p-0.5">
                        <button
                          type="button"
                          onClick={() =>
                            setScannedCounts((prev) => ({
                              ...prev,
                              [item.productId]: Math.max(0, (prev[item.productId] || 0) - 1)
                            }))
                          }
                          className="w-6 h-6 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-600 text-xs font-bold"
                        >
                          -
                        </button>
                        <button
                          type="button"
                          onClick={() => handleBarcodeScanned(item.sku)}
                          className="w-6 h-6 rounded-lg text-indigo-600 dark:text-indigo-300 hover:bg-white dark:hover:bg-slate-600 text-xs font-bold"
                        >
                          +
                        </button>
                      </div>

                      {isItemDone ? (
                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 flex items-center justify-center shrink-0">
                          <Barcode className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
            {isFullyVerified ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> 100% Items Scanned & Verified for Loading
              </span>
            ) : totalItemsScanned > 0 ? (
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                ⚠️ Partial dispatch ({totalItemsScanned}/{totalItemsRequired} cartons)
              </span>
            ) : (
              <span>Scan cartons before loading to prevent mis-shipments.</span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleFinishDispatch}
              disabled={totalItemsScanned === 0}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Truck className="w-4 h-4" />
              <span>Complete Verified Dispatch</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

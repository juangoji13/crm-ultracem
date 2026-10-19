'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { getPendingSyncCount, syncPendingSales } from '@/lib/offlineDb';

interface NetworkStatusBannerProps {
  onSyncComplete?: () => void;
}

export const NetworkStatusBanner: React.FC<NetworkStatusBannerProps> = ({ onSyncComplete }) => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Monitor network status
  useEffect(() => {
    setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);

    const handleOnline = async () => {
      setIsOnline(true);
      // Auto-trigger sync when recovering connectivity
      await triggerSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
      checkPendingCount();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check of pending sync items
    checkPendingCount();

    const interval = setInterval(checkPendingCount, 10000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const checkPendingCount = async () => {
    const count = await getPendingSyncCount();
    setPendingCount(count);
  };

  const triggerSync = async () => {
    setIsSyncing(true);
    try {
      const result = await syncPendingSales();
      if (result.syncedCount > 0) {
        setSyncFeedback(`¡${result.syncedCount} remisión(es) sincronizada(s) con el servidor!`);
        setTimeout(() => setSyncFeedback(null), 4000);
        onSyncComplete?.();
      }
      await checkPendingCount();
    } catch (e) {
      console.warn('Error en sincronización manual:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  // If online and no pending items and no sync feedback, keep header clean
  if (isOnline && pendingCount === 0 && !syncFeedback) {
    return null;
  }

  return (
    <div className="w-full transition-all duration-200 sticky top-14 md:top-16 z-30 shadow-xs">
      {/* Offline State Banner (Yellow #FFCA00 - PRD Spec 1.4) */}
      {!isOnline && (
        <div className="bg-[#FFCA00] text-[#003E78] px-4 py-2 flex items-center justify-between text-xs font-bold border-b border-[#D97706]">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-[#003E78] shrink-0" />
            <span>
              Modo Offline (Sin Cobertura) — Las ventas se guardan en tu dispositivo (IndexedDB) y se
              sincronizarán al reconectar.
            </span>
          </div>
          {pendingCount > 0 && (
            <span className="bg-[#003E78] text-white px-2.5 py-0.5 rounded-[5px] text-[11px] font-extrabold shrink-0 ml-2">
              {pendingCount} en cola local
            </span>
          )}
        </div>
      )}

      {/* Online but pending sync */}
      {isOnline && pendingCount > 0 && (
        <div className="bg-blue-50 border-b border-[#E0E6ED] text-[#003E78] px-4 py-2 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              Tienes <strong>{pendingCount} venta(s) guardada(s) localmente</strong> pendiente(s) de sincronizar con Oracle Cloud.
            </span>
          </div>
          <button
            onClick={triggerSync}
            disabled={isSyncing}
            className="btn-ultracem-primary text-[11px] px-3.5 py-1 flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar ahora'}</span>
          </button>
        </div>
      )}

      {/* Success Sync Feedback Toast */}
      {syncFeedback && (
        <div className="bg-emerald-50 border-b border-emerald-300 text-emerald-800 px-4 py-2 flex items-center justify-center gap-2 text-xs font-bold animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 text-[#38A169]" />
          <span>{syncFeedback}</span>
        </div>
      )}
    </div>
  );
};

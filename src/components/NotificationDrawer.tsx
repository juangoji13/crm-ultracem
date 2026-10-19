'use client';

import React, { useState } from 'react';
import { X, Bell, CheckCircle2, AlertCircle, Trophy, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { NotificationItem } from '@/lib/types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onCorrectSale?: (saleId?: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onCorrectSale,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'aprobadas' | 'correccion' | 'metas'>('all');

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter((item) => {
    if (activeTab === 'aprobadas') return item.type === 'aprobacion';
    if (activeTab === 'correccion') return item.type === 'rechazo';
    if (activeTab === 'metas') return item.type === 'meta_cumplida';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#F4F6F9] shadow-2xl flex flex-col border-l border-[#E0E6ED]">
          {/* Header */}
          <div className="h-16 bg-[#003E78] px-5 flex items-center justify-between text-white shadow-sm shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <Bell className="w-5 h-5 text-white" />
                <span className="absolute -top-1 -right-1.5 w-2 h-2 bg-[#E53E3E] rounded-full" />
              </div>
              <h2 className="font-bold text-base tracking-wide">Notificaciones</h2>
              <span className="bg-[#002B54] text-[#FFCA00] border border-[#FFCA00]/40 text-xs font-bold px-2.5 py-0.5 rounded-[5px] ml-1">
                {notifications.filter((n) => !n.read).length} nuevas
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-1.5 rounded-md hover:bg-white/10 transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs Filter Bar */}
          <div className="bg-white border-b border-[#E0E6ED] px-4 py-2.5 flex gap-1.5 overflow-x-auto shrink-0">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-[5px] text-xs font-semibold transition-all ${
                activeTab === 'all'
                  ? 'bg-[#003E78] text-white shadow-xs'
                  : 'bg-[#F4F6F9] border border-[#E0E6ED] text-[#4A5568] hover:bg-slate-200'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setActiveTab('aprobadas')}
              className={`px-3 py-1 rounded-[5px] text-xs font-semibold transition-all ${
                activeTab === 'aprobadas'
                  ? 'bg-[#003E78] text-white shadow-xs'
                  : 'bg-[#F4F6F9] border border-[#E0E6ED] text-[#4A5568] hover:bg-slate-200'
              }`}
            >
              Aprobadas
            </button>
            <button
              onClick={() => setActiveTab('correccion')}
              className={`px-3 py-1 rounded-[5px] text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'correccion'
                  ? 'bg-[#003E78] text-white shadow-xs'
                  : 'bg-[#F4F6F9] border border-[#E0E6ED] text-[#4A5568] hover:bg-slate-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-[1px] bg-[#E53E3E]" />
              Por Corregir
            </button>
            <button
              onClick={() => setActiveTab('metas')}
              className={`px-3 py-1 rounded-[5px] text-xs font-semibold transition-all ${
                activeTab === 'metas'
                  ? 'bg-[#003E78] text-white shadow-xs'
                  : 'bg-[#F4F6F9] border border-[#E0E6ED] text-[#4A5568] hover:bg-slate-200'
              }`}
            >
              Metas
            </button>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No hay notificaciones en esta categoría</p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`bg-white rounded-lg p-4 shadow-xs border border-[#E0E6ED] relative transition-all ${
                    notif.type === 'aprobacion'
                      ? 'border-l-4 border-l-[#38A169]'
                      : notif.type === 'rechazo'
                      ? 'border-l-4 border-l-[#E53E3E]'
                      : notif.type === 'meta_cumplida'
                      ? 'border-l-4 border-l-[#FFCA00]'
                      : 'border-l-4 border-l-amber-500'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      {notif.type === 'aprobacion' && (
                        <CheckCircle2 className="w-4 h-4 text-[#38A169]" />
                      )}
                      {notif.type === 'rechazo' && (
                        <AlertCircle className="w-4 h-4 text-[#E53E3E]" />
                      )}
                      {notif.type === 'meta_cumplida' && (
                        <Trophy className="w-4 h-4 text-[#FFCA00]" />
                      )}
                      {notif.type === 'sla_vencido' && (
                        <Clock className="w-4 h-4 text-amber-500" />
                      )}
                      <h3 className="font-bold text-xs text-[#003E78]">{notif.title}</h3>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium shrink-0">
                      {notif.created_at}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">{notif.message}</p>

                  {/* Context Actions */}
                  {notif.type === 'rechazo' && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-end">
                      <button
                        onClick={() => {
                          onClose();
                          onCorrectSale?.(notif.reference_id);
                        }}
                        className="btn-ultracem-primary text-xs px-4 py-1.5 flex items-center gap-1.5 shadow-xs"
                      >
                        Corregir Venta
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {notif.type === 'meta_cumplida' && (
                    <div className="mt-2.5 bg-amber-50/70 border border-amber-200/60 rounded-[5px] px-2.5 py-1 text-[11px] text-[#B7791F] font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#FFCA00] shrink-0" />
                      <span>Bonificación desbloqueada para redención</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-white border-t border-[#E0E6ED] text-center">
            <button className="text-xs font-semibold text-[#1E83EC] hover:underline">
              Marcar todas como leídas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

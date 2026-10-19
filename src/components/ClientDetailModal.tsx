'use client';

import React from 'react';
import { Client, Sale } from '@/lib/types';
import { RecencyBadge } from './RecencyBadge';
import {
  X,
  Building2,
  MapPin,
  Phone,
  MessageCircle,
  Calendar,
  Package,
  FileText,
  Clock,
  AlertCircle,
  PlusCircle,
  User,
  Hash,
  Zap,
  Sparkles,
} from 'lucide-react';
import { isClientCritical } from '@/lib/gamification';

export interface ClientDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  salesHistory?: Sale[];
  onRegisterSale?: (client: Client) => void;
}

export const ClientDetailModal: React.FC<ClientDetailModalProps> = ({
  isOpen,
  onClose,
  client,
  salesHistory = [],
  onRegisterSale,
}) => {
  if (!isOpen || !client) return null;

  // Filter sales for this specific client
  const clientSales = salesHistory.filter(
    (s) => s.client_id === client.id || s.client_name === client.business_name
  );

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Sin fecha';
    try {
      const d = new Date(dateString);
      return isNaN(d.getTime()) ? dateString : d.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const handleRegisterSale = () => {
    onClose();
    if (onRegisterSale) {
      onRegisterSale(client);
    }
  };

  // WhatsApp prefilled message
  const whatsappUrl = client.contact_whatsapp
    ? `https://wa.me/${client.contact_whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
        `Hola, me comunico desde Ultracem S.A.S. con respecto a sus requerimientos de ${client.usual_product}.`
      )}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-[#E0E6ED] animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="client-modal-title"
      >
        {/* ===================================================================== */}
        {/* HEADER CORPORATIVO ULTRACEM (#003E78) */}
        {/* ===================================================================== */}
        <div className="bg-[#003E78] text-white px-5 py-4 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Building2 className="w-5 h-5 text-[#FFCA00]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="client-modal-title" className="font-bold text-base sm:text-lg tracking-wide leading-tight text-white">
                  {client.business_name}
                </h2>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                NIT: <span className="font-mono text-white/90">{client.nit}</span> · Zona {client.zone}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-md hover:bg-white/10 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ===================================================================== */}
        {/* BODY (SCROLLABLE) */}
        {/* ===================================================================== */}
        <div className="p-5 overflow-y-auto space-y-5 text-slate-700 text-xs sm:text-sm">
          {/* Status & Recency Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Semáforo de Recencia:
              </span>
              <RecencyBadge status={client.recency_status} days={client.days_since_last_purchase} />
            </div>

            {/* Quick Contact Buttons */}
            <div className="flex items-center gap-2">
              {client.contact_phone && (
                <a
                  href={`tel:${client.contact_phone}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] border border-slate-300 bg-white text-slate-700 hover:text-[#003E78] hover:border-[#003E78] text-xs font-semibold transition-all shadow-2xs"
                  title="Llamar al cliente"
                >
                  <Phone className="w-3.5 h-3.5 text-[#003E78]" />
                  <span>{client.contact_phone}</span>
                </a>
              )}
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] bg-[#38A169] text-white hover:bg-emerald-700 text-xs font-semibold transition-all shadow-2xs"
                  title="Enviar WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              )}
            </div>
          </div>

          {/* Multiplicador de Reactivación de Clientes Críticos (HU-GAM-03) */}
          {isClientCritical(client) && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-amber-500/10 border border-[#FFCA00] rounded-[5px] shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[5px] bg-[#FFCA00] text-[#003E78] flex items-center justify-center shrink-0 shadow-xs">
                  <Zap className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[5px] bg-[#003E78] text-[#FFCA00] text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-3 h-3 text-[#FFCA00]" />
                    <span>Bono Reactivación 2X (+250 Pts)</span>
                  </div>
                  <p className="text-xs text-slate-700 mt-1">
                    Cliente en estado crítico (&gt;30 días sin comprar). Registrar una venta a este cliente otorga <strong>doble puntuación</strong> (+250 Puntos Ultra en vez de 125) para incentivar la retención de cartera.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Client Key Information Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Ubicación */}
            <div className="p-3.5 rounded-xl border border-[#E0E6ED] bg-white space-y-1.5">
              <div className="flex items-center gap-2 text-[#003E78] font-bold text-xs uppercase tracking-wider">
                <MapPin className="w-4 h-4 text-[#1E83EC]" />
                <span>Ubicación Comercial</span>
              </div>
              <p className="font-semibold text-slate-900 text-xs sm:text-sm">{client.address}</p>
              <p className="text-xs text-slate-500">
                {client.city}, {client.department} · {client.zone}
              </p>
            </div>

            {/* Producto Habitual */}
            <div className="p-3.5 rounded-xl border border-[#E0E6ED] bg-white space-y-1.5">
              <div className="flex items-center gap-2 text-[#003E78] font-bold text-xs uppercase tracking-wider">
                <Package className="w-4 h-4 text-[#FFCA00]" />
                <span>Producto Habitual</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-[#003E78] font-bold text-xs border border-blue-200">
                  {client.usual_product}
                </span>
                {client.last_purchase_volume && (
                  <span className="text-xs text-slate-600">
                    Último pedido: <strong>{client.last_purchase_volume} Ton</strong>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Última compra registrada: {formatDate(client.last_purchase_date)}
              </p>
            </div>

            {/* Asesor Asignado */}
            <div className="p-3.5 rounded-xl border border-[#E0E6ED] bg-white space-y-1.5">
              <div className="flex items-center gap-2 text-[#003E78] font-bold text-xs uppercase tracking-wider">
                <User className="w-4 h-4 text-[#003E78]" />
                <span>Asesor Comercial Asignado</span>
              </div>
              <p className="font-semibold text-slate-900 text-xs sm:text-sm">
                {client.advisor_name || 'Hichel Espitia'}
              </p>
              <p className="text-[11px] text-slate-500">Fuerza Comercial Ultracem · Zona {client.zone}</p>
            </div>

            {/* Identificación Tributaria */}
            <div className="p-3.5 rounded-xl border border-[#E0E6ED] bg-white space-y-1.5">
              <div className="flex items-center gap-2 text-[#003E78] font-bold text-xs uppercase tracking-wider">
                <Hash className="w-4 h-4 text-slate-500" />
                <span>Identificación Tributaria</span>
              </div>
              <p className="font-semibold text-slate-900 text-xs font-mono">{client.nit}</p>
              <p className="text-[11px] text-slate-500">Cuenta activa y verificada para facturación</p>
            </div>
          </div>

          {/* =================================================================== */}
          {/* HISTORIAL DE COMPRAS RECIENTES */}
          {/* =================================================================== */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#003E78]" />
                <h3 className="font-bold text-xs sm:text-sm text-[#003E78] uppercase tracking-wide">
                  Historial de Compras Recientes
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                {clientSales.length} {clientSales.length === 1 ? 'registro' : 'registros'}
              </span>
            </div>

            {clientSales.length > 0 ? (
              <div className="space-y-2.5">
                {clientSales.map((sale) => (
                  <div
                    key={sale.id}
                    className={`p-3 rounded-xl border transition-all ${
                      sale.status === 'aprobada'
                        ? 'border-l-4 border-l-[#38A169] bg-white border-slate-200 shadow-2xs'
                        : sale.status === 'por_corregir'
                        ? 'border-l-4 border-l-[#E53E3E] bg-red-50/20 border-red-200 shadow-2xs'
                        : 'border-l-4 border-l-[#FFCA00] bg-white border-slate-200 shadow-2xs'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[#003E78] font-mono">
                            {sale.document_number}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              sale.status === 'aprobada'
                                ? 'bg-emerald-100 text-[#38A169]'
                                : sale.status === 'por_corregir'
                                ? 'bg-red-100 text-[#E53E3E]'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {sale.status === 'por_corregir' ? 'Por Corregir' : sale.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          <strong>{sale.volume} {sale.volume_unit}</strong> de {sale.product_type} · {formatCurrency(sale.total_value_cop)}
                        </p>
                      </div>

                      <div className="text-left sm:text-right text-xs text-slate-500 flex sm:flex-col items-center sm:items-end justify-between gap-1">
                        <div className="flex items-center gap-1 text-[11px]">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatDate(sale.submitted_at)}</span>
                        </div>
                        {sale.status === 'aprobada' && (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-[5px] border border-emerald-200">
                            +{sale.ultra_points_awarded || 125} pts
                          </span>
                        )}
                      </div>
                    </div>

                    {sale.rejection_reason && (
                      <div className="mt-2 text-xs bg-red-50 border border-red-200 rounded-md p-2 text-red-800">
                        <p className="font-bold flex items-center gap-1 text-red-900">
                          <AlertCircle className="w-3.5 h-3.5 text-red-600" /> Motivo de corrección:
                        </p>
                        <p className="text-[11px] mt-0.5">{sale.rejection_reason}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : client.last_purchase_date ? (
              // Fallback with client last purchase info
              <div className="p-3.5 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-xs space-y-1">
                <p className="font-semibold text-slate-700">Último despacho histórico registrado:</p>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Package className="w-3.5 h-3.5 text-[#003E78]" />
                  <span><strong>{client.last_purchase_volume || 0} Ton</strong> de {client.usual_product} · Fecha: {formatDate(client.last_purchase_date)}</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Las nuevas ventas registradas en esta PWA aparecerán automáticamente detalladas aquí.
                </p>
              </div>
            ) : (
              <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400">
                <Clock className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                <p className="text-xs">No hay ventas registradas previamente para este cliente.</p>
              </div>
            )}
          </div>
        </div>

        {/* ===================================================================== */}
        {/* FOOTER & ACCIONES PRINCIPALES */}
        {/* ===================================================================== */}
        <div className="p-4 bg-slate-50 border-t border-[#E0E6ED] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-[5px] border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors"
          >
            Cerrar Ficha
          </button>

          <button
            onClick={handleRegisterSale}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#003E78] hover:bg-[#002B54] active:scale-[0.98] text-white font-bold rounded-[5px] text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-[#FFCA00]" />
            <span>Registrar Venta a este Cliente</span>
            {isClientCritical(client) && (
              <span className="px-2 py-0.5 rounded-[5px] bg-[#FFCA00] text-[#003E78] text-[10px] font-extrabold uppercase tracking-wide">
                Bono 2X (+250 Pts)
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

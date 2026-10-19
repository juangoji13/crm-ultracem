'use client';

import React, { useState } from 'react';
import { Sale, User } from '@/lib/types';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  ZoomIn,
  Building2,
  AlertTriangle,
  Award,
  ShieldCheck,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

interface SupervisorDashboardProps {
  user: User;
  sales: Sale[];
  onApproveSale: (saleId: string) => void;
  onRejectSale: (saleId: string, reason: string) => void;
}

export const SupervisorDashboard: React.FC<SupervisorDashboardProps> = ({
  user,
  sales,
  onApproveSale,
  onRejectSale,
}) => {
  const [selectedSaleId, setSelectedSaleId] = useState<string>(sales[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'all' | 'critical' | 'today'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('Comprobante ilegible o sin sellos visibles');
  const [rejectComment, setRejectComment] = useState('');

  // Aggregated Daily Supervisor Turn Metrics (Semana 3)
  const approvedSales = sales.filter((s) => s.status === 'aprobada');
  const rejectedSales = sales.filter((s) => s.status === 'por_corregir' || s.status === 'rechazada');
  const totalReviewed = approvedSales.length + rejectedSales.length;

  const tonsApproved = approvedSales
    .filter((s) => s.volume_unit === 'Ton')
    .reduce((acc, curr) => acc + curr.volume, 0);

  const m3Approved = approvedSales
    .filter((s) => s.volume_unit === 'm3')
    .reduce((acc, curr) => acc + curr.volume, 0);

  const pointsAwarded = approvedSales.reduce((acc, curr) => acc + (curr.ultra_points_awarded || 125), 0);
  const approvalRate = totalReviewed > 0 ? Math.round((approvedSales.length / totalReviewed) * 100) : 100;

  const selectedSale = sales.find((s) => s.id === selectedSaleId) || sales[0];

  const pendingSales = sales.filter((s) => {
    const isPending = s.status === 'pendiente' || s.status === 'por_corregir';
    const matchesSearch =
      s.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.advisor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.document_number.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === 'critical') {
      return isPending && matchesSearch && s.volume > 20; // Simulated critical SLA
    }
    return isPending && matchesSearch;
  });

  const handleApprove = () => {
    if (!selectedSale) return;
    onApproveSale(selectedSale.id);
  };

  const handleReject = () => {
    if (!selectedSale) return;
    onRejectSale(selectedSale.id, `${rejectReason}. ${rejectComment}`);
    setIsRejectOpen(false);
    setRejectComment('');
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)] overflow-hidden bg-[#F4F6F9]">
      {/* ========================================================================= */}
      {/* LEFT PANEL: 40% QUEUE */}
      {/* ========================================================================= */}
      <div className="w-full md:w-[40%] bg-white border-r border-[#E0E6ED] flex flex-col h-full overflow-hidden">
        {/* Header & Filter Bar */}
        <div className="p-4 border-b border-[#E0E6ED] space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-sm text-[#003E78]">Ventas Pendientes de Revisión</h2>
              <p className="text-[11px] text-slate-500">SLA Corporativo: 48 horas hábiles</p>
            </div>
            <span className="bg-blue-50 text-[#003E78] border border-blue-200 text-xs font-bold px-2.5 py-0.5 rounded-[5px]">
              {pendingSales.length} en cola
            </span>
          </div>

          {/* TURN METRICS SUMMARY STRIP (SEMANA 3) */}
          <div className="grid grid-cols-3 gap-2 pt-1 pb-0.5">
            <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2 text-center">
              <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 font-semibold mb-0.5">
                <TrendingUp className="w-3 h-3 text-[#1E83EC]" />
                <span>Validado</span>
              </div>
              <p className="font-extrabold text-[#003E78] text-xs leading-none">
                {tonsApproved > 0 ? `${tonsApproved} Ton` : `${m3Approved} m3`}
              </p>
            </div>

            <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-2 text-center">
              <div className="flex items-center justify-center gap-1 text-[10px] text-[#B7791F] font-semibold mb-0.5">
                <Sparkles className="w-3 h-3 text-[#FFCA00]" />
                <span>Puntos</span>
              </div>
              <p className="font-extrabold text-[#B7791F] text-xs leading-none">
                +{pointsAwarded}
              </p>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-lg p-2 text-center">
              <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-700 font-semibold mb-0.5">
                <ShieldCheck className="w-3 h-3 text-[#38A169]" />
                <span>SLA Hoy</span>
              </div>
              <p className="font-extrabold text-[#38A169] text-xs leading-none">
                {approvalRate}% OK
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar cliente, asesor o remisión..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-ultracem w-full pl-9 py-1.5 text-xs"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex gap-1.5">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-[5px] text-xs font-semibold transition-all ${
                activeTab === 'all'
                  ? 'bg-[#003E78] text-white shadow-xs'
                  : 'bg-white border border-[#E0E6ED] text-[#4A5568] hover:bg-slate-50'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setActiveTab('critical')}
              className={`px-3 py-1 rounded-[5px] text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'critical'
                  ? 'bg-[#E53E3E] text-white shadow-xs'
                  : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              SLA Crítico (2)
            </button>
          </div>
        </div>

        {/* Pending Sales Scrollable List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {pendingSales.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-[#38A169] opacity-40" />
              <p className="text-xs">¡Bandeja al día! No hay ventas pendientes en tu zona.</p>
            </div>
          ) : (
            pendingSales.map((sale) => {
              const isSelected = sale.id === selectedSale?.id;
              return (
                <div
                  key={sale.id}
                  onClick={() => setSelectedSaleId(sale.id)}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'border-2 border-[#1E83EC] bg-blue-50/50 shadow-sm'
                      : 'border-[#E0E6ED] bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <p className="font-bold text-[#003E78] text-xs flex items-center gap-1.5">
                        <span>{sale.advisor_name}</span>
                        <span className="text-slate-400 font-normal">→</span>
                        <span>{sale.client_name}</span>
                      </p>
                      <p className="text-slate-500 font-semibold mt-0.5">
                        {sale.volume} {sale.volume_unit} de {sale.product_type}
                      </p>
                    </div>
                    <span className="font-extrabold text-[#003E78]">
                      ${(sale.total_value_cop / 1000000).toFixed(1)}M
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                    <span className="font-mono">#{sale.document_number}</span>
                    <span className="flex items-center gap-1 text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-[5px] font-semibold">
                      <Clock className="w-3 h-3 text-[#38A169]" />
                      SLA: 24h restantes
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT PANEL: 60% AUDIT & APPROVAL DETAIL */}
      {/* ========================================================================= */}
      <div className="w-full md:w-[60%] flex-1 overflow-y-auto p-4 md:p-6 space-y-5 bg-[#F4F6F9]">
        {!selectedSale ? (
          <div className="text-center py-20 text-slate-400">
            <p>Selecciona una venta de la lista para auditar</p>
          </div>
        ) : (
          <>
            {/* Top Detail Card */}
            <div className="card-ultracem p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-[#003E78]">
                    Detalle de Venta #{selectedSale.document_number}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Enviada por {selectedSale.advisor_name} (Zona {user.zone})
                  </p>
                </div>
                <span className="bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold px-3 py-1 rounded-[5px] uppercase">
                  {selectedSale.status}
                </span>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-lg">
                  <span className="text-slate-400 block font-medium">Cliente</span>
                  <span className="font-bold text-[#003E78]">{selectedSale.client_name}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg">
                  <span className="text-slate-400 block font-medium">Producto</span>
                  <span className="font-bold text-[#003E78]">{selectedSale.product_type}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg">
                  <span className="text-slate-400 block font-medium">Volumen Declarado</span>
                  <span className="font-bold text-[#003E78]">
                    {selectedSale.volume} {selectedSale.volume_unit}
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg">
                  <span className="text-slate-400 block font-medium">Valor Total</span>
                  <span className="font-bold text-[#003E78]">
                    ${(selectedSale.total_value_cop / 1000000).toFixed(2)}M COP
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg">
                  <span className="text-slate-400 block font-medium">Fecha de Envío</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(selectedSale.submitted_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg">
                  <span className="text-slate-400 block font-medium">Puntos a Acreditar</span>
                  <span className="font-bold text-[#B7791F]">+125 Puntos Ultra</span>
                </div>
              </div>
            </div>

            {/* Middle Receipt Viewer Card */}
            <div className="card-ultracem p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-[#003E78] uppercase tracking-wider">
                  Comprobante Adjunto (Remisión de Báscula)
                </h4>
                <a
                  href={selectedSale.receipt_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-[#1E83EC] flex items-center gap-1 hover:underline"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                  Ver en alta resolución
                </a>
              </div>

              {/* Document Image Container */}
              <div className="border border-[#E0E6ED] rounded-xl overflow-hidden bg-slate-900/5 max-h-72 flex items-center justify-center p-3 relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedSale.receipt_url}
                  alt="Comprobante de despacho"
                  className="max-h-64 object-contain rounded-md shadow-xs"
                />
              </div>
              <p className="text-[11px] text-slate-400 italic text-center">
                Verifique que el volumen y sellos coincidan con la orden de báscula de Planta.
              </p>
            </div>

            {/* Bottom Decision & Gamification Banner */}
            <div className="card-ultracem p-5 space-y-4">
              <div className="bg-amber-50 border border-amber-200/80 p-3 rounded-lg flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#FFCA00]" />
                  <div>
                    <span className="font-bold text-[#003E78]">Bonificación de Gamificación:</span>
                    <span className="text-slate-600 block">
                      Al aprobar, se sumarán <strong>+125 Puntos Ultra</strong> al asesor {selectedSale.advisor_name}.
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={handleApprove}
                  className="btn-ultracem-primary py-3 text-xs flex items-center justify-center gap-2 shadow-sm uppercase tracking-wider"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Aprobar Venta
                </button>
                <button
                  onClick={() => setIsRejectOpen(!isRejectOpen)}
                  className="btn-ultracem-secondary py-3 text-xs flex items-center justify-center gap-2 uppercase tracking-wider hover:border-red-500 hover:text-red-700"
                >
                  <XCircle className="w-4 h-4" />
                  Rechazar Venta
                </button>
              </div>

              {/* Expandable Rejection Reason Area */}
              {isRejectOpen && (
                <div className="p-4 bg-red-50/50 border border-red-200 rounded-xl space-y-3 animate-in fade-in duration-150">
                  <label className="font-bold text-xs text-red-900 block">
                    Motivo obligatorio de rechazo / devolución:
                  </label>
                  <select
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="input-ultracem w-full text-xs"
                  >
                    <option value="Comprobante ilegible o sin sellos visibles">
                      Comprobante ilegible o sin sellos visibles
                    </option>
                    <option value="Discrepancia en volumen reportado vs báscula">
                      Discrepancia en volumen reportado vs báscula
                    </option>
                    <option value="Remisión duplicada o ya contabilizada">
                      Remisión duplicada o ya contabilizada
                    </option>
                    <option value="Cliente no coincide con la remisión">
                      Cliente no coincide con la remisión
                    </option>
                  </select>
                  <textarea
                    placeholder="Escribe observaciones adicionales para que el asesor corrija la remisión..."
                    value={rejectComment}
                    onChange={(e) => setRejectComment(e.target.value)}
                    className="input-ultracem w-full text-xs"
                    rows={2}
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => setIsRejectOpen(false)}
                      className="px-3 py-1.5 text-xs text-slate-500 hover:underline"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleReject}
                      className="bg-[#E53E3E] hover:bg-red-700 text-white font-bold text-xs px-4 py-1.5 rounded-[3px] transition-colors"
                    >
                      Confirmar Rechazo
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

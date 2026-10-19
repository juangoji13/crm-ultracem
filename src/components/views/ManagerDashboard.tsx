'use client';

import React, { useState } from 'react';
import { User, Client, Goal, Sale } from '@/lib/types';
import {
  Download,
  Users,
  TrendingUp,
  PackageCheck,
  Trophy,
  Filter,
  Layers,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  ZoomIn,
  Building2,
  AlertTriangle,
  Award,
  ShieldCheck,
  Sparkles,
  BarChart3,
  FileCheck,
} from 'lucide-react';

interface ManagerDashboardProps {
  user: User;
  clients: Client[];
  goals: Goal[];
  sales: Sale[];
  onExportCSV: () => void;
  onApproveSale?: (saleId: string) => void;
  onRejectSale?: (saleId: string, reason: string) => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({
  user,
  clients,
  goals,
  sales,
  onExportCSV,
  onApproveSale,
  onRejectSale,
}) => {
  // Tab switcher for Gerente: Auditoría de Ventas vs Métricas Ejecutivas
  const [managerView, setManagerView] = useState<'audit' | 'metrics'>('audit');

  // Metrics filters
  const [selectedPeriod, setSelectedPeriod] = useState<'1w' | '15d' | '1m' | 'all'>('1m');

  // Audit state
  const pendingSales = sales.filter((s) => s.status === 'pendiente' || s.status === 'por_corregir');
  const [selectedSaleId, setSelectedSaleId] = useState<string>(pendingSales[0]?.id || sales[0]?.id || '');
  const [auditFilter, setAuditFilter] = useState<'all' | 'critical'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('Comprobante ilegible o sin sellos visibles');
  const [rejectComment, setRejectComment] = useState('');

  // Daily audit turn metrics
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

  // Selected sale for audit
  const filteredPendingSales = pendingSales.filter((s) => {
    const matchesSearch =
      s.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.advisor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.document_number.toLowerCase().includes(searchTerm.toLowerCase());

    if (auditFilter === 'critical') {
      return matchesSearch && s.volume > 20;
    }
    return matchesSearch;
  });

  const selectedSale = sales.find((s) => s.id === selectedSaleId) || filteredPendingSales[0] || sales[0];

  const handleApprove = () => {
    if (!selectedSale || !onApproveSale) return;
    onApproveSale(selectedSale.id);
  };

  const handleReject = () => {
    if (!selectedSale || !onRejectSale) return;
    onRejectSale(selectedSale.id, `${rejectReason}. ${rejectComment}`);
    setIsRejectOpen(false);
    setRejectComment('');
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F4F6F9] min-h-0">
      {/* ========================================================================= */}
      {/* 1. GERENTE SUB-NAV: AUDITORÍA DE REMISIONES vs MÉTRICAS EJECUTIVAS        */}
      {/* ========================================================================= */}
      <div className="bg-white border-b border-[#E0E6ED] px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#003E78] uppercase tracking-wider hidden sm:inline">
            Panel de Dirección:
          </span>
          <div className="flex bg-[#F4F6F9] border border-[#E0E6ED] p-1 rounded-[6px] text-xs font-semibold">
            <button
              onClick={() => setManagerView('audit')}
              className={`px-3.5 py-1.5 rounded-[4px] transition-all flex items-center gap-2 cursor-pointer ${
                managerView === 'audit'
                  ? 'bg-[#003E78] text-white shadow-xs font-bold'
                  : 'text-[#4A5568] hover:text-[#003E78]'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Auditoría de Ventas</span>
              {pendingSales.length > 0 && (
                <span
                  className={`text-[10px] font-black px-1.5 py-0.2 rounded-[3px] ${
                    managerView === 'audit'
                      ? 'bg-[#FFCA00] text-[#003E78]'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {pendingSales.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setManagerView('metrics')}
              className={`px-3.5 py-1.5 rounded-[4px] transition-all flex items-center gap-2 cursor-pointer ${
                managerView === 'metrics'
                  ? 'bg-[#003E78] text-white shadow-xs font-bold'
                  : 'text-[#4A5568] hover:text-[#003E78]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Métricas Ejecutivas</span>
            </button>
          </div>
        </div>

        {/* Action button based on active sub-view */}
        {managerView === 'metrics' ? (
          <div className="flex items-center gap-2">
            <div className="flex bg-[#F4F6F9] border border-[#E0E6ED] p-0.5 rounded-[6px] text-xs font-semibold">
              <button
                onClick={() => setSelectedPeriod('1w')}
                className={`px-2.5 py-1 rounded-[4px] transition-all cursor-pointer ${
                  selectedPeriod === '1w' ? 'bg-[#003E78] text-white shadow-xs font-bold' : 'text-[#4A5568]'
                }`}
              >
                1 Sem
              </button>
              <button
                onClick={() => setSelectedPeriod('15d')}
                className={`px-2.5 py-1 rounded-[4px] transition-all cursor-pointer ${
                  selectedPeriod === '15d' ? 'bg-[#003E78] text-white shadow-xs font-bold' : 'text-[#4A5568]'
                }`}
              >
                15 Días
              </button>
              <button
                onClick={() => setSelectedPeriod('1m')}
                className={`px-2.5 py-1 rounded-[4px] transition-all cursor-pointer ${
                  selectedPeriod === '1m' ? 'bg-[#003E78] text-white shadow-xs font-bold' : 'text-[#4A5568]'
                }`}
              >
                1 Mes
              </button>
              <button
                onClick={() => setSelectedPeriod('all')}
                className={`px-2.5 py-1 rounded-[4px] transition-all cursor-pointer ${
                  selectedPeriod === 'all' ? 'bg-[#003E78] text-white shadow-xs font-bold' : 'text-[#4A5568]'
                }`}
              >
                Todos
              </button>
            </div>

            <button
              onClick={onExportCSV}
              className="btn-ultracem-secondary text-xs px-3 py-1.5 flex items-center gap-1.5 shadow-xs hover:border-[#1E83EC] hover:text-[#1E83EC] cursor-pointer"
              title="Descargar reporte consolidado en CSV"
            >
              <Download className="w-3.5 h-3.5 text-[#1E83EC]" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              SLA Corporativo: <strong className="text-[#003E78]">48h</strong>
            </span>
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-2.5 py-1 rounded-[5px] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{approvalRate}% Cumplimiento SLA</span>
            </span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. SUB-VIEW 1: AUDITORÍA DE REMISIONES Y VENTAS                           */}
      {/* ========================================================================= */}
      {managerView === 'audit' && (
        <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-6.5rem)] overflow-hidden">
          {/* LEFT PANEL: 40% Pending Sales Queue */}
          <div className="w-full md:w-[40%] bg-white border-r border-[#E0E6ED] flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-[#E0E6ED] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-sm text-[#003E78]">Remisiones Pendientes de Auditoría</h2>
                  <p className="text-[11px] text-slate-500">Revisión de báscula y despacho</p>
                </div>
                <span className="bg-blue-50 text-[#003E78] border border-blue-200 text-xs font-bold px-2.5 py-0.5 rounded-[5px]">
                  {pendingSales.length} en cola
                </span>
              </div>

              {/* Turn Metrics Summary Strip */}
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

              {/* Search Bar */}
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
                  onClick={() => setAuditFilter('all')}
                  className={`px-3 py-1 rounded-[5px] text-xs font-semibold transition-all cursor-pointer ${
                    auditFilter === 'all'
                      ? 'bg-[#003E78] text-white shadow-xs'
                      : 'bg-white border border-[#E0E6ED] text-[#4A5568] hover:bg-slate-50'
                  }`}
                >
                  Todas ({pendingSales.length})
                </button>
                <button
                  onClick={() => setAuditFilter('critical')}
                  className={`px-3 py-1 rounded-[5px] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    auditFilter === 'critical'
                      ? 'bg-[#E53E3E] text-white shadow-xs'
                      : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                  }`}
                >
                  <AlertTriangle className="w-3 h-3" />
                  SLA Crítico (&gt;20 Ton)
                </button>
              </div>
            </div>

            {/* Pending Sales Scrollable List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {filteredPendingSales.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-[#38A169] opacity-40" />
                  <p className="text-xs">¡Bandeja al día! No hay remisiones pendientes de validación.</p>
                </div>
              ) : (
                filteredPendingSales.map((sale) => {
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

          {/* RIGHT PANEL: 60% Document Inspection & Approval Actions */}
          <div className="w-full md:w-[60%] flex-1 overflow-y-auto p-4 md:p-6 space-y-5 bg-[#F4F6F9]">
            {!selectedSale ? (
              <div className="text-center py-20 text-slate-400">
                <p>Selecciona una remisión de la lista para auditar</p>
              </div>
            ) : (
              <>
                {/* Detail Card */}
                <div className="card-ultracem p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="font-bold text-sm text-[#003E78]">
                        Detalle de Remisión #{selectedSale.document_number}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Asesor: <strong>{selectedSale.advisor_name}</strong>
                      </p>
                    </div>
                    <span className="bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold px-3 py-1 rounded-[5px] uppercase">
                      {selectedSale.status}
                    </span>
                  </div>

                  {/* Grid */}
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
                      <span className="font-bold text-[#B7791F]">
                        +{selectedSale.ultra_points_awarded || 125} Pts Ultra
                      </span>
                    </div>
                  </div>
                </div>

                {/* Receipt Image Viewer Card */}
                <div className="card-ultracem p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-[#003E78] uppercase tracking-wider">
                      Comprobante Adjunto (Remisión de Báscula / Despacho)
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

                {/* Decision Actions Card */}
                <div className="card-ultracem p-5 space-y-4">
                  <div className="bg-amber-50 border border-amber-200/80 p-3 rounded-lg flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-[#FFCA00]" />
                      <div>
                        <span className="font-bold text-[#003E78]">Bonificación de Gamificación:</span>
                        <span className="text-slate-600 block">
                          Al aprobar, se sumarán <strong>+{selectedSale.ultra_points_awarded || 125} Puntos Ultra</strong> al asesor {selectedSale.advisor_name}.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Approve / Reject Buttons */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      onClick={handleApprove}
                      className="btn-ultracem-primary py-3 text-xs flex items-center justify-center gap-2 shadow-sm uppercase tracking-wider cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Aprobar Remisión
                    </button>
                    <button
                      onClick={() => setIsRejectOpen(!isRejectOpen)}
                      className="btn-ultracem-secondary py-3 text-xs flex items-center justify-center gap-2 uppercase tracking-wider hover:border-red-500 hover:text-red-700 cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      Rechazar / Solicitar Corrección
                    </button>
                  </div>

                  {/* Rejection Form */}
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
                          className="px-3 py-1.5 text-xs text-slate-500 hover:underline cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleReject}
                          className="bg-[#E53E3E] hover:bg-red-700 text-white font-bold text-xs px-4 py-1.5 rounded-[4px] transition-colors cursor-pointer"
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
      )}

      {/* ========================================================================= */}
      {/* 3. SUB-VIEW 2: MÉTRICAS EJECUTIVAS Y CONSOLIDADO                          */}
      {/* ========================================================================= */}
      {managerView === 'metrics' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 w-full overflow-y-auto">
          {/* Top 4 Primary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1 */}
            <div className="card-ultracem p-5">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Clientes Activos
                </span>
                <Users className="w-4 h-4 text-[#1E83EC]" />
              </div>
              <p className="text-2xl font-bold text-[#003E78]">1,248</p>
              <p className="text-xs text-emerald-600 font-semibold mt-1">
                ↑ +6.2% vs mes anterior (84% cartera activa)
              </p>
            </div>

            {/* KPI 2 */}
            <div className="card-ultracem p-5">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Volumen Despachado
                </span>
                <TrendingUp className="w-4 h-4 text-[#003E78]" />
              </div>
              <p className="text-2xl font-bold text-[#003E78]">18,450 Ton</p>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Meta: 22,000 Ton (<strong className="text-[#1E83EC]">83.8%</strong>)
              </p>
            </div>

            {/* KPI 3 */}
            <div className="card-ultracem p-5">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Ventas Aprobadas
                </span>
                <PackageCheck className="w-4 h-4 text-[#38A169]" />
              </div>
              <p className="text-2xl font-bold text-[#003E78]">{approvedSales.length} remisiones</p>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Total facturado: <strong className="text-[#003E78]">$28,450M COP</strong>
              </p>
            </div>

            {/* KPI 4 */}
            <div className="card-ultracem p-5">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Puntos Ultra en Circulación
                </span>
                <Trophy className="w-4 h-4 text-[#FFCA00]" />
              </div>
              <p className="text-2xl font-bold text-[#B7791F]">485,200 pts</p>
              <p className="text-xs text-slate-500 font-medium mt-1">
                88% asesores con meta activa cumplida
              </p>
            </div>
          </div>

          {/* Breakdown by Product & Zones */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Product Mix (7 cols) */}
            <div className="lg:col-span-7 card-ultracem p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#003E78] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#1E83EC]" />
                  <span>Volumen por Categoría de Producto</span>
                </h2>
                <span className="text-xs text-slate-400">Total: 18,450 Ton/m³</span>
              </div>

              <div className="space-y-3 pt-1 text-xs">
                {/* Cemento */}
                <div>
                  <div className="flex justify-between font-bold text-slate-800 mb-1">
                    <span>Cemento Gris (Uso General y Estructural)</span>
                    <span className="text-[#003E78]">12,200 Ton (66%)</span>
                  </div>
                  <div className="w-full bg-[#E0E6ED] h-2.5 rounded-[4px] overflow-hidden">
                    <div className="h-full bg-[#003E78] rounded-[4px]" style={{ width: '66%' }} />
                  </div>
                </div>

                {/* Concreto */}
                <div>
                  <div className="flex justify-between font-bold text-slate-800 mb-1">
                    <span>Concreto Premezclado</span>
                    <span className="text-[#1E83EC]">3,850 m³ (21%)</span>
                  </div>
                  <div className="w-full bg-[#E0E6ED] h-2.5 rounded-[4px] overflow-hidden">
                    <div className="h-full bg-[#1E83EC] rounded-[4px]" style={{ width: '21%' }} />
                  </div>
                </div>

                {/* Mezcla Lista */}
                <div>
                  <div className="flex justify-between font-bold text-slate-800 mb-1">
                    <span>Mezcla Lista &amp; Morteros</span>
                    <span className="text-slate-600">1,400 Ton (8%)</span>
                  </div>
                  <div className="w-full bg-[#E0E6ED] h-2.5 rounded-[4px] overflow-hidden">
                    <div className="h-full bg-slate-500 rounded-[4px]" style={{ width: '8%' }} />
                  </div>
                </div>

                {/* Pegantes */}
                <div>
                  <div className="flex justify-between font-bold text-slate-800 mb-1">
                    <span>Pegantes Cerámicos</span>
                    <span className="text-[#B7791F]">1,000 Ton (5%)</span>
                  </div>
                  <div className="w-full bg-[#E0E6ED] h-2.5 rounded-[4px] overflow-hidden">
                    <div className="h-full bg-[#FFCA00] rounded-[4px]" style={{ width: '5%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Zones Compliance (5 cols) */}
            <div className="lg:col-span-5 card-ultracem p-5 space-y-4">
              <h2 className="text-sm font-bold text-[#003E78]">Cumplimiento por Zonas</h2>
              <div className="space-y-3.5 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
                  <div>
                    <p className="font-bold text-[#003E78]">Zona Atlántico</p>
                    <p className="text-[11px] text-slate-500">Líder: Milena Ospino</p>
                  </div>
                  <span className="font-extrabold text-[#38A169] text-sm">92%</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
                  <div>
                    <p className="font-bold text-[#003E78]">Zona Bolívar</p>
                    <p className="text-[11px] text-slate-500">Líder: Adriana Anaya</p>
                  </div>
                  <span className="font-extrabold text-[#1E83EC] text-sm">84%</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
                  <div>
                    <p className="font-bold text-[#003E78]">Zona Córdoba</p>
                    <p className="text-[11px] text-slate-500">Líder: Hichel Espitia</p>
                  </div>
                  <span className="font-extrabold text-amber-600 text-sm">76%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hierarchical Table */}
          <div className="card-ultracem p-5 space-y-4">
            <h2 className="text-sm font-bold text-[#003E78]">
              Fuerza de Ventas y Rendimiento por Asesor
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-[#E0E6ED]">
                  <tr>
                    <th className="py-2.5 px-3">Asesor</th>
                    <th className="py-2.5 px-3">Zona</th>
                    <th className="py-2.5 px-3">Clientes Asignados</th>
                    <th className="py-2.5 px-3">Puntos Ultra</th>
                    <th className="py-2.5 px-3">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-bold text-[#003E78]">Hichel Espitia</td>
                    <td className="py-2.5 px-3">Córdoba</td>
                    <td className="py-2.5 px-3">3 clientes</td>
                    <td className="py-2.5 px-3 font-bold text-[#B7791F]">1,250 pts</td>
                    <td className="py-2.5 px-3">
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-[5px] font-bold">
                        Meta 75%
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-bold text-[#003E78]">Milena Ospino</td>
                    <td className="py-2.5 px-3">Atlántico</td>
                    <td className="py-2.5 px-3">1 cliente</td>
                    <td className="py-2.5 px-3 font-bold text-[#B7791F]">950 pts</td>
                    <td className="py-2.5 px-3">
                      <span className="bg-blue-50 text-[#003E78] border border-blue-200 px-2.5 py-0.5 rounded-[5px] font-bold">
                        Meta 60%
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-bold text-[#003E78]">Adriana Anaya</td>
                    <td className="py-2.5 px-3">Bolívar</td>
                    <td className="py-2.5 px-3">1 cliente</td>
                    <td className="py-2.5 px-3 font-bold text-[#B7791F]">1,820 pts</td>
                    <td className="py-2.5 px-3">
                      <span className="bg-amber-50 text-[#B7791F] border border-amber-200 px-2.5 py-0.5 rounded-[5px] font-bold">
                        Meta 90%
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

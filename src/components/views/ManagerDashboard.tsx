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
  ChevronRight,
  Layers,
} from 'lucide-react';

interface ManagerDashboardProps {
  user: User;
  clients: Client[];
  goals: Goal[];
  sales: Sale[];
  onExportCSV: () => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({
  user,
  clients,
  goals,
  sales,
  onExportCSV,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'1w' | '15d' | '1m' | 'all'>('1m');
  const [selectedZone, setSelectedZone] = useState<string>('all');

  const totalVolume = sales.reduce((acc, s) => acc + s.volume, 0);
  const totalApproved = sales.filter((s) => s.status === 'aprobada').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* 1. Header with Breadcrumb and Period Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#E0E6ED] shadow-xs">
        <div>
          <span className="text-[11px] font-bold text-[#1E83EC] uppercase tracking-wider">
            Ultracem Nacional &gt; Dirección Comercial
          </span>
          <h1 className="text-xl font-bold text-[#003E78]">Tablero Ejecutivo de Rendimiento</h1>
        </div>

        {/* Temporal Filters & Export CTA */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-[#F4F6F9] border border-[#E0E6ED] p-1 rounded-[6px] text-xs font-semibold">
            <button
              onClick={() => setSelectedPeriod('1w')}
              className={`px-3 py-1 rounded-[4px] transition-all ${
                selectedPeriod === '1w' ? 'bg-[#003E78] text-white shadow-xs font-bold' : 'text-[#4A5568] hover:text-[#003E78]'
              }`}
            >
              1 Sem
            </button>
            <button
              onClick={() => setSelectedPeriod('15d')}
              className={`px-3 py-1 rounded-[4px] transition-all ${
                selectedPeriod === '15d' ? 'bg-[#003E78] text-white shadow-xs font-bold' : 'text-[#4A5568] hover:text-[#003E78]'
              }`}
            >
              15 Días
            </button>
            <button
              onClick={() => setSelectedPeriod('1m')}
              className={`px-3 py-1 rounded-[4px] transition-all ${
                selectedPeriod === '1m' ? 'bg-[#003E78] text-white shadow-xs font-bold' : 'text-[#4A5568] hover:text-[#003E78]'
              }`}
            >
              1 Mes
            </button>
            <button
              onClick={() => setSelectedPeriod('all')}
              className={`px-3 py-1 rounded-[4px] transition-all ${
                selectedPeriod === 'all' ? 'bg-[#003E78] text-white shadow-xs font-bold' : 'text-[#4A5568] hover:text-[#003E78]'
              }`}
            >
              Todos
            </button>
          </div>

          <button
            onClick={onExportCSV}
            className="btn-ultracem-secondary text-xs px-3.5 py-1.5 flex items-center gap-1.5 shadow-xs hover:border-[#1E83EC] hover:text-[#1E83EC]"
            title="Descargar reporte consolidado en CSV"
          >
            <Download className="w-3.5 h-3.5 text-[#1E83EC]" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Top 4 Primary KPI Cards (28px Bold) */}
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
          <p className="text-2xl font-bold text-[#003E78]">1,120 remisiones</p>
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

      {/* 3. Breakdown by Product & Zones */}
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
                <p className="text-[11px] text-slate-500">Supervisora: María López</p>
              </div>
              <span className="font-extrabold text-[#38A169] text-sm">92%</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
              <div>
                <p className="font-bold text-[#003E78]">Zona Bolívar</p>
                <p className="text-[11px] text-slate-500">Supervisor: Carlos Herrera</p>
              </div>
              <span className="font-extrabold text-[#1E83EC] text-sm">84%</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
              <div>
                <p className="font-bold text-[#003E78]">Zona Córdoba</p>
                <p className="text-[11px] text-slate-500">Supervisor: Andrés Gómez</p>
              </div>
              <span className="font-extrabold text-amber-600 text-sm">76%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Hierarchical Table */}
      <div className="card-ultracem p-5 space-y-4">
        <h2 className="text-sm font-bold text-[#003E78]">
          Fuerza de Ventas y Remisiones Consolidadas
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
  );
};

'use client';

import React, { useState, useMemo } from 'react';
import { User, Sale, ProductType } from '@/lib/types';
import {
  LeaderboardZoneFilter,
  LeaderboardProductFilter,
  LeaderboardSortBy,
  calculateLeaderboard,
  LeaderboardEntry,
} from '@/lib/gamification';
import {
  Trophy,
  Medal,
  Award,
  Crown,
  TrendingUp,
  Target,
  Filter,
  ArrowUpRight,
  Sparkles,
  Gift,
  Building2,
  ShieldCheck,
  ChevronRight,
  Flame,
  Zap,
} from 'lucide-react';

export interface LeaderboardViewProps {
  currentUser: User;
  users: User[];
  sales: Sale[];
  onOpenRewards?: () => void;
  onSelectAdvisor?: (advisorId: string) => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  currentUser,
  users,
  sales,
  onOpenRewards,
  onSelectAdvisor,
}) => {
  const [selectedZone, setSelectedZone] = useState<LeaderboardZoneFilter>('Todas');
  const [selectedProduct, setSelectedProduct] = useState<LeaderboardProductFilter>('Todos');
  const [sortBy, setSortBy] = useState<LeaderboardSortBy>('volumen');

  const zoneFilters: LeaderboardZoneFilter[] = ['Todas', 'Atlántico', 'Córdoba', 'Bolívar'];
  const productFilters: LeaderboardProductFilter[] = ['Todos', 'Cemento', 'Concreto', 'Pegantes', 'Morteros'];

  // Calcular ranking en tiempo real
  const leaderboardEntries = useMemo(() => {
    return calculateLeaderboard(users, sales, selectedZone, selectedProduct, sortBy);
  }, [users, sales, selectedZone, selectedProduct, sortBy]);

  // Identificar los 3 primeros para el podio comercial
  const top1 = leaderboardEntries[0];
  const top2 = leaderboardEntries[1];
  const top3 = leaderboardEntries[2];

  // Identificar la posición del usuario actual
  const currentUserEntry = leaderboardEntries.find(
    (e) => e.advisorId === currentUser.id || e.name === currentUser.name
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-in fade-in duration-200">
      {/* ========================================================================= */}
      {/* 1. HERO BANNER: RANKING COMERCIAL ULTRACEM */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-[#003E78] via-[#002B54] to-[#1E83EC] text-white p-5 sm:p-6 rounded-2xl shadow-md border border-[#002B54] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-[5px] bg-[#FFCA00] text-[#003E78] text-[10px] font-black uppercase tracking-wider">
              Semana 4 SLC · Gamificación Avanzada
            </span>
            <span className="text-xs text-blue-200">Actualizado en vivo</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-[#FFCA00]" />
            <span>Tabla de Posiciones &amp; Podio Comercial</span>
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
            Clasificación oficial de la fuerza de ventas por volumen despachado y Puntos Ultra acumulados en el ciclo comercial.
          </p>
        </div>

        {/* CTA to Rewards Catalog */}
        {onOpenRewards && (
          <button
            onClick={onOpenRewards}
            className="w-full md:w-auto px-4 py-2.5 rounded-[5px] bg-[#FFCA00] hover:bg-amber-400 text-[#003E78] font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
          >
            <Gift className="w-4 h-4 fill-current" />
            <span>Ver Catálogo de Recompensas</span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. INDICADOR DE DISTANCIA A LA SIGUIENTE POSICIÓN (MOTIVACIONAL) */}
      {/* ========================================================================= */}
      {currentUserEntry && (
        <div className="p-4 rounded-xl bg-white border border-[#E0E6ED] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-[5px] flex items-center justify-center shrink-0 font-black text-sm shadow-xs ${
                currentUserEntry.rank === 1
                  ? 'bg-[#FFCA00] text-[#003E78]'
                  : currentUserEntry.rank === 2
                  ? 'bg-slate-200 text-slate-800'
                  : currentUserEntry.rank === 3
                  ? 'bg-amber-100 text-amber-900'
                  : 'bg-blue-50 text-[#003E78]'
              }`}
            >
              #{currentUserEntry.rank}
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Tu Estado en la Competencia
                </span>
                <span className="px-2 py-0.2 rounded-[5px] bg-blue-50 text-[#003E78] font-bold text-[10px] border border-blue-200">
                  {currentUser.name}
                </span>
              </div>

              {currentUserEntry.rank === 1 ? (
                <p className="text-xs sm:text-sm font-bold text-[#003E78]">
                  ¡Estás liderando el Ranking Nacional Ultracem! Mantienes la 1ª posición con{' '}
                  <span className="text-[#38A169]">
                    {sortBy === 'volumen'
                      ? `${currentUserEntry.totalVolumeCombined.toLocaleString()} Ton/m³`
                      : `${currentUserEntry.ultraPoints.toLocaleString()} Pts`}
                  </span>.
                </p>
              ) : (
                <p className="text-xs sm:text-sm font-bold text-slate-800">
                  Estás en el <span className="text-[#003E78]">Puesto #{currentUserEntry.rank}</span> · A solo{' '}
                  <span className="text-[#1E83EC] font-extrabold">
                    {currentUserEntry.gapToNext.toLocaleString()} {currentUserEntry.gapMetric}
                  </span>{' '}
                  de alcanzar a{' '}
                  <span className="text-[#003E78] font-semibold">{currentUserEntry.nextAdvisorName}</span> (Puesto #{currentUserEntry.rank - 1}).
                </p>
              )}
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 text-xs">
            <div className="text-right">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Tus Puntos Ultra</p>
              <p className="font-bold text-[#B7791F] text-sm">
                {currentUserEntry.ultraPoints.toLocaleString()} pts
              </p>
            </div>
            <div className="h-7 w-px bg-slate-200" />
            <div className="text-right">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Volumen Total</p>
              <p className="font-bold text-[#003E78] text-sm">
                {currentUserEntry.totalVolumeCombined.toLocaleString()} Ton/m³
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. FILTROS RECTANGULARES CON COLORES ULTRACEM (rounded-[5px]) */}
      {/* ========================================================================= */}
      <div className="bg-white p-4 rounded-xl border border-[#E0E6ED] shadow-xs space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Zona Selector */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-[#003E78] uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[#1E83EC]" />
              <span>Filtrar por Zona:</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {zoneFilters.map((zone) => (
                <button
                  key={zone}
                  onClick={() => setSelectedZone(zone)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-[5px] transition-all cursor-pointer ${
                    selectedZone === zone
                      ? 'bg-[#003E78] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {zone}
                </button>
              ))}
            </div>
          </div>

          {/* Product Selector */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-[#003E78] uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#1E83EC]" />
              <span>Filtrar por Producto:</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {productFilters.map((prod) => (
                <button
                  key={prod}
                  onClick={() => setSelectedProduct(prod)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-[5px] transition-all cursor-pointer ${
                    selectedProduct === prod
                      ? 'bg-[#003E78] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {prod}
                </button>
              ))}
            </div>
          </div>

          {/* Sort By Toggle */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-[#003E78] uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#FFCA00]" />
              <span>Ordenar por:</span>
            </span>
            <div className="flex rounded-[5px] border border-[#E0E6ED] bg-slate-100 p-0.5">
              <button
                onClick={() => setSortBy('volumen')}
                className={`px-3 py-1 text-xs font-bold rounded-[4px] transition-all cursor-pointer ${
                  sortBy === 'volumen'
                    ? 'bg-[#003E78] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Volumen Despachado
              </button>
              <button
                onClick={() => setSortBy('puntos')}
                className={`px-3 py-1 text-xs font-bold rounded-[4px] transition-all cursor-pointer ${
                  sortBy === 'puntos'
                    ? 'bg-[#003E78] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Puntos Ultra
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. PODIO COMERCIAL (PUESTO 1 ORO, PUESTO 2 PLATA, PUESTO 3 BRONCE) */}
      {/* ========================================================================= */}
      <div className="card-ultracem p-5 sm:p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-[#E0E6ED] pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#003E78] flex items-center gap-2">
              <Crown className="w-5 h-5 text-[#FFCA00]" />
              <span>Podio de Honor Comercial</span>
            </h2>
            <p className="text-xs text-slate-500">
              Máximos referentes de ventas de Ultracem en el periodo activo.
            </p>
          </div>
          <span className="hidden sm:inline-block px-2.5 py-1 rounded-[5px] bg-amber-50 border border-amber-200 text-[#B7791F] text-xs font-bold">
            Zona: {selectedZone} · Criterio: {sortBy === 'volumen' ? 'Volumen' : 'Puntos Ultra'}
          </span>
        </div>

        {/* Podium Layout (Desktop: 2 - 1 - 3, Mobile: 1 - 2 - 3) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-4 pb-2">
          {/* PUESTO 2: PLATA (Elevación Media) */}
          {top2 ? (
            <div className="order-2 md:order-1 flex flex-col items-center text-center p-4 rounded-xl border border-slate-300 bg-gradient-to-t from-slate-100/90 to-white shadow-2xs">
              <div className="relative mb-2">
                <div className="w-16 h-16 rounded-full border-2 border-slate-400 overflow-hidden shadow-xs bg-slate-200 flex items-center justify-center font-bold text-slate-700">
                  {top2.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={top2.avatarUrl} alt={top2.name} className="w-full h-full object-cover" />
                  ) : (
                    top2.name.charAt(0)
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-300 border-2 border-white flex items-center justify-center shadow-xs">
                  <Medal className="w-3.5 h-3.5 text-slate-700" />
                </div>
              </div>

              <span className="px-2.5 py-0.5 rounded-[5px] bg-slate-200 text-slate-800 text-[10px] font-extrabold uppercase tracking-wider mb-1">
                2° Lugar · Plata
              </span>
              <h3 className="font-bold text-sm text-[#003E78]">{top2.name}</h3>
              <p className="text-xs text-slate-500">Zona {top2.zone}</p>

              <div className="mt-3 pt-2.5 border-t border-slate-200 w-full space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Volumen:</span>
                  <span className="font-bold text-slate-800">
                    {top2.totalVolumeCombined.toLocaleString()} Ton/m³
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Puntos Ultra:</span>
                  <span className="font-bold text-[#B7791F]">
                    {top2.ultraPoints.toLocaleString()} pts
                  </span>
                </div>
                {top2.gapToNext > 0 && (
                  <p className="text-[10px] text-slate-500 pt-1">
                    A {top2.gapToNext.toLocaleString()} {top2.gapMetric} del 1° puesto
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="order-2 md:order-1 p-6 text-center text-xs text-slate-400 border border-dashed rounded-xl">
              Sin datos para 2° lugar
            </div>
          )}

          {/* PUESTO 1: ORO (Elevación Máxima) */}
          {top1 ? (
            <div className="order-1 md:order-2 flex flex-col items-center text-center p-5 rounded-xl border-2 border-[#FFCA00] bg-gradient-to-t from-amber-50/70 via-white to-amber-50/30 shadow-md relative -mt-2">
              <div className="absolute -top-3.5 px-3 py-0.5 rounded-[5px] bg-[#FFCA00] text-[#003E78] text-[11px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 fill-current" />
                <span>Líder Comercial Nacional</span>
              </div>

              <div className="relative mb-2 mt-1">
                <div className="w-20 h-20 rounded-full border-3 border-[#FFCA00] overflow-hidden shadow-md bg-amber-100 flex items-center justify-center font-bold text-amber-900 text-lg">
                  {top1.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={top1.avatarUrl} alt={top1.name} className="w-full h-full object-cover" />
                  ) : (
                    top1.name.charAt(0)
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#FFCA00] border-2 border-white flex items-center justify-center shadow-xs">
                  <Trophy className="w-4 h-4 text-[#003E78] fill-current" />
                </div>
              </div>

              <span className="px-2.5 py-0.5 rounded-[5px] bg-[#003E78] text-[#FFCA00] text-[10px] font-extrabold uppercase tracking-wider mb-1">
                1° Lugar · Oro
              </span>
              <h3 className="font-black text-base text-[#003E78]">{top1.name}</h3>
              <p className="text-xs text-slate-600 font-medium">Zona {top1.zone}</p>

              <div className="mt-3 pt-2.5 border-t border-amber-200/80 w-full space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600 font-medium">Volumen Total:</span>
                  <span className="font-extrabold text-[#003E78] text-sm">
                    {top1.totalVolumeCombined.toLocaleString()} Ton/m³
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600 font-medium">Puntos Ultra:</span>
                  <span className="font-extrabold text-[#B7791F] text-sm">
                    {top1.ultraPoints.toLocaleString()} pts
                  </span>
                </div>
                {top2 && (
                  <p className="text-[11px] text-[#38A169] font-bold pt-1">
                    +{Math.abs(top1.totalVolumeCombined - top2.totalVolumeCombined).toLocaleString()} Ton de ventaja
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="order-1 md:order-2 p-6 text-center text-xs text-slate-400 border border-dashed rounded-xl">
              Sin datos para 1° lugar
            </div>
          )}

          {/* PUESTO 3: BRONCE (Elevación Menor) */}
          {top3 ? (
            <div className="order-3 flex flex-col items-center text-center p-4 rounded-xl border border-amber-200 bg-gradient-to-t from-amber-100/60 to-white shadow-2xs">
              <div className="relative mb-2">
                <div className="w-16 h-16 rounded-full border-2 border-amber-500/80 overflow-hidden shadow-xs bg-amber-50 flex items-center justify-center font-bold text-amber-800">
                  {top3.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={top3.avatarUrl} alt={top3.name} className="w-full h-full object-cover" />
                  ) : (
                    top3.name.charAt(0)
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center shadow-xs">
                  <Award className="w-3.5 h-3.5 text-white" />
                </div>
              </div>

              <span className="px-2.5 py-0.5 rounded-[5px] bg-amber-100 text-amber-900 text-[10px] font-extrabold uppercase tracking-wider mb-1">
                3° Lugar · Bronce
              </span>
              <h3 className="font-bold text-sm text-[#003E78]">{top3.name}</h3>
              <p className="text-xs text-slate-500">Zona {top3.zone}</p>

              <div className="mt-3 pt-2.5 border-t border-amber-200 w-full space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Volumen:</span>
                  <span className="font-bold text-slate-800">
                    {top3.totalVolumeCombined.toLocaleString()} Ton/m³
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Puntos Ultra:</span>
                  <span className="font-bold text-[#B7791F]">
                    {top3.ultraPoints.toLocaleString()} pts
                  </span>
                </div>
                {top3.gapToNext > 0 && (
                  <p className="text-[10px] text-slate-500 pt-1">
                    A {top3.gapToNext.toLocaleString()} {top3.gapMetric} del 2° puesto
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="order-3 p-6 text-center text-xs text-slate-400 border border-dashed rounded-xl">
              Sin datos para 3° lugar
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. TABLA COMPLETA DE POSICIONES COMERCIALES */}
      {/* ========================================================================= */}
      <div className="card-ultracem p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E0E6ED] pb-3">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[#003E78]">
              Clasificación General de la Fuerza Comercial
            </h2>
            <p className="text-xs text-slate-500">
              {leaderboardEntries.length} asesores clasificados en el periodo
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#1E83EC]" />
            <span className="text-slate-500">Tu usuario resaltado en la tabla</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-[#E0E6ED]">
              <tr>
                <th className="py-3 px-3 text-center">Puesto</th>
                <th className="py-3 px-3">Asesor Comercial</th>
                <th className="py-3 px-3">Zona</th>
                <th className="py-3 px-3 text-right">Volumen Despachado</th>
                <th className="py-3 px-3 text-right">Puntos Ultra</th>
                <th className="py-3 px-3">Distancia al Superior</th>
                <th className="py-3 px-3 text-center">Nivel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leaderboardEntries.map((entry) => {
                const isCurrentUser =
                  entry.advisorId === currentUser.id || entry.name === currentUser.name;

                return (
                  <tr
                    key={entry.advisorId}
                    className={`transition-colors cursor-pointer ${
                      isCurrentUser
                        ? 'bg-blue-50/70 hover:bg-blue-100/50 font-medium'
                        : 'hover:bg-slate-50/80'
                    }`}
                    onClick={() => onSelectAdvisor?.(entry.advisorId)}
                  >
                    {/* Rank */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center">
                        {entry.rank === 1 ? (
                          <span className="w-6 h-6 rounded-[5px] bg-[#FFCA00] text-[#003E78] font-black text-xs flex items-center justify-center shadow-2xs">
                            1
                          </span>
                        ) : entry.rank === 2 ? (
                          <span className="w-6 h-6 rounded-[5px] bg-slate-300 text-slate-800 font-black text-xs flex items-center justify-center shadow-2xs">
                            2
                          </span>
                        ) : entry.rank === 3 ? (
                          <span className="w-6 h-6 rounded-[5px] bg-amber-600 text-white font-black text-xs flex items-center justify-center shadow-2xs">
                            3
                          </span>
                        ) : (
                          <span className="font-bold text-slate-500">#{entry.rank}</span>
                        )}
                      </div>
                    </td>

                    {/* Advisor Name & Avatar */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#003E78] text-white flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
                          {entry.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={entry.avatarUrl} alt={entry.name} className="w-full h-full object-cover" />
                          ) : (
                            entry.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900">{entry.name}</span>
                            {isCurrentUser && (
                              <span className="px-1.5 py-0.2 rounded-[5px] bg-[#1E83EC] text-white text-[9px] font-bold uppercase">
                                Tú
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {entry.salesCount} remisiones verificadas
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Zone */}
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-[5px] bg-slate-100 text-slate-700 font-semibold text-[11px] border border-slate-200">
                        {entry.zone}
                      </span>
                    </td>

                    {/* Volume */}
                    <td className="py-3 px-3 text-right">
                      <p className="font-bold text-[#003E78]">
                        {entry.totalVolumeCombined.toLocaleString()} Ton/m³
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {entry.totalVolumeTons} Ton · {entry.totalVolumem3} m³
                      </p>
                    </td>

                    {/* Ultra Points */}
                    <td className="py-3 px-3 text-right">
                      <span className="inline-flex items-center gap-1 font-bold text-[#B7791F]">
                        <Trophy className="w-3.5 h-3.5 text-[#FFCA00]" />
                        {entry.ultraPoints.toLocaleString()} pts
                      </span>
                    </td>

                    {/* Gap to next */}
                    <td className="py-3 px-3">
                      {entry.rank === 1 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#38A169]">
                          <Crown className="w-3.5 h-3.5" />
                          <span>Líder Absoluto</span>
                        </span>
                      ) : (
                        <div className="text-[11px]">
                          <span className="text-slate-600 font-semibold">
                            -{entry.gapToNext.toLocaleString()} {entry.gapMetric}
                          </span>
                          <span className="text-slate-400 text-[10px] block">
                            vs {entry.nextAdvisorName}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Badge Tier */}
                    <td className="py-3 px-3 text-center">
                      {entry.tier === 'oro' ? (
                        <span className="px-2 py-0.5 rounded-[5px] bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold">
                          Nivel Oro
                        </span>
                      ) : entry.tier === 'plata' ? (
                        <span className="px-2 py-0.5 rounded-[5px] bg-slate-200 text-slate-800 border border-slate-300 text-[10px] font-bold">
                          Nivel Plata
                        </span>
                      ) : entry.tier === 'bronce' ? (
                        <span className="px-2 py-0.5 rounded-[5px] bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                          Nivel Bronce
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-[5px] bg-slate-100 text-slate-600 text-[10px] font-medium">
                          Comercial
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

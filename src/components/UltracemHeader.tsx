'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Bell,
  Trophy,
  ChevronDown,
  Shield,
  LogOut,
  Layers,
  Sparkles,
  User as UserIcon,
  MapPin,
  KeyRound,
} from 'lucide-react';
import { User, NotificationItem } from '@/lib/types';
import { NotificationDrawer } from './NotificationDrawer';

interface UltracemHeaderProps {
  currentUser: User;
  onSwitchUser?: (user: User) => void;
  availableUsers?: User[];
  notifications: NotificationItem[];
  onCorrectSale?: (saleId?: string) => void;
  onOpenLoginModal?: () => void;
  onOpenUserManagementModal?: () => void;
  pendingRequestsCount?: number;
  activeTab?: 'dashboard' | 'leaderboard';
  onSwitchTab?: (tab: 'dashboard' | 'leaderboard') => void;
  onOpenRewards?: () => void;
}

export const UltracemHeader: React.FC<UltracemHeaderProps> = ({
  currentUser,
  notifications,
  onCorrectSale,
  onOpenLoginModal,
  onOpenUserManagementModal,
  activeTab = 'dashboard',
  onSwitchTab,
  onOpenRewards,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <header className="h-14 md:h-16 bg-[#003E78] text-white px-3 md:px-6 sticky top-0 z-40 shadow-md flex items-center justify-between border-b border-[#002B54]">
        {/* Left: Logo & Territory */}
        <div className="flex items-center gap-2.5 md:gap-3 shrink-0">
          <div className="relative h-8 w-28 md:w-36 flex items-center">
            <Image
              src="/images/logo-ultracem.webp"
              alt="Ultracem Logo"
              width={140}
              height={36}
              priority
              className="object-contain brightness-0 invert"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>

          <div className="hidden sm:flex items-center border-l border-blue-400/30 pl-3">
            <span className="text-xs text-blue-200 font-medium">
              {currentUser.role === 'gerente'
                ? 'Dirección Comercial'
                : 'Fuerza Comercial'}{' '}
              · <strong className="text-white font-semibold">{currentUser.zone}</strong>
            </span>
          </div>
        </div>

        {/* Center: Navigation Tabs (Dashboard vs Leaderboard) */}
        {onSwitchTab && (
          <nav className="flex items-center bg-[#002B54] p-1 rounded-[6px] border border-blue-400/20 text-xs font-bold shrink-0">
            <button
              onClick={() => onSwitchTab('dashboard')}
              className={`px-3 py-1.5 rounded-[4px] transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-[#1E83EC] text-white shadow-xs font-bold'
                  : 'text-blue-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Operaciones</span>
            </button>
            <button
              onClick={() => onSwitchTab('leaderboard')}
              className={`px-3 py-1.5 rounded-[4px] transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'leaderboard'
                  ? 'bg-[#FFCA00] text-[#003E78] shadow-xs font-extrabold'
                  : 'text-blue-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-[#FFCA00]" />
              <span>Ranking &amp; Podio</span>
            </button>
          </nav>
        )}

        {/* Right: Actions, Rewards, Notifications & Secure Profile */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {/* GERENTE ONLY: Botón de Gestión de Asesores (Sin filtración para asesores) */}
          {currentUser.role === 'gerente' && onOpenUserManagementModal && (
            <button
              onClick={onOpenUserManagementModal}
              className="flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 rounded-[5px] bg-amber-400/15 border border-[#FFCA00] text-[#FFCA00] hover:bg-[#FFCA00]/25 text-xs font-bold transition shadow-xs cursor-pointer"
              title="Panel de Gestión de Asesores y Credenciales (Solo Gerente)"
            >
              <Shield className="w-3.5 h-3.5 text-[#FFCA00]" />
              <span className="hidden md:inline">Gestión de Asesores</span>
            </button>
          )}

          {/* Puntos Ultra Badge (Interactivo para abrir Catálogo de Recompensas) */}
          <button
            onClick={onOpenRewards}
            className="flex items-center gap-1.5 bg-[#002B54] hover:bg-[#002244] border border-[#FFCA00]/80 px-2.5 md:px-3 py-1.5 rounded-[5px] shadow-xs transition-all cursor-pointer active:scale-95 text-left"
            title="Ver Catálogo Oficial de Recompensas e Incentivos Ultracem"
          >
            <Trophy className="w-3.5 h-3.5 text-[#FFCA00] shrink-0" />
            <span className="text-[#FFCA00] font-extrabold text-xs tracking-wide whitespace-nowrap">
              {currentUser.ultra_points.toLocaleString()} pts
            </span>
          </button>

          {/* Campana de Notificaciones */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="relative p-1.5 rounded-md hover:bg-white/10 transition-colors text-white cursor-pointer"
            aria-label="Notificaciones"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#E53E3E] text-white text-[10px] font-bold w-4 h-4 rounded-[4px] flex items-center justify-center border-2 border-[#003E78]">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Perfil de Usuario Protegido (Sin fugas de credenciales de otros usuarios) */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1 pl-1.5 hover:bg-white/10 rounded-md transition-colors text-left cursor-pointer"
              aria-label="Menú de Usuario"
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-[#1E83EC] text-white font-bold flex items-center justify-center text-xs border border-white/30 overflow-hidden shadow-xs">
                  {currentUser.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={currentUser.avatar_url} alt={currentUser.name} className="w-full h-full object-cover" />
                  ) : (
                    currentUser.name.charAt(0)
                  )}
                </div>
                {/* Indicador sutil de conexión */}
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#38A169] border-2 border-[#003E78]" />
              </div>

              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold leading-tight truncate max-w-[120px] text-white">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-[#FFCA00] uppercase font-bold tracking-wider">
                  {currentUser.role === 'gerente' ? 'Gerente' : 'Asesor'}
                </p>
              </div>

              <ChevronDown className="w-3.5 h-3.5 text-blue-200 hidden sm:block" />
            </button>

            {/* Dropdown del Usuario (Seguro: No lista a otros colaboradores ni contraseñas) */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2.5 w-68 bg-white rounded-xl shadow-2xl border border-[#E0E6ED] overflow-hidden z-50 text-slate-800 animate-in fade-in-50 duration-150">
                {/* Ficha Institucional del Colaborador */}
                <div className="p-4 bg-gradient-to-b from-[#F4F6F9] to-white border-b border-[#E0E6ED]">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-black text-[#003E78] truncate leading-tight">
                        {currentUser.name}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {currentUser.email}
                      </p>
                    </div>
                    <span
                      className={`text-[9px] font-black px-2 py-0.5 rounded-[4px] uppercase shrink-0 tracking-wider ${
                        currentUser.role === 'gerente'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-blue-50 text-[#003E78] border border-blue-200'
                      }`}
                    >
                      {currentUser.role === 'gerente' ? 'Gerente' : 'Asesor'}
                    </span>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-medium flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-[#1E83EC]" />
                        <span>Código Oficial:</span>
                      </span>
                      <span className="font-mono font-bold text-[#003E78]">
                        {currentUser.employee_code || 'ULTRA-ASE-003'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-medium flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#1E83EC]" />
                        <span>Territorio:</span>
                      </span>
                      <span className="font-semibold text-slate-800">
                        {currentUser.zone}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Acciones Exclusivas de Gerente */}
                {currentUser.role === 'gerente' && onOpenUserManagementModal && (
                  <div className="p-1.5 border-b border-[#E0E6ED]">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenUserManagementModal();
                      }}
                      className="w-full px-3 py-2 text-left flex items-center gap-2.5 text-xs text-[#003E78] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer font-bold"
                    >
                      <Shield className="w-4 h-4 text-[#1E83EC]" />
                      <span>Gestión de Asesores & Acceso</span>
                    </button>
                  </div>
                )}

                {/* Cerrar Sesión Corporativa */}
                <div className="p-1.5 bg-slate-50/50">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenLoginModal?.();
                    }}
                    className="w-full px-3 py-2 text-left flex items-center gap-2.5 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors cursor-pointer font-bold"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Drawer de Notificaciones */}
      <NotificationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        notifications={notifications}
        onCorrectSale={onCorrectSale}
      />
    </>
  );
};

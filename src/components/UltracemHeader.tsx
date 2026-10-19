'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Bell, Trophy, ChevronDown, UserCheck, Shield, KeyRound, LogIn, Users } from 'lucide-react';
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
  onSwitchUser,
  availableUsers = [],
  notifications,
  onCorrectSale,
  onOpenLoginModal,
  onOpenUserManagementModal,
  pendingRequestsCount = 0,
  activeTab = 'dashboard',
  onSwitchTab,
  onOpenRewards,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <header className="h-14 md:h-16 bg-[#003E78] text-white px-4 md:px-6 sticky top-0 z-40 shadow-md flex items-center justify-between border-b border-[#002B54]">
        {/* Left: Logo & Zone */}
        <div className="flex items-center gap-3">
          <div className="relative h-8 w-28 md:w-36 flex items-center">
            {/* Real Logo from public/images/logo-ultracem.webp */}
            <Image
              src="/images/logo-ultracem.webp"
              alt="Ultracem Logo"
              width={140}
              height={36}
              priority
              className="object-contain brightness-0 invert"
              onError={(e) => {
                // Fallback visual text if image is not loaded
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <span className="hidden lg:inline-block text-xs text-blue-200 border-l border-blue-400/40 pl-3 font-medium">
            {currentUser.role === 'gerente'
              ? 'Dirección Comercial Nacional'
              : currentUser.role === 'supervisor'
              ? `Supervisión — Zona ${currentUser.zone}`
              : `Fuerza Comercial — ${currentUser.zone}`}
          </span>

          {currentUser.employee_code && (
            <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[11px] bg-[#002B54] border border-blue-400/30 text-blue-200 px-2 py-0.5 rounded font-bold">
              <KeyRound className="w-3 h-3 text-[#FFCA00]" />
              {currentUser.employee_code}
            </span>
          )}
        </div>

        {/* Center: Navigation Tabs (Dashboard vs Leaderboard) */}
        {onSwitchTab && (
          <div className="hidden md:flex items-center bg-[#002B54] p-1 rounded-[5px] border border-blue-400/20 text-xs font-bold">
            <button
              onClick={() => onSwitchTab('dashboard')}
              className={`px-3 py-1 rounded-[4px] transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-[#1E83EC] text-white shadow-2xs'
                  : 'text-blue-200 hover:text-white'
              }`}
            >
              Operaciones
            </button>
            <button
              onClick={() => onSwitchTab('leaderboard')}
              className={`px-3 py-1 rounded-[4px] transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'leaderboard'
                  ? 'bg-[#FFCA00] text-[#003E78] shadow-2xs font-extrabold'
                  : 'text-blue-200 hover:text-white'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-[#FFCA00]" />
              <span>Ranking &amp; Podio</span>
            </button>
          </div>
        )}

        {/* Center / Right: RBAC Button, Gamification Puntos Ultra & Notifications */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Botón de Gestión RBAC / Gobernanza de Credenciales */}
          <button
            onClick={onOpenUserManagementModal}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold transition shadow-xs cursor-pointer ${
              currentUser.role === 'gerente'
                ? 'bg-amber-400/15 border-[#FFCA00] text-[#FFCA00] hover:bg-[#FFCA00]/25'
                : currentUser.role === 'supervisor'
                ? 'bg-blue-400/15 border-blue-300 text-blue-200 hover:bg-white/10'
                : 'bg-white/5 border-white/20 text-blue-200 hover:bg-white/10'
            }`}
            title="Gestión de Credenciales y Jerarquías RBAC"
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden md:inline">
              {currentUser.role === 'gerente'
                ? 'Gobernanza RBAC'
                : currentUser.role === 'supervisor'
                ? 'Solicitar Asesor'
                : 'Mi Credencial'}
            </span>
            {pendingRequestsCount > 0 && currentUser.role === 'gerente' && (
              <span className="bg-[#E53E3E] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-[4px]">
                {pendingRequestsCount}
              </span>
            )}
          </button>

          {/* Puntos Ultra Badge (PRD Specs) - Clickable to open Rewards */}
          <button
            onClick={onOpenRewards}
            className="flex items-center gap-1.5 bg-[#002B54] hover:bg-[#002244] border border-[#FFCA00] px-2.5 md:px-3 py-1 rounded-[5px] shadow-xs transition-all cursor-pointer active:scale-95 text-left"
            title="Ver Catálogo de Recompensas e Incentivos Ultracem"
          >
            <Trophy className="w-3.5 h-3.5 text-[#FFCA00]" />
            <span className="text-[#FFCA00] font-bold text-xs md:text-sm tracking-wide">
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
              <span className="absolute -top-1 -right-1 bg-[#E53E3E] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#003E78]">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Status En Línea */}
          <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-blue-200 bg-white/5 border border-white/10 px-2 py-0.5 rounded-[5px]">
            <span className="w-2 h-2 rounded-[2px] bg-[#38A169] animate-pulse" />
            <span className="font-medium">En línea</span>
          </div>

          {/* User Profile & Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1 pl-2 hover:bg-white/10 rounded-md transition-colors text-left cursor-pointer"
            >
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#1E83EC] text-white font-bold flex items-center justify-center text-xs border border-white/30 overflow-hidden relative">
                {currentUser.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={currentUser.avatar_url} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  currentUser.name.charAt(0)
                )}
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-bold leading-tight truncate max-w-[120px]">{currentUser.name}</p>
                <p className="text-[10px] text-blue-200 uppercase font-semibold tracking-wider">
                  {currentUser.role}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-blue-200" />
            </button>

            {/* Switch User Dropdown */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-[#E0E6ED] py-2 z-50 text-slate-800 animate-in fade-in-50 duration-150">
                <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-[#003E78]">{currentUser.name}</p>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-[4px] uppercase bg-blue-100 text-[#003E78]">
                      {currentUser.role}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                    {currentUser.employee_code || currentUser.email}
                  </p>
                </div>

                {/* Acciones de Credenciales */}
                <div className="p-1 border-b border-slate-100">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenUserManagementModal?.();
                    }}
                    className="w-full px-3 py-2 text-left flex items-center gap-2.5 text-xs text-slate-700 hover:bg-[#F4F6F9] rounded-lg transition-colors cursor-pointer font-medium"
                  >
                    <Shield className="w-4 h-4 text-[#003E78]" />
                    <span>Gestión de Credenciales & RBAC</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenLoginModal?.();
                    }}
                    className="w-full px-3 py-2 text-left flex items-center gap-2.5 text-xs text-slate-700 hover:bg-[#F4F6F9] rounded-lg transition-colors cursor-pointer font-medium"
                  >
                    <KeyRound className="w-4 h-4 text-[#1E83EC]" />
                    <span>Iniciar con Código / PIN Corporativo</span>
                  </button>
                </div>

                {/* Demo Fast Switcher */}
                <div className="px-4 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Cambio Rápido de Perfil:
                </div>
                <div className="py-1 max-h-48 overflow-y-auto">
                  {availableUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        onSwitchUser?.(user);
                        setIsUserMenuOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-[#F4F6F9] transition-colors cursor-pointer ${
                        user.id === currentUser.id ? 'bg-blue-50/60 font-semibold text-[#003E78]' : ''
                      }`}
                    >
                      <div className="w-7 h-7 rounded-full bg-[#003E78] text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium text-slate-900 truncate">{user.name}</p>
                          <span className="text-[9px] font-mono text-slate-400">{user.employee_code}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 capitalize">{user.role} · {user.zone}</p>
                      </div>
                      {user.id === currentUser.id && (
                        <UserCheck className="w-4 h-4 text-[#1E83EC] shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Drawer */}
      <NotificationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        notifications={notifications}
        onCorrectSale={onCorrectSale}
      />
    </>
  );
};

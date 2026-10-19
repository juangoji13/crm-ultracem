'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  ShieldCheck,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Building2,
  X,
  BadgeCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { User } from '@/lib/types';
import { authenticateUser } from '@/lib/auth';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onLoginSuccess: (user: User) => void;
  availableUsers: User[];
  currentSessionUser?: User | null;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  availableUsers,
  currentSessionUser,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successAnimation, setSuccessAnimation] = useState<User | null>(null);

  if (!isOpen) return null;

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setErrorCode(null);
    setIsLoading(true);

    setTimeout(() => {
      const result = authenticateUser(identifier, password, availableUsers);

      if (result.success && result.user) {
        setSuccessAnimation(result.user);
        setTimeout(() => {
          onLoginSuccess(result.user!);
          setIsLoading(false);
          setSuccessAnimation(null);
          if (onClose) onClose();
        }, 600);
      } else {
        setIsLoading(false);
        setErrorMessage(result.error || 'Credenciales no válidas.');
        setErrorCode(result.errorCode || 'UNKNOWN');
      }
    }, 250);
  };

  const handleDemoFill = (user: User) => {
    setIdentifier(user.employee_code || user.email);
    setPassword(user.corporate_password || 'Ultracem2026*');
    setErrorMessage(null);
    setErrorCode(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header Corporativo Ultracem */}
        <div className="bg-[#003E78] px-6 py-5 text-white relative">
          {onClose && currentSessionUser && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-blue-200 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-3 mb-2">
            <div className="relative h-8 w-28 flex items-center">
              <Image
                src="/images/logo-ultracem.webp"
                alt="Ultracem Logo"
                width={120}
                height={32}
                priority
                className="object-contain brightness-0 invert"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div className="h-5 w-[1px] bg-blue-300/40" />
            <span className="text-xs uppercase tracking-wider font-semibold text-[#FFCA00]">
              Portal Corporativo
            </span>
          </div>

          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Ingreso con Credenciales Profesionales
          </h2>
          <p className="text-xs text-blue-100 mt-1">
            Autenticación institucional bajo control de jerarquías y RBAC Ultracem
          </p>
        </div>

        {/* Cuerpo del Modal */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
          {/* Selector de Acceso Rápido / Demo Fill */}
          <div className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-[#003E78] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#FFCA00] fill-[#FFCA00]" />
                Demo Fill — Perfiles de Demostración:
              </span>
              <span className="text-[10px] text-slate-500 font-medium">1-Click Auto-Fill</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {availableUsers.slice(0, 3).map((u) => {
                const isSelected =
                  identifier === (u.employee_code || u.email) ||
                  (currentSessionUser?.id === u.id && !identifier);

                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleDemoFill(u)}
                    className={`text-left p-2 rounded-lg border transition-all text-xs ${
                      isSelected
                        ? 'border-[#003E78] bg-blue-50/70 shadow-xs ring-1 ring-[#003E78]/20'
                        : 'border-slate-200 bg-white hover:border-[#1E83EC] hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 truncate block max-w-[90px]">
                        {u.name.split(' ')[0]} {u.name.split(' ')[1] || ''}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded-[4px] font-bold uppercase ${
                          u.role === 'gerente'
                            ? 'bg-amber-100 text-amber-800'
                            : u.role === 'supervisor'
                            ? 'bg-blue-100 text-[#003E78]'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {u.role}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{u.employee_code}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Formulario de Login */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Input: Código o Correo */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Código de Empleado o Correo Corporativo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Ej: ULTRA-GER-001 o rmendoza@ultracem.co"
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#003E78] focus:border-transparent outline-none transition font-medium text-slate-900 placeholder:text-slate-400"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Ingresa tu código único institucional o tu cuenta @ultracem.co
              </p>
            </div>

            {/* Input: Contraseña / PIN */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Contraseña Profesional o PIN de Acceso
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#003E78] focus:border-transparent outline-none transition text-slate-900"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  aria-label="Ver u ocultar contraseña"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Banner de Error o Alerta RBAC */}
            {errorMessage && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 animate-in fade-in duration-150 ${
                  errorCode === 'SUSPENDED'
                    ? 'bg-red-50 border-red-200 text-red-900'
                    : errorCode === 'PENDING_APPROVAL'
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                <AlertCircle
                  className={`w-4 h-4 shrink-0 mt-0.5 ${
                    errorCode === 'SUSPENDED'
                      ? 'text-red-600'
                      : errorCode === 'PENDING_APPROVAL'
                      ? 'text-amber-600'
                      : 'text-rose-600'
                  }`}
                />
                <div className="flex-1">
                  <p className="font-semibold">
                    {errorCode === 'SUSPENDED'
                      ? 'Acceso Bloqueado por Dirección'
                      : errorCode === 'PENDING_APPROVAL'
                      ? 'Registro Pendiente de Aprobación'
                      : 'Error de Autenticación'}
                  </p>
                  <p className="mt-0.5 leading-relaxed">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Animación de Éxito */}
            {successAnimation && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Credenciales verificadas exitosamente. Bienvenido/a{' '}
                  <strong>{successAnimation.name}</strong> ({successAnimation.role.toUpperCase()}).
                </span>
              </div>
            )}

            {/* Botón de Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#003E78] hover:bg-[#002D5A] text-white font-bold py-3 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verificando credenciales corporativas...</span>
                </div>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-[#FFCA00]" />
                  <span>Iniciar Sesión Corporativa</span>
                  <ChevronRight className="w-4 h-4 text-blue-200" />
                </>
              )}
            </button>
          </form>

          {/* Footer de Seguridad Institucional */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Conexión Cifrada SSL Ultracem</span>
            </span>
            <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">
              RBAC v2.4 Activo
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

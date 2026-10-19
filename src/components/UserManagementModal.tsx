'use client';

import React, { useState } from 'react';
import {
  Users,
  Shield,
  UserCheck,
  UserX,
  UserPlus,
  X,
  Phone,
  Mail,
  MapPin,
  Trophy,
  AlertTriangle,
  Lock,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { User, Role, UserStatus } from '@/lib/types';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  allUsers: User[];
  onUpdateUserRole?: (userId: string, newRole: Role) => Promise<void> | void;
  onUpdateUserStatus: (userId: string, newStatus: UserStatus) => Promise<void> | void;
  onCreateDirectUser: (userData: {
    name: string;
    email: string;
    role: Role;
    zone: string;
    phone: string;
    employee_code: string;
    corporate_password?: string;
  }) => Promise<void> | void;
  onRequestAdvisor?: (data: {
    name: string;
    email: string;
    phone: string;
    zone: string;
  }) => Promise<void> | void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  allUsers,
  onUpdateUserStatus,
  onCreateDirectUser,
}) => {
  const [activeTab, setActiveTab] = useState<'advisors' | 'create'>('advisors');
  const [searchTerm, setSearchTerm] = useState('');
  const [zoneFilter, setZoneFilter] = useState('all');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Formulario para crear nuevo asesor
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    zone: 'Atlántico',
    phone: '',
    employee_code: 'ULTRA-ASE-006',
    corporate_password: 'Ultra2026*Ase',
  });

  React.useEffect(() => {
    if (isOpen) {
      const nextNum = Math.floor(100 + Math.random() * 900);
      setCreateForm((prev) => ({
        ...prev,
        employee_code: `ULTRA-ASE-${nextNum}`,
      }));
    }
  }, [isOpen]);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Seguridad estricta: Solo Gerencia puede acceder a este panel
  if (!isOpen || currentUser.role !== 'gerente') return null;

  // Filtrar asesores comerciales
  const advisors = allUsers.filter((u) => u.role === 'asesor');
  const filteredAdvisors = advisors.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.employee_code && u.employee_code.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesZone = zoneFilter === 'all' || u.zone === zoneFilter;
    return matchesSearch && matchesZone;
  });

  const handleToggleStatus = async (user: User) => {
    const newStatus: UserStatus = user.status === 'suspendido' ? 'activo' : 'suspendido';
    setActionLoadingId(user.id);
    try {
      await onUpdateUserStatus(user.id, newStatus);
      setSuccessMessage(
        newStatus === 'activo'
          ? `Credenciales de ${user.name} activadas con éxito.`
          : `Credenciales de ${user.name} suspendidas de inmediato.`
      );
      setTimeout(() => setSuccessMessage(null), 3500);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name || !createForm.email) return;

    setActionLoadingId('create-new');
    try {
      await onCreateDirectUser({
        name: createForm.name,
        email: createForm.email,
        role: 'asesor',
        zone: createForm.zone,
        phone: createForm.phone,
        employee_code: createForm.employee_code,
        corporate_password: createForm.corporate_password,
      });

      setSuccessMessage(`Asesor ${createForm.name} creado y habilitado con código ${createForm.employee_code}.`);
      setCreateForm({
        name: '',
        email: '',
        zone: 'Atlántico',
        phone: '',
        employee_code: `ULTRA-ASE-${Math.floor(100 + Math.random() * 900)}`,
        corporate_password: 'Ultra2026*Ase',
      });
      setActiveTab('advisors');
      setTimeout(() => setSuccessMessage(null), 4000);
    } finally {
      setActionLoadingId(null);
    }
  };

  const availableZones = ['Atlántico', 'Córdoba', 'Bolívar', 'Magdalena', 'Cesar', 'Sucre'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Corporativo (Gerente) */}
        <div className="bg-[#003E78] px-5 sm:px-6 py-4 text-white flex items-center justify-between shrink-0 border-b border-[#002B54]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[6px] bg-[#002B54] border border-[#FFCA00] text-[#FFCA00] flex items-center justify-center shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Gestión de Fuerza Comercial &amp; Acceso
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-[4px] uppercase bg-[#FFCA00] text-[#003E78]">
                  Gerente General
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                Panel exclusivo de gobernanza corporativa y control de credenciales institucionales
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-blue-200 hover:text-white p-1.5 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notificación de Éxito */}
        {successMessage && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 text-xs text-emerald-900 font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Pestañas de Navegación */}
        <div className="bg-slate-100 border-b border-slate-200 px-5 sm:px-6 flex gap-2 pt-2 shrink-0">
          <button
            onClick={() => setActiveTab('advisors')}
            className={`px-4 py-2 text-xs font-bold rounded-t-[5px] transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'advisors'
                ? 'bg-white text-[#003E78] border-[#003E78] shadow-xs'
                : 'text-slate-600 hover:text-[#003E78] border-transparent'
            }`}
          >
            <Users className="w-4 h-4 text-[#1E83EC]" />
            <span>Equipo de Asesores ({advisors.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 text-xs font-bold rounded-t-[5px] transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'create'
                ? 'bg-white text-[#003E78] border-[#003E78] shadow-xs'
                : 'text-slate-600 hover:text-[#003E78] border-transparent'
            }`}
          >
            <UserPlus className="w-4 h-4 text-[#FFCA00]" />
            <span>Registrar Nuevo Asesor</span>
          </button>
        </div>

        {/* Contenido del Tab */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'advisors' && (
            <div className="space-y-4">
              {/* Filtros de Búsqueda */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, código o correo de asesor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-[#E0E6ED] rounded-[5px] focus:outline-none focus:border-[#003E78] bg-white font-medium"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Zona:</span>
                  <select
                    value={zoneFilter}
                    onChange={(e) => setZoneFilter(e.target.value)}
                    className="text-xs border border-[#E0E6ED] rounded-[5px] px-3 py-2 bg-white font-medium text-slate-700 outline-none"
                  >
                    <option value="all">Todas las Zonas</option>
                    {availableZones.map((z) => (
                      <option key={z} value={z}>{z}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Lista de Asesores Comerciales */}
              <div className="space-y-2.5">
                {filteredAdvisors.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium">No se encontraron asesores con los filtros seleccionados.</p>
                  </div>
                ) : (
                  filteredAdvisors.map((advisor) => {
                    const isSuspended = advisor.status === 'suspendido';
                    const isLoading = actionLoadingId === advisor.id;

                    return (
                      <div
                        key={advisor.id}
                        className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                          isSuspended
                            ? 'bg-red-50/40 border-red-200'
                            : 'bg-white border-[#E0E6ED] hover:border-blue-200 shadow-2xs'
                        }`}
                      >
                        {/* Info Asesor */}
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#003E78] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                            {advisor.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-slate-900 text-sm">{advisor.name}</h3>
                              <span className="text-[10px] bg-blue-100 text-[#003E78] px-2 py-0.5 rounded-[4px] font-bold uppercase">
                                Asesor Comercial
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-[4px] uppercase ${
                                  isSuspended
                                    ? 'bg-red-600 text-white'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {isSuspended ? 'Suspendido' : 'Activo'}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                              <span className="font-mono font-bold text-[#003E78] bg-slate-100 px-1.5 py-0.5 rounded-[4px]">
                                {advisor.employee_code || 'SIN CÓDIGO'}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                Zona {advisor.zone}
                              </span>
                              <span className="flex items-center gap-1">
                                <Mail className="w-3.5 h-3.5 text-slate-400" />
                                {advisor.email}
                              </span>
                              {advisor.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                                  {advisor.phone}
                                </span>
                              )}
                              <span className="flex items-center gap-1 font-semibold text-[#B7791F]">
                                <Trophy className="w-3.5 h-3.5 text-[#FFCA00]" />
                                {advisor.ultra_points.toLocaleString()} pts
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Botón de Acción (Activar / Suspender) */}
                        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => handleToggleStatus(advisor)}
                            className={`w-full sm:w-auto px-3.5 py-1.5 rounded-[5px] text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                              isSuspended
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                            }`}
                          >
                            {isSuspended ? (
                              <>
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Reactivar Credenciales</span>
                              </>
                            ) : (
                              <>
                                <UserX className="w-3.5 h-3.5" />
                                <span>Suspender Acceso</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {activeTab === 'create' && (
            <div className="max-w-xl mx-auto space-y-4">
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#003E78] mb-1">
                  Alta Directa de Asesor Comercial
                </h3>
                <p className="text-xs text-slate-600">
                  Como Gerente General, puedes crear asesores directamente para cualquier territorio comercial. Las credenciales se emitirán con estado <strong>Activo</strong> de inmediato.
                </p>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1 uppercase tracking-wider">
                    Nombre Completo del Asesor *
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    placeholder="Ej: Carlos Alberto Restrepo"
                    className="w-full px-3 py-2 border border-[#E0E6ED] rounded-[5px] text-xs font-medium focus:outline-none focus:border-[#003E78]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1 uppercase tracking-wider">
                      Correo Institucional *
                    </label>
                    <input
                      type="email"
                      required
                      value={createForm.email}
                      onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                      placeholder="crestrepo@ultracem.co"
                      className="w-full px-3 py-2 border border-[#E0E6ED] rounded-[5px] text-xs font-medium focus:outline-none focus:border-[#003E78]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1 uppercase tracking-wider">
                      Teléfono Móvil
                    </label>
                    <input
                      type="tel"
                      value={createForm.phone}
                      onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                      placeholder="3001234567"
                      className="w-full px-3 py-2 border border-[#E0E6ED] rounded-[5px] text-xs font-medium focus:outline-none focus:border-[#003E78]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1 uppercase tracking-wider">
                      Territorio / Zona *
                    </label>
                    <select
                      value={createForm.zone}
                      onChange={(e) => setCreateForm({ ...createForm, zone: e.target.value })}
                      className="w-full px-3 py-2 border border-[#E0E6ED] rounded-[5px] text-xs font-medium focus:outline-none focus:border-[#003E78] bg-white"
                    >
                      {availableZones.map((z) => (
                        <option key={z} value={z}>{z}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1 uppercase tracking-wider">
                      Código de Empleado
                    </label>
                    <input
                      type="text"
                      required
                      value={createForm.employee_code}
                      onChange={(e) => setCreateForm({ ...createForm, employee_code: e.target.value })}
                      className="w-full px-3 py-2 border border-[#E0E6ED] rounded-[5px] text-xs font-mono font-bold focus:outline-none focus:border-[#003E78]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1 uppercase tracking-wider">
                    Contraseña Temporal Inicial
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.corporate_password}
                    onChange={(e) => setCreateForm({ ...createForm, corporate_password: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E0E6ED] rounded-[5px] text-xs font-mono focus:outline-none focus:border-[#003E78]"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    El asesor deberá cambiar su PIN en el primer ingreso corporativo.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={actionLoadingId === 'create-new'}
                    className="w-full bg-[#003E78] hover:bg-[#002D5A] text-white font-bold py-2.5 rounded-[5px] shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <UserPlus className="w-4 h-4 text-[#FFCA00]" />
                    <span>Habilitar Credenciales de Asesor</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

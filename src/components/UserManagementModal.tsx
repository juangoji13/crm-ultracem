'use client';

import React, { useState } from 'react';
import {
  Users,
  Shield,
  UserCheck,
  UserX,
  ArrowUpCircle,
  ArrowDownCircle,
  UserPlus,
  Clock,
  CheckCircle,
  XCircle,
  X,
  Phone,
  Mail,
  MapPin,
  Trophy,
  AlertTriangle,
  BadgeAlert,
  Send,
  Lock,
  Search,
} from 'lucide-react';
import { User, Role, UserStatus } from '@/lib/types';
import { RBAC } from '@/lib/auth';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  allUsers: User[];
  onUpdateUserRole: (userId: string, newRole: Role) => Promise<void> | void;
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
  onRequestAdvisor: (data: {
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
  onUpdateUserRole,
  onUpdateUserStatus,
  onCreateDirectUser,
  onRequestAdvisor,
}) => {
  const [activeTab, setActiveTab] = useState<'hierarchy' | 'pending' | 'create_direct' | 'request_advisor'>('hierarchy');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Form states for Direct User Creation (Manager)
  const [directForm, setDirectForm] = useState({
    name: '',
    email: '',
    role: 'asesor' as Role,
    zone: 'Atlántico',
    phone: '',
    employee_code: '',
    corporate_password: 'Ultracem2026*',
  });

  // Form states for Advisor Request (Supervisor)
  const [requestForm, setRequestForm] = useState({
    name: '',
    email: '',
    phone: '',
    zone: currentUser.zone || 'Atlántico',
  });

  const [formSuccessMessage, setFormSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isManager = currentUser.role === 'gerente';
  const isSupervisor = currentUser.role === 'supervisor';
  const isAdvisor = currentUser.role === 'asesor';

  // Filtered users for Manager hierarchy view
  const filteredUsers = allUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.employee_code && u.employee_code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      u.zone.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = selectedRoleFilter === 'all' || u.role === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  // Pending approval requests
  const pendingRequests = allUsers.filter((u) => u.status === 'pendiente_aprobacion');

  // Actions for Gerente: Ascend / Degrade
  const handleToggleRole = async (targetUser: User) => {
    if (!isManager) return;
    const newRole: Role = targetUser.role === 'asesor' ? 'supervisor' : 'asesor';
    setActionLoadingId(targetUser.id);
    try {
      await onUpdateUserRole(targetUser.id, newRole);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Actions for Gerente: Suspend / Reactivate
  const handleToggleStatus = async (targetUser: User) => {
    if (!isManager) return;
    const newStatus: UserStatus = targetUser.status === 'suspendido' ? 'activo' : 'suspendido';
    setActionLoadingId(targetUser.id);
    try {
      await onUpdateUserStatus(targetUser.id, newStatus);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Approve Pending Request
  const handleApproveRequest = async (targetUserId: string) => {
    if (!isManager) return;
    setActionLoadingId(targetUserId);
    try {
      await onUpdateUserStatus(targetUserId, 'activo');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Reject Pending Request (Set status to suspendido or remove)
  const handleRejectRequest = async (targetUserId: string) => {
    if (!isManager) return;
    setActionLoadingId(targetUserId);
    try {
      await onUpdateUserStatus(targetUserId, 'suspendido');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Submit Direct Creation (Manager)
  const handleSubmitDirect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directForm.name || !directForm.email || !directForm.employee_code) return;

    setActionLoadingId('submit-direct');
    try {
      await onCreateDirectUser(directForm);
      setFormSuccessMessage(`Colaborador ${directForm.name} registrado con credenciales activas (${directForm.employee_code}).`);
      setDirectForm({
        name: '',
        email: '',
        role: 'asesor',
        zone: 'Atlántico',
        phone: '',
        employee_code: '',
        corporate_password: 'Ultracem2026*',
      });
      setTimeout(() => {
        setFormSuccessMessage(null);
        setActiveTab('hierarchy');
      }, 1500);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Submit Advisor Request (Supervisor)
  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestForm.name || !requestForm.email) return;

    setActionLoadingId('submit-request');
    try {
      await onRequestAdvisor({
        ...requestForm,
        zone: currentUser.zone || requestForm.zone,
      });
      setFormSuccessMessage(
        `Solicitud enviada a Gerencia General. El nuevo asesor quedará en estado "Pendiente de Aprobación".`
      );
      setRequestForm({
        name: '',
        email: '',
        phone: '',
        zone: currentUser.zone || 'Atlántico',
      });
      setTimeout(() => setFormSuccessMessage(null), 3000);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header Modal */}
        <div className="bg-[#003E78] px-6 py-4 text-white flex items-center justify-between border-b border-[#002B54]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Shield className="w-5 h-5 text-[#FFCA00]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  Gobernanza de Credenciales & Jerarquías RBAC
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-[4px] uppercase bg-[#FFCA00] text-[#003E78]">
                  {currentUser.role}
                </span>
              </div>
              <p className="text-xs text-blue-200">
                Sistema institucional de control de accesos y perfiles de Ultracem S.A.S.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-blue-200 hover:text-white p-1.5 rounded-md hover:bg-white/10 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-header / Tabs de Navegación según Rol */}
        {isManager && (
          <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-200 bg-slate-50">
            <button
              onClick={() => setActiveTab('hierarchy')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'hierarchy'
                  ? 'border-[#003E78] text-[#003E78]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Plantilla Comercial & Ascensos ({allUsers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors relative ${
                activeTab === 'pending'
                  ? 'border-[#003E78] text-[#003E78]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Solicitudes Pendientes</span>
              {pendingRequests.length > 0 && (
                <span className="bg-[#E53E3E] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-[4px]">
                  {pendingRequests.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('create_direct')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'create_direct'
                  ? 'border-[#003E78] text-[#003E78]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Alta Directa de Credencial</span>
            </button>
          </div>
        )}

        {isSupervisor && (
          <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-200 bg-slate-50">
            <button
              onClick={() => setActiveTab('request_advisor')}
              className="px-4 py-2.5 text-xs font-bold border-b-2 border-[#003E78] text-[#003E78] flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Solicitar Alta de Asesor para Zona {currentUser.zone}</span>
            </button>
            <button
              onClick={() => setActiveTab('hierarchy')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'hierarchy'
                  ? 'border-[#003E78] text-[#003E78]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Equipo de Zona</span>
            </button>
          </div>
        )}

        {/* Contenido Principal */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {formSuccessMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{formSuccessMessage}</span>
            </div>
          )}

          {/* VISTA 1: Plantilla Comercial & Gestión de Ascensos / Suspensiones (Para Gerente y vista lectura Supervisor) */}
          {activeTab === 'hierarchy' && (
            <div className="space-y-4">
              {/* Barra de Filtros y Búsqueda */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nombre, código o zona..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#003E78] outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs text-slate-500 font-medium">Filtrar rol:</span>
                  <select
                    value={selectedRoleFilter}
                    onChange={(e) => setSelectedRoleFilter(e.target.value)}
                    className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 outline-none"
                  >
                    <option value="all">Todos los Roles</option>
                    <option value="gerente">Gerente</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="asesor">Asesor</option>
                  </select>
                </div>
              </div>

              {/* Grid / Tabla de Colaboradores */}
              <div className="space-y-2.5">
                {filteredUsers.map((user) => {
                  const isCurrent = user.id === currentUser.id;
                  const isSuspended = user.status === 'suspendido';
                  const isPending = user.status === 'pendiente_aprobacion';

                  return (
                    <div
                      key={user.id}
                      className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isSuspended
                          ? 'bg-rose-50/50 border-rose-200'
                          : isPending
                          ? 'bg-amber-50/50 border-amber-200'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {/* Información del Colaborador */}
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full font-bold text-xs flex items-center justify-center shrink-0 border ${
                            user.role === 'gerente'
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : user.role === 'supervisor'
                              ? 'bg-blue-100 text-[#003E78] border-blue-300'
                              : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          }`}
                        >
                          {user.name.charAt(0)}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900">{user.name}</span>
                            {isCurrent && (
                              <span className="text-[10px] bg-blue-100 text-[#003E78] px-1.5 py-0.2 rounded font-semibold">
                                Tú
                              </span>
                            )}
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-[4px] uppercase ${
                                user.role === 'gerente'
                                  ? 'bg-amber-100 text-amber-800'
                                  : user.role === 'supervisor'
                                  ? 'bg-blue-100 text-[#003E78]'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {user.role}
                            </span>

                            {isSuspended && (
                              <span className="text-[10px] bg-red-600 text-white font-bold px-2 py-0.5 rounded-[4px] flex items-center gap-1">
                                <UserX className="w-3 h-3" />
                                Suspendido
                              </span>
                            )}

                            {isPending && (
                              <span className="text-[10px] bg-amber-500 text-white font-bold px-2 py-0.5 rounded-[4px] flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Pendiente
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mt-1">
                            <span className="font-mono font-semibold text-[#003E78] bg-slate-100 px-1.5 py-0.5 rounded">
                              {user.employee_code || 'SIN CÓDIGO'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" />
                              {user.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {user.zone}
                            </span>
                            <span className="flex items-center gap-1 font-semibold text-amber-600">
                              <Trophy className="w-3 h-3 text-[#FFCA00]" />
                              {user.ultra_points} pts
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Botones de Acción RBAC (Exclusivos de Gerente General) */}
                      {isManager && !isCurrent && (
                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          {/* Ascender / Degradar Función */}
                          {user.role === 'asesor' && (
                            <button
                              onClick={() => handleToggleRole(user)}
                              disabled={actionLoadingId === user.id}
                              className="px-2.5 py-1.5 rounded-lg border border-blue-300 bg-blue-50 hover:bg-blue-100 text-[#003E78] text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                              title="Ascender Asesor a Supervisor de Zona"
                            >
                              <ArrowUpCircle className="w-3.5 h-3.5 text-[#1E83EC]" />
                              <span>Ascender a Supervisor</span>
                            </button>
                          )}

                          {user.role === 'supervisor' && (
                            <button
                              onClick={() => handleToggleRole(user)}
                              disabled={actionLoadingId === user.id}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                              title="Degradar Supervisor a Asesor Comercial"
                            >
                              <ArrowDownCircle className="w-3.5 h-3.5 text-amber-600" />
                              <span>Degradar a Asesor</span>
                            </button>
                          )}

                          {/* Suspender / Reactivar Credenciales */}
                          <button
                            onClick={() => handleToggleStatus(user)}
                            disabled={actionLoadingId === user.id}
                            className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                              isSuspended
                                ? 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                                : 'border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100'
                            }`}
                            title={isSuspended ? 'Reactivar credenciales' : 'Revocar acceso inmediato'}
                          >
                            {isSuspended ? (
                              <>
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Reactivar Acceso</span>
                              </>
                            ) : (
                              <>
                                <UserX className="w-3.5 h-3.5 text-rose-600" />
                                <span>Revocar / Suspender</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VISTA 2: Bandeja de Solicitudes Pendientes (Aprobación de Gerencia) */}
          {activeTab === 'pending' && isManager && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
                <BadgeAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Política RBAC: Aprobación Mandatoria de Gerencia General</p>
                  <p className="mt-0.5">
                    Los supervisores pueden proponer candidatos a Asesor para su territorio, pero sus credenciales profesionales permanecen bloqueadas hasta que usted valide la autorización.
                  </p>
                </div>
              </div>

              {pendingRequests.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <CheckCircle className="w-10 h-10 mx-auto mb-2 text-emerald-500 opacity-60" />
                  <p className="text-sm font-semibold text-slate-700">No hay solicitudes pendientes</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Todas las credenciales profesionales solicitadas por supervisores han sido procesadas.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map((req) => {
                    const supervisorRequester = allUsers.find((u) => u.id === req.requested_by_user_id);

                    return (
                      <div
                        key={req.id}
                        className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900 text-sm">{req.name}</h3>
                            <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-[4px] font-bold uppercase">
                              Asesor Solicitado
                            </span>
                            <span className="text-[10px] bg-blue-100 text-[#003E78] px-2 py-0.5 rounded-[4px] font-semibold">
                              Zona {req.zone}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600 mt-2">
                            <p>
                              <strong>Correo:</strong> {req.email}
                            </p>
                            <p>
                              <strong>Teléfono:</strong> {req.phone || 'No registrado'}
                            </p>
                            <p>
                              <strong>Código asignado:</strong>{' '}
                              <span className="font-mono text-[#003E78] font-bold">
                                {req.employee_code}
                              </span>
                            </p>
                            <p>
                              <strong>Solicitado por:</strong>{' '}
                              <span className="text-slate-900 font-semibold">
                                {supervisorRequester ? supervisorRequester.name : 'Supervisor de Zona'}
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* Botones Aprobar / Rechazar */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleApproveRequest(req.id)}
                            disabled={actionLoadingId === req.id}
                            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Aprobar Credenciales</span>
                          </button>

                          <button
                            onClick={() => handleRejectRequest(req.id)}
                            disabled={actionLoadingId === req.id}
                            className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Rechazar</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* VISTA 3: Alta Directa de Colaborador (Exclusivo Gerente General) */}
          {activeTab === 'create_direct' && isManager && (
            <form onSubmit={handleSubmitDirect} className="space-y-4 max-w-2xl mx-auto">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-[#003E78]">
                <strong>Alta Institucional Inmediata:</strong> Como Gerente General, usted puede crear asesores, supervisores y otros directivos con credenciales activadas de forma instantánea.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    value={directForm.name}
                    onChange={(e) => setDirectForm({ ...directForm, name: e.target.value })}
                    placeholder="Ej. Carlos Valderrama"
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#003E78]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Correo Corporativo
                  </label>
                  <input
                    type="email"
                    value={directForm.email}
                    onChange={(e) => setDirectForm({ ...directForm, email: e.target.value })}
                    placeholder="cvalderrama@ultracem.co"
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#003E78]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Cargo / Función RBAC
                  </label>
                  <select
                    value={directForm.role}
                    onChange={(e) => setDirectForm({ ...directForm, role: e.target.value as Role })}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#003E78] bg-white"
                  >
                    <option value="asesor">Asesor Comercial</option>
                    <option value="supervisor">Supervisor de Ventas</option>
                    <option value="gerente">Gerente / Dirección</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Zona Geográfica
                  </label>
                  <select
                    value={directForm.zone}
                    onChange={(e) => setDirectForm({ ...directForm, zone: e.target.value })}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#003E78] bg-white"
                  >
                    <option value="Atlántico">Atlántico</option>
                    <option value="Bolívar">Bolívar</option>
                    <option value="Córdoba">Córdoba</option>
                    <option value="Magdalena">Magdalena</option>
                    <option value="Cesar">Cesar</option>
                    <option value="Nacional">Nacional (Dirección)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Código de Empleado (Único)
                  </label>
                  <input
                    type="text"
                    value={directForm.employee_code}
                    onChange={(e) => setDirectForm({ ...directForm, employee_code: e.target.value.toUpperCase() })}
                    placeholder="Ej. ULTRA-ASE-006"
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#003E78] font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Contraseña Provisional
                  </label>
                  <input
                    type="text"
                    value={directForm.corporate_password}
                    onChange={(e) => setDirectForm({ ...directForm, corporate_password: e.target.value })}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#003E78]"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="submit"
                  disabled={actionLoadingId === 'submit-direct'}
                  className="px-5 py-2.5 bg-[#003E78] hover:bg-[#002D5A] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-60"
                >
                  <UserPlus className="w-4 h-4 text-[#FFCA00]" />
                  <span>Crear y Emitir Credencial Activa</span>
                </button>
              </div>
            </form>
          )}

          {/* VISTA 4: Formulario de Solicitud de Asesor (Exclusivo Supervisor de Ventas) */}
          {(activeTab === 'request_advisor' || isSupervisor) && !isManager && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3">
                <Shield className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">Flujo de Gobernanza para Supervisores</p>
                  <p className="mt-1 leading-relaxed">
                    Como <strong>Supervisor de Zona {currentUser.zone}</strong>, usted puede registrar la solicitud de nuevos asesores comerciales. Por políticas de cumplimiento de Ultracem, la cuenta se creará en estado <span className="font-semibold text-amber-800">"Pendiente de Aprobación"</span> y será enviada automáticamente a la Gerencia General para su activación final.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmitRequest} className="space-y-3.5 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <h3 className="text-sm font-bold text-[#003E78] flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-[#FFCA00]" />
                  Datos del Candidato a Asesor
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      value={requestForm.name}
                      onChange={(e) => setRequestForm({ ...requestForm, name: e.target.value })}
                      placeholder="Ej. Jorge Martínez"
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#003E78]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      value={requestForm.email}
                      onChange={(e) => setRequestForm({ ...requestForm, email: e.target.value })}
                      placeholder="jmartinez@ultracem.co"
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#003E78]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Teléfono / WhatsApp Móvil
                    </label>
                    <input
                      type="tel"
                      value={requestForm.phone}
                      onChange={(e) => setRequestForm({ ...requestForm, phone: e.target.value })}
                      placeholder="3101234567"
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#003E78]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Zona Asignada
                    </label>
                    <input
                      type="text"
                      value={`Zona ${currentUser.zone}`}
                      disabled
                      className="w-full text-xs p-2.5 border border-slate-200 bg-slate-100 rounded-lg text-slate-600 font-semibold cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={actionLoadingId === 'submit-request'}
                    className="px-5 py-2.5 bg-[#003E78] hover:bg-[#002D5A] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-60"
                  >
                    <Send className="w-3.5 h-3.5 text-[#FFCA00]" />
                    <span>Enviar Solicitud a Gerencia General</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* VISTA 5: Credencial de Asesor (Vista de Solo Lectura con Tarjeta Institucional) */}
          {isAdvisor && (
            <div className="max-w-md mx-auto space-y-4">
              <div className="bg-linear-to-br from-[#003E78] to-[#002447] text-white p-6 rounded-2xl shadow-xl border border-blue-400/20 relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFCA00]">
                    Credencial Oficial Ultracem
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 px-2 py-0.5 rounded-[4px] font-bold">
                    ACTIVO
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-white/10 border-2 border-[#FFCA00] flex items-center justify-center font-bold text-xl text-white">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">{currentUser.name}</h3>
                    <p className="text-xs text-blue-200 uppercase font-semibold">
                      {currentUser.role} Comercial — {currentUser.zone}
                    </p>
                    <p className="font-mono text-xs text-[#FFCA00] mt-1 font-bold">
                      {currentUser.employee_code || 'ULTRA-ASE-003'}
                    </p>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-blue-300 block text-[10px]">Puntos Ultra Acumulados</span>
                    <span className="font-bold text-white text-sm">
                      {currentUser.ultra_points.toLocaleString()} pts
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-300 block text-[10px]">Gobernanza RBAC</span>
                    <span className="font-bold text-white text-xs">
                      Jerarquía Nivel 1 (Campo)
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-600 flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <p>
                  Como <strong>Asesor Comercial</strong>, tu perfil opera bajo permisos de solo lectura para credenciales. Las solicitudes de cambio de rol, zona o reasignación son autorizadas por tu Supervisor y la Dirección General.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Modal */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5 font-medium">
            <Shield className="w-3.5 h-3.5 text-[#003E78]" />
            Control de Acceso Basado en Roles (RBAC) Ultracem
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

import { User, Role, UserStatus } from './types';

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
  errorCode?: 'INVALID_CREDENTIALS' | 'SUSPENDED' | 'PENDING_APPROVAL' | 'USER_NOT_FOUND';
}

const AUTH_STORAGE_KEY = 'ultracem_auth_user_session';

/**
 * Autenticación mediante credenciales profesionales:
 * - Código de empleado (ej. ULTRA-GER-001) o correo corporativo (@ultracem.co)
 * - Contraseña / PIN corporativo
 * - Validación de estado de cuenta (activo / suspendido / pendiente_aprobacion)
 */
export function authenticateUser(
  identifier: string,
  password: string,
  availableUsers: User[]
): AuthResult {
  const cleanId = identifier.trim().toLowerCase();
  const cleanPass = password.trim();

  if (!cleanId || !cleanPass) {
    return {
      success: false,
      error: 'Por favor ingresa tu código de empleado o correo corporativo y tu contraseña.',
      errorCode: 'INVALID_CREDENTIALS',
    };
  }

  // Buscar por employee_code o por email (case-insensitive)
  const user = availableUsers.find(
    (u) =>
      (u.employee_code && u.employee_code.toLowerCase() === cleanId) ||
      u.email.toLowerCase() === cleanId
  );

  if (!user) {
    return {
      success: false,
      error: `No se encontró ningún colaborador con el código o correo corporativo: "${identifier.trim()}".`,
      errorCode: 'USER_NOT_FOUND',
    };
  }

  // Validar contraseña corporativa
  const expectedPassword = user.corporate_password || 'Ultracem2026*';
  if (cleanPass !== expectedPassword) {
    return {
      success: false,
      error: 'La contraseña corporativa o PIN ingresado es incorrecto. Verifique sus credenciales.',
      errorCode: 'INVALID_CREDENTIALS',
    };
  }

  // Validar Jerarquía y Estado de la Credencial
  const status = user.status || 'activo';
  if (status === 'suspendido') {
    return {
      success: false,
      error: `ACCESO DENEGADO: Las credenciales del colaborador ${user.name} (${user.employee_code || user.email}) han sido REVOCADAS/SUSPENDIDAS por la Dirección General. Contacte a Recursos Humanos o a Gerencia Comercial.`,
      errorCode: 'SUSPENDED',
    };
  }

  if (status === 'pendiente_aprobacion') {
    return {
      success: false,
      error: `CREDENCIALES EN REVISIÓN: El registro del asesor ${user.name} se encuentra en estado 'Pendiente de Aprobación'. Requiere autorización obligatoria de la Gerencia General de Ultracem antes del primer inicio de sesión.`,
      errorCode: 'PENDING_APPROVAL',
    };
  }

  // Login exitoso
  saveSession(user);
  return {
    success: true,
    user,
  };
}

/**
 * Guarda la sesión del usuario autenticado en LocalStorage
 */
export function saveSession(user: User): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  } catch (e) {
    console.warn('[Auth] No se pudo guardar la sesión en localStorage:', e);
  }
}

/**
 * Recupera la sesión actual almacenada
 */
export function getStoredSession(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch (e) {
    console.warn('[Auth] Error leyendo sesión guardada:', e);
    return null;
  }
}

/**
 * Cierra la sesión activa
 */
export function clearSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (e) {
    console.warn('[Auth] Error limpiando sesión:', e);
  }
}

/**
 * Permisos RBAC Jerárquicos de Ultracem:
 * 
 * 1. Gerente General:
 *    - Acceso total a analítica nacional y metas corporativas.
 *    - Crear asesores directamente y crear nuevos supervisores/gerentes.
 *    - Aprobar o rechazar solicitudes de asesores creados por supervisores.
 *    - Ascender o degradar roles (Asesor <-> Supervisor).
 *    - Revocar/suspender o reactivar credenciales de acceso.
 * 
 * 2. Supervisor de Ventas:
 *    - Supervisión de remisiones de su zona asignada.
 *    - Solicitar creación de nuevos Asesores para su zona (estado pendiente_aprobacion).
 *    - NO puede autorizar directamente ni ascender/degradar personal.
 * 
 * 3. Asesor Comercial:
 *    - Registro de remisiones en campo.
 *    - Consulta de clientes y metas personales.
 *    - NO puede crear credenciales ni gestionar usuarios.
 */
export const RBAC = {
  // Permite gestión directa y aprobación
  canManageHierarchy: (user?: User | null): boolean => {
    return user?.role === 'gerente';
  },

  // Permite crear usuarios directamente activos
  canCreateDirectUsers: (user?: User | null): boolean => {
    return user?.role === 'gerente';
  },

  // Permite solicitar asesores (Supervisores y Gerentes)
  canRequestAdvisors: (user?: User | null): boolean => {
    return user?.role === 'supervisor' || user?.role === 'gerente';
  },

  // Permite aprobar o rechazar solicitudes pendientes
  canApproveAdvisorRequests: (user?: User | null): boolean => {
    return user?.role === 'gerente';
  },

  // Permite ascender o degradar de cargo
  canPromoteDemote: (user?: User | null): boolean => {
    return user?.role === 'gerente';
  },

  // Permite suspender o revocar credenciales
  canRevokeCredentials: (user?: User | null): boolean => {
    return user?.role === 'gerente';
  },

  // Permite aprobar o rechazar ventas
  canReviewSales: (user?: User | null): boolean => {
    return user?.role === 'supervisor' || user?.role === 'gerente';
  },

  // Permite registrar ventas
  canRegisterSales: (user?: User | null): boolean => {
    return user?.role === 'asesor';
  },
};

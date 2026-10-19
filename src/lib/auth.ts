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
 * Permisos RBAC de Ultracem (Modelo de 2 Roles):
 * 
 * 1. Gerente Comercial ('gerente'):
 *    - Auditoría y aprobación/rechazo de remisiones con validación de báscula y SLA 48h.
 *    - Tablero de control ejecutivo, métricas consolidadas por zona/producto y exportación CSV.
 *    - Gestión de la fuerza comercial y credenciales (crear asesores, suspender/reactivar acceso).
 *    - Visualización del Ranking & Podio Nacional.
 * 
 * 2. Asesor Comercial ('asesor'):
 *    - Registro de remisiones en campo con foto de báscula y modo offline PWA.
 *    - Cartera de clientes asignados y semáforo de recencia.
 *    - Tabla de Posiciones / Ranking y Podio en tiempo real con indicador de distancia.
 *    - Catálogo de Recompensas e incentivos comerciales con canje de Puntos Ultra.
 *    - ENTORNO PROTEGIDO: Sin acceso ni visibilidad a credenciales ni gestión de otros usuarios.
 */
export const RBAC = {
  // Permite gestión de asesores y credenciales
  canManageCredentials: (user?: User | null): boolean => {
    return user?.role === 'gerente';
  },

  // Permite crear asesores comerciales
  canCreateAdvisors: (user?: User | null): boolean => {
    return user?.role === 'gerente';
  },

  // Permite suspender o reactivar credenciales
  canRevokeCredentials: (user?: User | null): boolean => {
    return user?.role === 'gerente';
  },

  // Permite auditar, aprobar o rechazar ventas
  canReviewSales: (user?: User | null): boolean => {
    return user?.role === 'gerente';
  },

  // Permite registrar ventas en campo
  canRegisterSales: (user?: User | null): boolean => {
    return user?.role === 'asesor';
  },

  // Permite ver métricas ejecutivas consolidadas
  canViewExecutiveMetrics: (user?: User | null): boolean => {
    return user?.role === 'gerente';
  },
};

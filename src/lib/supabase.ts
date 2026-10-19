import { createClient } from '@supabase/supabase-js';
import { User, Client, Goal, Sale, NotificationItem, Role, UserStatus } from './types';
import {
  INITIAL_USERS,
  INITIAL_CLIENTS,
  INITIAL_GOALS,
  INITIAL_SALES,
  INITIAL_NOTIFICATIONS,
} from './mockData';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://149.130.186.213:8000';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

/**
 * Health check helper to verify connectivity to Supabase
 */
export async function checkSupabaseHealth(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from('ultracem_users').select('id').limit(1);
    if (error) {
      console.warn('[Supabase] Health check returned error:', error.message);
      return false;
    }
    return Boolean(data);
  } catch (err) {
    console.warn('[Supabase] Health check failed, using fallback:', err);
    return false;
  }
}

/**
 * 1. Fetch Clients (Uses view_ultracem_clients_with_recency for calculated recency fields)
 */
export async function fetchUltracemClients(): Promise<Client[]> {
  try {
    const { data, error } = await supabase
      .from('view_ultracem_clients_with_recency')
      .select('*')
      .order('business_name', { ascending: true });

    if (error || !data || data.length === 0) {
      console.warn('[Supabase] Fallback to INITIAL_CLIENTS:', error?.message);
      return INITIAL_CLIENTS;
    }

    return data.map((item: any) => ({
      id: item.id,
      business_name: item.business_name,
      nit: item.nit,
      address: item.address,
      city: item.city,
      department: item.department,
      zone: item.zone,
      usual_product: item.usual_product,
      assigned_advisor_id: item.assigned_advisor_id,
      advisor_name: item.advisor_name,
      contact_phone: item.contact_phone,
      contact_whatsapp: item.contact_whatsapp,
      last_purchase_date: item.last_purchase_date,
      last_purchase_volume: item.last_purchase_volume ? Number(item.last_purchase_volume) : undefined,
      recency_status: item.recency_status,
      days_since_last_purchase: item.days_since_last_purchase !== null ? Number(item.days_since_last_purchase) : undefined,
    }));
  } catch (err) {
    console.warn('[Supabase] Network/exception in fetchUltracemClients, fallback:', err);
    return INITIAL_CLIENTS;
  }
}

/**
 * 2. Fetch Sales (Includes client and advisor joined relations)
 */
export async function fetchUltracemSales(): Promise<Sale[]> {
  try {
    const { data, error } = await supabase
      .from('ultracem_sales')
      .select('*, ultracem_clients(business_name), advisor:ultracem_users!ultracem_sales_advisor_id_fkey(name)')
      .order('submitted_at', { ascending: false });

    if (error || !data || data.length === 0) {
      console.warn('[Supabase] Fallback to INITIAL_SALES:', error?.message);
      return INITIAL_SALES;
    }

    return data.map((item: any) => ({
      id: item.id,
      client_id: item.client_id,
      client_name: item.ultracem_clients?.business_name || 'Cliente Ultracem',
      advisor_id: item.advisor_id,
      advisor_name: item.advisor?.name || 'Asesor Comercial',
      reviewer_id: item.reviewer_id,
      product_type: item.product_type,
      volume: Number(item.volume),
      volume_unit: item.volume_unit,
      total_value_cop: Number(item.total_value_cop),
      document_number: item.document_number,
      receipt_url: item.receipt_url,
      status: item.status,
      rejection_reason: item.rejection_reason,
      ultra_points_awarded: Number(item.ultra_points_awarded || 0),
      submitted_at: item.submitted_at,
      reviewed_at: item.reviewed_at,
      sla_deadline: item.sla_deadline,
    }));
  } catch (err) {
    console.warn('[Supabase] Network/exception in fetchUltracemSales, fallback:', err);
    return INITIAL_SALES;
  }
}

/**
 * 3. Fetch Goals
 */
export async function fetchUltracemGoals(): Promise<Goal[]> {
  try {
    const { data, error } = await supabase
      .from('ultracem_goals')
      .select('*')
      .order('period_end', { ascending: true });

    if (error || !data || data.length === 0) {
      console.warn('[Supabase] Fallback to INITIAL_GOALS:', error?.message);
      return INITIAL_GOALS;
    }

    return data.map((item: any) => ({
      id: item.id,
      title: item.title,
      assignment_type: item.assignment_type,
      assigned_to_user_id: item.assigned_to_user_id,
      assigned_zone: item.assigned_zone,
      product_type: item.product_type,
      target_volume: Number(item.target_volume),
      current_volume: Number(item.current_volume),
      volume_unit: item.volume_unit,
      bonus_points: Number(item.bonus_points),
      period_start: item.period_start,
      period_end: item.period_end,
      status: item.status,
    }));
  } catch (err) {
    console.warn('[Supabase] Network/exception in fetchUltracemGoals, fallback:', err);
    return INITIAL_GOALS;
  }
}

/**
 * 4. Fetch Users
 */
export async function fetchUltracemUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('ultracem_users')
      .select('*')
      .order('name', { ascending: true });

    if (error || !data || data.length === 0) {
      console.warn('[Supabase] Fallback to INITIAL_USERS:', error?.message);
      return INITIAL_USERS;
    }

    return data.map((item: any) => ({
      id: item.id,
      email: item.email,
      name: item.name,
      role: item.role,
      zone: item.zone,
      phone: item.phone,
      avatar_url: item.avatar_url,
      supervisor_id: item.supervisor_id,
      ultra_points: Number(item.ultra_points || 0),
      employee_code: item.employee_code,
      corporate_password: item.corporate_password,
      status: item.status || 'activo',
      requested_by_user_id: item.requested_by_user_id,
      approved_by_user_id: item.approved_by_user_id,
    }));
  } catch (err) {
    console.warn('[Supabase] Network/exception in fetchUltracemUsers, fallback:', err);
    return INITIAL_USERS;
  }
}

/**
 * 5. Fetch Notifications
 */
export async function fetchUltracemNotifications(userId?: string): Promise<NotificationItem[]> {
  try {
    let query = supabase
      .from('ultracem_notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      console.warn('[Supabase] Fallback to INITIAL_NOTIFICATIONS:', error?.message);
      return userId
        ? INITIAL_NOTIFICATIONS.filter((n) => n.user_id === userId)
        : INITIAL_NOTIFICATIONS;
    }

    return data.map((item: any) => ({
      id: item.id,
      user_id: item.user_id,
      type: item.type,
      title: item.title,
      message: item.message,
      reference_id: item.reference_id,
      reference_type: item.reference_type,
      read: item.read,
      created_at: item.created_at,
    }));
  } catch (err) {
    console.warn('[Supabase] Network/exception in fetchUltracemNotifications, fallback:', err);
    return userId
      ? INITIAL_NOTIFICATIONS.filter((n) => n.user_id === userId)
      : INITIAL_NOTIFICATIONS;
  }
}

/**
 * Helper to ensure a valid UUID format for PostgreSQL UUID columns
 */
function isValidUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

/**
 * 6. Insert Sale
 */
export async function insertUltracemSale(
  saleData: Partial<Sale> & {
    client_id: string;
    advisor_id: string;
    product_type: Sale['product_type'];
    volume: number;
    volume_unit: Sale['volume_unit'];
    document_number: string;
    receipt_url: string;
  }
): Promise<Sale> {
  const generatedId = (saleData.id && isValidUuid(saleData.id)) 
    ? saleData.id 
    : (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : undefined);

  const payload: Record<string, any> = {
    client_id: saleData.client_id,
    advisor_id: saleData.advisor_id,
    reviewer_id: saleData.reviewer_id || null,
    product_type: saleData.product_type,
    volume: saleData.volume,
    volume_unit: saleData.volume_unit,
    total_value_cop: saleData.total_value_cop || 0,
    document_number: saleData.document_number,
    receipt_url: saleData.receipt_url,
    status: saleData.status || 'pendiente',
    ultra_points_awarded: saleData.ultra_points_awarded || 0,
    submitted_at: saleData.submitted_at || new Date().toISOString(),
  };

  if (generatedId) {
    payload.id = generatedId;
  }

  try {
    const { data, error } = await supabase
      .from('ultracem_sales')
      .insert([payload])
      .select('*, ultracem_clients(business_name), advisor:ultracem_users!ultracem_sales_advisor_id_fkey(name)')
      .single();

    if (error) {
      console.warn('[Supabase] Error inserting sale in database, falling back:', error.message);
      return {
        id: generatedId || `sale-${Date.now()}`,
        client_id: saleData.client_id,
        client_name: saleData.client_name,
        advisor_id: saleData.advisor_id,
        advisor_name: saleData.advisor_name,
        reviewer_id: saleData.reviewer_id,
        product_type: saleData.product_type,
        volume: saleData.volume,
        volume_unit: saleData.volume_unit,
        total_value_cop: saleData.total_value_cop || 0,
        document_number: saleData.document_number,
        receipt_url: saleData.receipt_url,
        status: (saleData.status as any) || 'pendiente',
        ultra_points_awarded: saleData.ultra_points_awarded || 0,
        submitted_at: payload.submitted_at,
      };
    }

    return {
      id: data.id,
      client_id: data.client_id,
      client_name: data.ultracem_clients?.business_name || saleData.client_name,
      advisor_id: data.advisor_id,
      advisor_name: data.advisor?.name || saleData.advisor_name,
      reviewer_id: data.reviewer_id,
      product_type: data.product_type,
      volume: Number(data.volume),
      volume_unit: data.volume_unit,
      total_value_cop: Number(data.total_value_cop),
      document_number: data.document_number,
      receipt_url: data.receipt_url,
      status: data.status,
      rejection_reason: data.rejection_reason,
      ultra_points_awarded: Number(data.ultra_points_awarded || 0),
      submitted_at: data.submitted_at,
      reviewed_at: data.reviewed_at,
      sla_deadline: data.sla_deadline,
    };
  } catch (err) {
    console.warn('[Supabase] Exception inserting sale:', err);
    return {
      id: generatedId || `sale-${Date.now()}`,
      client_id: saleData.client_id,
      client_name: saleData.client_name,
      advisor_id: saleData.advisor_id,
      advisor_name: saleData.advisor_name,
      reviewer_id: saleData.reviewer_id,
      product_type: saleData.product_type,
      volume: saleData.volume,
      volume_unit: saleData.volume_unit,
      total_value_cop: saleData.total_value_cop || 0,
      document_number: saleData.document_number,
      receipt_url: saleData.receipt_url,
      status: (saleData.status as any) || 'pendiente',
      ultra_points_awarded: saleData.ultra_points_awarded || 0,
      submitted_at: payload.submitted_at,
    };
  }
}

/**
 * 7. Update Sale Status (Approve, Reject, Request Correction)
 */
export async function updateSaleStatus(
  saleId: string,
  status: 'pendiente' | 'aprobada' | 'rechazada' | 'por_corregir',
  reason?: string,
  reviewerId?: string,
  pointsAwarded?: number
): Promise<boolean> {
  try {
    const updatePayload: Record<string, any> = {
      status,
      rejection_reason: reason || null,
      reviewed_at: new Date().toISOString(),
    };

    if (reviewerId) {
      updatePayload.reviewer_id = reviewerId;
    }

    if (pointsAwarded !== undefined) {
      updatePayload.ultra_points_awarded = pointsAwarded;
    }

    const { error } = await supabase
      .from('ultracem_sales')
      .update(updatePayload)
      .eq('id', saleId);

    if (error) {
      console.warn('[Supabase] Failed to update sale status:', error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.warn('[Supabase] Exception in updateSaleStatus:', err);
    return false;
  }
}

/**
 * 8. Add Ultra Points to User
 */
export async function addUltraPoints(userId: string, points: number): Promise<number | null> {
  try {
    // 1. Fetch current points
    const { data: user, error: fetchError } = await supabase
      .from('ultracem_users')
      .select('ultra_points')
      .eq('id', userId)
      .single();

    if (fetchError || !user) {
      console.warn('[Supabase] User not found for adding points:', fetchError?.message);
      return null;
    }

    const newPoints = (user.ultra_points || 0) + points;

    // 2. Update user points
    const { error: updateError } = await supabase
      .from('ultracem_users')
      .update({ ultra_points: newPoints })
      .eq('id', userId);

    if (updateError) {
      console.warn('[Supabase] Failed updating points:', updateError.message);
      return null;
    }

    return newPoints;
  } catch (err) {
    console.warn('[Supabase] Exception in addUltraPoints:', err);
    return null;
  }
}

/**
 * 9. Insert Notification
 */
export async function insertUltracemNotification(
  notification: Omit<NotificationItem, 'id' | 'created_at'> & { id?: string }
): Promise<NotificationItem | null> {
  const generatedId = (notification.id && isValidUuid(notification.id))
    ? notification.id
    : (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : undefined);

  const payload: Record<string, any> = {
    user_id: notification.user_id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    reference_id: notification.reference_id && isValidUuid(notification.reference_id) ? notification.reference_id : null,
    reference_type: notification.reference_type || null,
    read: notification.read ?? false,
  };

  if (generatedId) {
    payload.id = generatedId;
  }

  try {
    const { data, error } = await supabase
      .from('ultracem_notifications')
      .insert([payload])
      .select('*')
      .single();

    if (error || !data) {
      console.warn('[Supabase] Error inserting notification:', error?.message);
      return null;
    }

    return {
      id: data.id,
      user_id: data.user_id,
      type: data.type,
      title: data.title,
      message: data.message,
      reference_id: data.reference_id,
      reference_type: data.reference_type,
      read: data.read,
      created_at: data.created_at,
    };
  } catch (err) {
    console.warn('[Supabase] Exception inserting notification:', err);
    return null;
  }
}

/**
 * 10. RBAC: Create User (Gerente General direct creation)
 */
export async function createUltracemUser(userData: {
  name: string;
  email: string;
  role: Role;
  zone: string;
  phone?: string;
  employee_code: string;
  corporate_password?: string;
  status?: UserStatus;
  requested_by_user_id?: string;
  approved_by_user_id?: string;
}): Promise<User | null> {
  const generatedId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : undefined;

  const payload: Record<string, any> = {
    name: userData.name,
    email: userData.email,
    role: userData.role,
    zone: userData.zone,
    phone: userData.phone || null,
    employee_code: userData.employee_code,
    corporate_password: userData.corporate_password || 'Ultracem2026*',
    status: userData.status || 'activo',
    ultra_points: 0,
    requested_by_user_id: userData.requested_by_user_id || null,
    approved_by_user_id: userData.approved_by_user_id || null,
  };

  if (generatedId) {
    payload.id = generatedId;
  }

  try {
    const { data, error } = await supabase
      .from('ultracem_users')
      .insert([payload])
      .select('*')
      .single();

    if (error || !data) {
      console.warn('[Supabase] Error creating user:', error?.message);
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role,
      zone: data.zone,
      phone: data.phone,
      avatar_url: data.avatar_url,
      supervisor_id: data.supervisor_id,
      ultra_points: Number(data.ultra_points || 0),
      employee_code: data.employee_code,
      corporate_password: data.corporate_password,
      status: data.status,
      requested_by_user_id: data.requested_by_user_id,
      approved_by_user_id: data.approved_by_user_id,
    };
  } catch (err) {
    console.warn('[Supabase] Exception in createUltracemUser:', err);
    return null;
  }
}

/**
 * 11. RBAC: Update User Role (Promote Asesor -> Supervisor or Demote Supervisor -> Asesor)
 */
export async function updateUserRole(userId: string, newRole: Role): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('ultracem_users')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      console.warn('[Supabase] Error updating user role:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Exception in updateUserRole:', err);
    return false;
  }
}

/**
 * 12. RBAC: Update User Status (Activate, Suspend, Approve)
 */
export async function updateUserStatus(
  userId: string,
  newStatus: UserStatus,
  approvedById?: string
): Promise<boolean> {
  try {
    const updatePayload: Record<string, any> = { status: newStatus };
    if (approvedById) {
      updatePayload.approved_by_user_id = approvedById;
    }

    const { error } = await supabase
      .from('ultracem_users')
      .update(updatePayload)
      .eq('id', userId);

    if (error) {
      console.warn('[Supabase] Error updating user status:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Exception in updateUserStatus:', err);
    return false;
  }
}

/**
 * 13. RBAC: Supervisor requests new Advisor (Status starts as 'pendiente_aprobacion')
 */
export async function requestAdvisorCreation(data: {
  name: string;
  email: string;
  phone: string;
  zone: string;
  requestedByUserId: string;
}): Promise<User | null> {
  const generatedCode = `ULTRA-ASE-${Math.floor(100 + Math.random() * 900)}`;
  return createUltracemUser({
    name: data.name,
    email: data.email,
    phone: data.phone,
    zone: data.zone,
    role: 'asesor',
    employee_code: generatedCode,
    corporate_password: 'Ultra2026*Ase',
    status: 'pendiente_aprobacion',
    requested_by_user_id: data.requestedByUserId,
  });
}


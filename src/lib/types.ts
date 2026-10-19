export type Role = 'asesor' | 'supervisor' | 'gerente';

export type UserStatus = 'activo' | 'suspendido' | 'pendiente_aprobacion';

export type ProductType = 'Cemento' | 'Concreto' | 'Pegantes' | 'Morteros';

export type RecencyStatus = 'optimo' | 'alerta' | 'critico' | 'inactivo';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  zone: string;
  phone?: string;
  avatar_url?: string;
  supervisor_id?: string;
  ultra_points: number;
  employee_code?: string;
  corporate_password?: string;
  status?: UserStatus;
  requested_by_user_id?: string;
  approved_by_user_id?: string;
}

export interface Client {
  id: string;
  business_name: string;
  nit: string;
  address: string;
  city: string;
  department: string;
  zone: string;
  usual_product: ProductType;
  assigned_advisor_id: string;
  advisor_name?: string;
  contact_phone?: string;
  contact_whatsapp?: string;
  last_purchase_date?: string;
  last_purchase_volume?: number;
  recency_status?: RecencyStatus;
  days_since_last_purchase?: number;
}

export interface Goal {
  id: string;
  title: string;
  assignment_type: 'asesor' | 'zona';
  assigned_to_user_id?: string;
  assigned_zone?: string;
  product_type: ProductType | 'Todos';
  target_volume: number;
  current_volume: number;
  volume_unit: 'Ton' | 'm3';
  bonus_points: number;
  period_start: string;
  period_end: string;
  status: 'activa' | 'cumplida' | 'vencida';
}

export interface Sale {
  id: string;
  client_id: string;
  client_name?: string;
  advisor_id: string;
  advisor_name?: string;
  reviewer_id?: string;
  product_type: ProductType;
  volume: number;
  volume_unit: 'Ton' | 'm3';
  total_value_cop: number;
  document_number: string;
  receipt_url: string;
  status: 'pendiente' | 'aprobada' | 'rechazada' | 'por_corregir';
  rejection_reason?: string;
  ultra_points_awarded: number;
  submitted_at: string;
  reviewed_at?: string;
  sla_deadline?: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  type: 'aprobacion' | 'rechazo' | 'meta_cumplida' | 'sla_vencido' | 'info';
  title: string;
  message: string;
  reference_id?: string;
  reference_type?: string;
  read: boolean;
  created_at: string;
}

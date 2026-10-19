import Dexie, { Table } from 'dexie';
import { Sale, Client, Goal } from './types';
import { insertUltracemSale } from './supabase';

export interface PendingSaleItem {
  id?: number;
  tempId: string;
  client_id: string;
  client_name: string;
  advisor_id: string;
  advisor_name: string;
  product_type: any;
  volume: number;
  volume_unit: 'Ton' | 'm3';
  total_value_cop: number;
  document_number: string;
  receipt_url: string;
  submitted_at: string;
  status: 'pending_sync' | 'synced' | 'error';
  sync_error?: string;
}

export class UltracemOfflineDatabase extends Dexie {
  pendingSales!: Table<PendingSaleItem, number>;
  cachedClients!: Table<Client, string>;
  cachedGoals!: Table<Goal, string>;

  constructor() {
    super('UltracemOfflineDB');
    this.version(1).stores({
      pendingSales: '++id, tempId, client_id, document_number, status, submitted_at',
      cachedClients: 'id, business_name, nit, zone, recency_status',
      cachedGoals: 'id, assigned_to_user_id, status',
    });
  }
}

export const offlineDb = new UltracemOfflineDatabase();

/**
 * Guarda una venta en IndexedDB local cuando el asesor está sin cobertura
 */
export async function saveSaleOffline(saleData: Omit<Sale, 'id' | 'submitted_at'>): Promise<PendingSaleItem> {
  const tempId = `offline-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const item: PendingSaleItem = {
    tempId,
    client_id: saleData.client_id,
    client_name: saleData.client_name || 'Cliente',
    advisor_id: saleData.advisor_id,
    advisor_name: saleData.advisor_name || 'Asesor',
    product_type: saleData.product_type,
    volume: saleData.volume,
    volume_unit: saleData.volume_unit,
    total_value_cop: saleData.total_value_cop,
    document_number: saleData.document_number,
    receipt_url: saleData.receipt_url,
    submitted_at: new Date().toISOString(),
    status: 'pending_sync',
  };

  const id = await offlineDb.pendingSales.add(item);
  return { ...item, id };
}

/**
 * Obtiene el número de ventas pendientes por sincronizar
 */
export async function getPendingSyncCount(): Promise<number> {
  try {
    return await offlineDb.pendingSales.where('status').equals('pending_sync').count();
  } catch {
    return 0;
  }
}

/**
 * Sincroniza todas las ventas locales pendientes hacia Supabase en Oracle Cloud
 */
export async function syncPendingSales(): Promise<{ syncedCount: number; errors: any[] }> {
  const pending = await offlineDb.pendingSales.where('status').equals('pending_sync').toArray();
  let syncedCount = 0;
  const errors: any[] = [];

  for (const item of pending) {
    try {
      await insertUltracemSale({
        client_id: item.client_id,
        client_name: item.client_name,
        advisor_id: item.advisor_id,
        advisor_name: item.advisor_name,
        product_type: item.product_type,
        volume: item.volume,
        volume_unit: item.volume_unit,
        total_value_cop: item.total_value_cop,
        document_number: item.document_number,
        receipt_url: item.receipt_url,
        status: 'pendiente',
        ultra_points_awarded: 125,
      });

      if (item.id) {
        await offlineDb.pendingSales.update(item.id, { status: 'synced' });
      }
      syncedCount++;
    } catch (err) {
      console.error('Error sincronizando venta offline:', err);
      if (item.id) {
        await offlineDb.pendingSales.update(item.id, {
          status: 'error',
          sync_error: String(err),
        });
      }
      errors.push({ id: item.id, error: err });
    }
  }

  return { syncedCount, errors };
}

/**
 * Cachea los clientes en local para que el asesor pueda consultarlos sin internet
 */
export async function cacheClientsLocally(clients: Client[]): Promise<void> {
  try {
    await offlineDb.cachedClients.bulkPut(clients);
  } catch (err) {
    console.warn('Error guardando clientes en cache local:', err);
  }
}

/**
 * Obtiene los clientes guardados en cache local si no hay internet
 */
export async function getCachedClients(): Promise<Client[]> {
  try {
    return await offlineDb.cachedClients.toArray();
  } catch {
    return [];
  }
}

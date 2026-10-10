import { openDB, type DBSchema } from 'idb';

interface SmartBiteDB extends DBSchema {
  offline_donations: {
    key: string;
    value: {
      clientOperationId: string;
      outletId: string;
      outletName?: string;
      foodCategory: string;
      foodDescription: string;
      mealCount: number;
      preparationTime: string;
      storageCondition: string;
      allergenInfo: string[];
      collectionDeadline: string;
      packagingStatus: string;
      contactPhone: string;
      savedAt: string;
      syncStatus: 'saved_locally' | 'syncing' | 'synced' | 'failed';
    };
  };
}

const DB_NAME = 'smartbite_offline_store';
const STORE_NAME = 'offline_donations';

export async function initOfflineDB() {
  return openDB<SmartBiteDB>(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'clientOperationId' });
      }
    },
  });
}

export async function saveOfflineDonation(data: any) {
  const db = await initOfflineDB();
  const record = {
    ...data,
    clientOperationId: data.clientOperationId || `offline_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    savedAt: new Date().toISOString(),
    syncStatus: 'saved_locally' as const
  };
  await db.put(STORE_NAME, record);
  return record;
}

export async function getOfflineDonations() {
  const db = await initOfflineDB();
  return db.getAll(STORE_NAME);
}

export async function removeOfflineDonation(clientOperationId: string) {
  const db = await initOfflineDB();
  await db.delete(STORE_NAME, clientOperationId);
}

export async function syncPendingOfflineDonations(): Promise<{ syncedCount: number; failedCount: number }> {
  const items = await getOfflineDonations();
  const pending = items.filter(i => i.syncStatus === 'saved_locally' || i.syncStatus === 'failed');

  let syncedCount = 0;
  let failedCount = 0;

  for (const item of pending) {
    try {
      const response = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });

      if (response.ok) {
        await removeOfflineDonation(item.clientOperationId);
        syncedCount++;
      } else {
        failedCount++;
      }
    } catch (e) {
      failedCount++;
    }
  }

  return { syncedCount, failedCount };
}

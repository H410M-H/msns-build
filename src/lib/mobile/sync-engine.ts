import { getDb, isNative } from "./native-service";

export interface SyncQueueItem {
  id: string;
  action: string;
  payload: string;
  createdAt: string;
  status: string;
}

export const addToSyncQueue = async (action: string, payload: unknown) => {
  const payloadStr = JSON.stringify(payload);
  const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const createdAt = new Date().toISOString();
  const status = 'PENDING';

  if (isNative()) {
    try {
      const db = await getDb();
      const dbRun = db as unknown as { run(query: string, params: unknown[]): Promise<void> };
      await dbRun.run(
        `INSERT INTO sync_queue (id, action, payload, createdAt, status) VALUES (?, ?, ?, ?, ?)`,
        [id, action, payloadStr, createdAt, status]
      );
      console.log(`[SyncEngine] Added action ${action} to SQLite sync queue.`);
    } catch (err) {
      console.error('[SyncEngine] Failed to add item to SQLite sync queue:', err);
    }
  } else {
    if (typeof window !== 'undefined') {
      const localQueueStr = localStorage.getItem('sync_queue') ?? '[]';
      const localQueue = JSON.parse(localQueueStr) as SyncQueueItem[];
      localQueue.push({ id, action, payload: payloadStr, createdAt, status });
      localStorage.setItem('sync_queue', JSON.stringify(localQueue));
      console.log(`[SyncEngine] Added action ${action} to localStorage sync queue.`);
    }
  }
};

export interface TRPCClient {
  marks: {
    saveAllMarks: {
      mutate(payload: unknown): Promise<void>;
    };
  };
  subjectDiary: {
    create: {
      mutate(payload: unknown): Promise<void>;
    };
  };
}

export const processSyncQueue = async (trpcClient: TRPCClient) => {
  let items: SyncQueueItem[] = [];

  if (isNative()) {
    try {
      const db = await getDb();
      const dbQuery = db as unknown as { query(query: string): Promise<{ values?: SyncQueueItem[] }> };
      const res = await dbQuery.query(`SELECT * FROM sync_queue WHERE status = 'PENDING' OR status = 'FAILED'`);
      items = res.values ?? [];
    } catch (err) {
      console.error('[SyncEngine] Failed to query sync queue from SQLite:', err);
      return;
    }
  } else {
    if (typeof window !== 'undefined') {
      const localQueueStr = localStorage.getItem('sync_queue') ?? '[]';
      const localQueue = JSON.parse(localQueueStr) as SyncQueueItem[];
      items = localQueue.filter((x) => x.status === 'PENDING' || x.status === 'FAILED');
    }
  }

  if (items.length === 0) return;

  console.log(`[SyncEngine] Processing ${items.length} pending items in sync queue...`);

  for (const item of items) {
    try {
      const payload: unknown = JSON.parse(item.payload);
      
      if (item.action === 'SAVE_MARKS') {
        await trpcClient.marks.saveAllMarks.mutate(payload);
      } else if (item.action === 'CREATE_DIARY') {
        await trpcClient.subjectDiary.create.mutate(payload);
      }
      
      if (isNative()) {
        const db = await getDb();
        const dbRun = db as unknown as { run(query: string, params: unknown[]): Promise<void> };
        await dbRun.run(`DELETE FROM sync_queue WHERE id = ?`, [item.id]);
      } else {
        if (typeof window !== 'undefined') {
          const localQueueStr = localStorage.getItem('sync_queue') ?? '[]';
          const localQueue = JSON.parse(localQueueStr) as SyncQueueItem[];
          const updated = localQueue.filter((x) => x.id !== item.id);
          localStorage.setItem('sync_queue', JSON.stringify(updated));
        }
      }
      console.log(`[SyncEngine] Successfully synced item ${item.id} (${item.action})`);
    } catch (error: unknown) {
      console.error(`[SyncEngine] Sync failed for item ${item.id}:`, error);
      
      if (isNative()) {
        const db = await getDb();
        const dbRun = db as unknown as { run(query: string, params: unknown[]): Promise<void> };
        await dbRun.run(`UPDATE sync_queue SET status = 'FAILED' WHERE id = ?`, [item.id]);
      } else {
        if (typeof window !== 'undefined') {
          const localQueueStr = localStorage.getItem('sync_queue') ?? '[]';
          const localQueue = JSON.parse(localQueueStr) as SyncQueueItem[];
          const target = localQueue.find((x) => x.id === item.id);
          if (target) target.status = 'FAILED';
          localStorage.setItem('sync_queue', JSON.stringify(localQueue));
        }
      }
    }
  }
};

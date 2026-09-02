// src/lib/mobile/offline-cache.ts
import { getDb, isNative } from "./native-service";

export interface CachedDataEnvelope<T> {
  data: T;
  timestamp: string;
}

/**
 * Cache Timetable data locally (SQLite on Android, localStorage on Web)
 */
export const saveCachedTimetable = async (classId: string, data: unknown): Promise<void> => {
  const envelope: CachedDataEnvelope<unknown> = {
    data,
    timestamp: new Date().toISOString(),
  };
  const jsonStr = JSON.stringify(envelope);

  if (isNative()) {
    try {
      const db = await getDb();
      if (db) {
        const dbRun = db as unknown as { run(query: string, params: unknown[]): Promise<void> };
        await dbRun.run(
          `INSERT OR REPLACE INTO timetables (id, classId, data) VALUES (?, ?, ?)`,
          [`timetable_${classId}`, classId, jsonStr]
        );
      }
    } catch (err) {
      console.error("[OfflineCache] Failed to save timetable to SQLite:", err);
    }
  }

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(`offline_timetable_${classId}`, jsonStr);
    } catch (err) {
      console.error("[OfflineCache] Failed to save timetable to localStorage:", err);
    }
  }
};

/**
 * Get Cached Timetable data
 */
export const getCachedTimetable = async <T>(classId: string): Promise<CachedDataEnvelope<T> | null> => {
  if (isNative()) {
    try {
      const db = await getDb();
      if (db) {
        const dbQuery = db as unknown as { query(query: string, params: unknown[]): Promise<{ values?: Array<{ data: string }> }> };
        const res = await dbQuery.query(`SELECT data FROM timetables WHERE id = ?`, [`timetable_${classId}`]);
        if (res.values && res.values.length > 0 && res.values[0]?.data) {
          return JSON.parse(res.values[0].data) as CachedDataEnvelope<T>;
        }
      }
    } catch (err) {
      console.error("[OfflineCache] Failed to read timetable from SQLite:", err);
    }
  }

  if (typeof window !== "undefined") {
    try {
      const item = localStorage.getItem(`offline_timetable_${classId}`);
      if (item) return JSON.parse(item) as CachedDataEnvelope<T>;
    } catch (err) {
      console.error("[OfflineCache] Failed to read timetable from localStorage:", err);
    }
  }

  return null;
};

/**
 * Cache Subject Diary data locally
 */
export const saveCachedDiary = async (classId: string, data: unknown): Promise<void> => {
  const envelope: CachedDataEnvelope<unknown> = {
    data,
    timestamp: new Date().toISOString(),
  };
  const jsonStr = JSON.stringify(envelope);

  if (isNative()) {
    try {
      const db = await getDb();
      if (db) {
        const dbRun = db as unknown as { run(query: string, params: unknown[]): Promise<void> };
        await dbRun.run(
          `INSERT OR REPLACE INTO diary (id, classId, data) VALUES (?, ?, ?)`,
          [`diary_${classId}`, classId, jsonStr]
        );
      }
    } catch (err) {
      console.error("[OfflineCache] Failed to save diary to SQLite:", err);
    }
  }

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(`offline_diary_${classId}`, jsonStr);
    } catch (err) {
      console.error("[OfflineCache] Failed to save diary to localStorage:", err);
    }
  }
};

/**
 * Get Cached Subject Diary data
 */
export const getCachedDiary = async <T>(classId: string): Promise<CachedDataEnvelope<T> | null> => {
  if (isNative()) {
    try {
      const db = await getDb();
      if (db) {
        const dbQuery = db as unknown as { query(query: string, params: unknown[]): Promise<{ values?: Array<{ data: string }> }> };
        const res = await dbQuery.query(`SELECT data FROM diary WHERE id = ?`, [`diary_${classId}`]);
        if (res.values && res.values.length > 0 && res.values[0]?.data) {
          return JSON.parse(res.values[0].data) as CachedDataEnvelope<T>;
        }
      }
    } catch (err) {
      console.error("[OfflineCache] Failed to read diary from SQLite:", err);
    }
  }

  if (typeof window !== "undefined") {
    try {
      const item = localStorage.getItem(`offline_diary_${classId}`);
      if (item) return JSON.parse(item) as CachedDataEnvelope<T>;
    } catch (err) {
      console.error("[OfflineCache] Failed to read diary from localStorage:", err);
    }
  }

  return null;
};

/**
 * Cache Exam Datesheets locally
 */
export const saveCachedDatesheet = async (examId: string, data: unknown): Promise<void> => {
  const envelope: CachedDataEnvelope<unknown> = {
    data,
    timestamp: new Date().toISOString(),
  };
  const jsonStr = JSON.stringify(envelope);

  if (isNative()) {
    try {
      const db = await getDb();
      if (db) {
        const dbRun = db as unknown as { run(query: string, params: unknown[]): Promise<void> };
        await dbRun.run(
          `INSERT OR REPLACE INTO exams (id, examId, data) VALUES (?, ?, ?)`,
          [`datesheet_${examId}`, examId, jsonStr]
        );
      }
    } catch (err) {
      console.error("[OfflineCache] Failed to save datesheet to SQLite:", err);
    }
  }

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(`offline_datesheet_${examId}`, jsonStr);
    } catch (err) {
      console.error("[OfflineCache] Failed to save datesheet to localStorage:", err);
    }
  }
};

/**
 * Get Cached Exam Datesheets
 */
export const getCachedDatesheet = async <T>(examId: string): Promise<CachedDataEnvelope<T> | null> => {
  if (isNative()) {
    try {
      const db = await getDb();
      if (db) {
        const dbQuery = db as unknown as { query(query: string, params: unknown[]): Promise<{ values?: Array<{ data: string }> }> };
        const res = await dbQuery.query(`SELECT data FROM exams WHERE id = ?`, [`datesheet_${examId}`]);
        if (res.values && res.values.length > 0 && res.values[0]?.data) {
          return JSON.parse(res.values[0].data) as CachedDataEnvelope<T>;
        }
      }
    } catch (err) {
      console.error("[OfflineCache] Failed to read datesheet from SQLite:", err);
    }
  }

  if (typeof window !== "undefined") {
    try {
      const item = localStorage.getItem(`offline_datesheet_${examId}`);
      if (item) return JSON.parse(item) as CachedDataEnvelope<T>;
    } catch (err) {
      console.error("[OfflineCache] Failed to read datesheet from localStorage:", err);
    }
  }

  return null;
};

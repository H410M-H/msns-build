import { Capacitor } from '@capacitor/core';

export const isNative = () => typeof window !== 'undefined' && Capacitor.isNativePlatform();

let dbInstance: any = null;
let sqliteConnection: any = null;

export const getSecureItem = async (key: string): Promise<string | null> => {
  if (!isNative()) return typeof window !== 'undefined' ? localStorage.getItem(key) : null;
  try {
    const { Preferences } = await import('@capacitor/preferences');
    const { value } = await Preferences.get({ key });
    return value;
  } catch (err) {
    console.error('Preferences get error:', err);
    return null;
  }
};

export const setSecureItem = async (key: string, value: string): Promise<void> => {
  if (!isNative()) {
    if (typeof window !== 'undefined') localStorage.setItem(key, value);
    return;
  }
  try {
    const { Preferences } = await import('@capacitor/preferences');
    await Preferences.set({ key, value });
  } catch (err) {
    console.error('Preferences set error:', err);
  }
};

export const removeSecureItem = async (key: string): Promise<void> => {
  if (!isNative()) {
    if (typeof window !== 'undefined') localStorage.removeItem(key);
    return;
  }
  try {
    const { Preferences } = await import('@capacitor/preferences');
    await Preferences.remove({ key });
  } catch (err) {
    console.error('Preferences remove error:', err);
  }
};

export const clearPreferences = async (): Promise<void> => {
  if (!isNative()) {
    if (typeof window !== 'undefined') localStorage.clear();
    return;
  }
  try {
    const { Preferences } = await import('@capacitor/preferences');
    await Preferences.clear();
  } catch (err) {
    console.error('Preferences clear error:', err);
  }
};

export const initDb = async () => {
  if (!isNative()) return null;
  if (dbInstance) return dbInstance;

  try {
    const { SQLiteConnection, CapacitorSQLite } = await import('@capacitor-community/sqlite');
    if (!sqliteConnection) {
      sqliteConnection = new SQLiteConnection(CapacitorSQLite);
    }
    const dbName = 'msns_offline_cache';
    const encrypted = true;
    const mode = 'secret';
    const version = 1;

    let secretKey = await getSecureItem('db_secret_key');
    if (!secretKey) {
      secretKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      await setSecureItem('db_secret_key', secretKey);
    }

    dbInstance = await sqliteConnection.createConnection(
      dbName,
      encrypted,
      mode,
      version,
      false
    );

    await dbInstance.open();
    await createOfflineTables(dbInstance);
    return dbInstance;
  } catch (error) {
    console.error('Failed to initialize local SQLite database:', error);
    throw error;
  }
};

export const getDb = async () => {
  if (dbInstance) return dbInstance;
  return initDb();
};

export const clearDb = async () => {
  if (!isNative()) return;
  try {
    const { CapacitorSQLite } = await import('@capacitor-community/sqlite');
    if (dbInstance) {
      await dbInstance.close();
      dbInstance = null;
    }
    const dbName = 'msns_offline_cache';
    await CapacitorSQLite.deleteDatabase({ database: dbName });
  } catch (error) {
    console.error('Failed to clear local SQLite database:', error);
  }
};

const createOfflineTables = async (db: any) => {
  const query = `
    CREATE TABLE IF NOT EXISTS rosters (
      id TEXT PRIMARY KEY,
      studentId TEXT,
      rollNumber TEXT,
      name TEXT,
      classId TEXT,
      data TEXT
    );
    CREATE TABLE IF NOT EXISTS timetables (
      id TEXT PRIMARY KEY,
      classId TEXT,
      data TEXT
    );
    CREATE TABLE IF NOT EXISTS exams (
      id TEXT PRIMARY KEY,
      examId TEXT,
      data TEXT
    );
    CREATE TABLE IF NOT EXISTS diary (
      id TEXT PRIMARY KEY,
      classId TEXT,
      data TEXT
    );
    CREATE TABLE IF NOT EXISTS sync_queue (
      id TEXT PRIMARY KEY,
      action TEXT,
      payload TEXT,
      createdAt TEXT,
      status TEXT
    );
  `;
  await db.execute(query);
};

export const getNetworkStatus = async () => {
  if (!isNative()) return { connected: typeof navigator !== 'undefined' ? navigator.onLine : true, connectionType: 'wifi' };
  try {
    const { Network } = await import('@capacitor/network');
    return Network.getStatus();
  } catch (err) {
    console.error('Network getStatus error:', err);
    return { connected: true, connectionType: 'wifi' };
  }
};

export const onNetworkStatusChange = async (callback: (status: any) => void) => {
  if (!isNative()) {
    if (typeof window !== 'undefined') {
      const onlineHandler = () => callback({ connected: true, connectionType: 'wifi' });
      const offlineHandler = () => callback({ connected: false, connectionType: 'none' });
      window.addEventListener('online', onlineHandler);
      window.addEventListener('offline', offlineHandler);
      return () => {
        window.removeEventListener('online', onlineHandler);
        window.removeEventListener('offline', offlineHandler);
      };
    }
    return () => {};
  }
  try {
    const { Network } = await import('@capacitor/network');
    const handler = await Network.addListener('networkStatusChange', callback);
    return () => {
      handler.remove();
    };
  } catch (err) {
    console.error('Network addListener error:', err);
    return () => {};
  }
};

export const registerPushNotifications = async (
  onToken: (token: string) => void,
  onNotification: (notification: any) => void
) => {
  if (!isNative()) return;
  try {
    const { PushNotifications } = await import('@capacitor/push-notifications');
    let permStatus = await PushNotifications.checkPermissions();
    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }
    if (permStatus.receive !== 'granted') {
      console.warn('Push notification permissions denied');
      return;
    }

    await PushNotifications.register();

    await PushNotifications.addListener('registration', (token) => {
      onToken(token.value);
    });

    await PushNotifications.addListener('registrationError', (err) => {
      console.error('Push notification registration error:', err);
    });

    await PushNotifications.addListener('pushNotificationReceived', (notification) => {
      onNotification(notification);
    });
  } catch (error) {
    console.error('Push notifications init failed:', error);
  }
};

export const capturePhoto = async (): Promise<string | null> => {
  if (!isNative()) {
    alert('Camera capture is only supported on mobile devices.');
    return null;
  }
  try {
    const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
    const photo = await Camera.getPhoto({
      quality: 70,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera
    });
    return photo.base64String || null;
  } catch (error) {
    console.error('Camera capture failed:', error);
    return null;
  }
};

export const scanBarcode = async (): Promise<string | null> => {
  if (!isNative()) {
    alert('Barcode scanning is only supported on mobile devices.');
    return null;
  }
  try {
    const { BarcodeScanner } = await import('@capacitor-mlkit/barcode-scanning');
    const perm = await BarcodeScanner.requestPermissions();
    if (perm.camera !== 'granted') {
      console.warn('Camera permission for barcode scanning denied');
      return null;
    }
    const { barcodes } = await BarcodeScanner.scan({});
    if (barcodes.length > 0) {
      return barcodes[0]?.rawValue || null;
    }
    return null;
  } catch (error) {
    console.error('Barcode scanning failed:', error);
    return null;
  }
};

export const clearAllMobileState = async (): Promise<void> => {
  try {
    await clearDb();
    await clearPreferences();
  } catch (error) {
    console.error('Failed during mobile state cleanup:', error);
  }
};

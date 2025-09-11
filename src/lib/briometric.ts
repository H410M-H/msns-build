import biometricAuth from 'biometric-auth';

export interface BiometricCapture {
  template: string;
  image?: string;
  quality: number;
  deviceId: string;
}

export class BiometricService {
  private static instance: BiometricService;


  public static getInstance(): BiometricService {
    if (!BiometricService.instance) {
      BiometricService.instance = new BiometricService();
    }
    return BiometricService.instance;
  }

  
  async initialize(): Promise<boolean> {
    try {
      const isSupported = biometricAuth.isSupported();
      if (!isSupported) {
        console.warn('Biometric authentication not supported on this platform');
        return false;
      }

      console.log('Biometric auth version:', biometricAuth.getVersion());
      return true;
    } catch (error) {
      console.error('Failed to initialize biometric service:', error);
      return false;
    }
  }

  async listDevices(): Promise<any[]> {
    try {
      return await biometricAuth.listDevices();
    } catch (error) {
      console.error('Failed to list devices:', error);
      return [];
    }
  }

  async captureFingerprint(): Promise<BiometricCapture> {
    try {
      console.log('Starting fingerprint capture...');

      const result = await biometricAuth.capture({
        timeout: 30000,
        qualityThreshold: 60,
        retryCount: 3
      });

      // Get device info
      const devices = await this.listDevices();
      const defaultDevice = await biometricAuth.getDefaultDevice();
      const deviceId = defaultDevice?.id || devices[0]?.id || 'unknown';

      console.log('Fingerprint captured successfully. Quality:', result.quality);

      return {
        template: result.template,
        image: result.image,
        quality: result.quality,
        deviceId
      };
    } catch (error) {
      console.error('Fingerprint capture failed:', error);
      throw new Error(`Capture failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async enrollFingerprint(): Promise<BiometricCapture> {
    try {
      console.log('Starting fingerprint enrollment...');

      const result = await biometricAuth.enroll({
        timeout: 40000,
        qualityThreshold: 70, // Higher threshold for enrollment
        retryCount: 2
      });

      const devices = await this.listDevices();
      const defaultDevice = await biometricAuth.getDefaultDevice();
      const deviceId = defaultDevice?.id || devices[0]?.id || 'unknown';

      console.log('Fingerprint enrolled successfully. Quality:', result.quality);

      return {
        template: result.template,
        image: result.image,
        quality: result.quality,
        deviceId
      };
    } catch (error) {
      console.error('Fingerprint enrollment failed:', error);
      throw new Error(`Enrollment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async verifyFingerprint(storedTemplate: string): Promise<boolean> {
    try {
      console.log('Starting fingerprint verification...');

      const result = await biometricAuth.verify(storedTemplate, {
        timeout: 20000,
        qualityThreshold: 50,
        retryCount: 2
      });

      console.log('Verification result:', result);
      return result;
    } catch (error) {
      console.error('Fingerprint verification failed:', error);
      throw new Error(`Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async isBiometricSupported(): Promise<boolean> {
    return biometricAuth.isSupported();
  }

  async getDeviceInfo(): Promise<{ id: string; name: string; type: string } | null> {
    try {
      const defaultDevice = await biometricAuth.getDefaultDevice();
      return defaultDevice ? {
        id: defaultDevice.id,
        name: defaultDevice.name,
        type: defaultDevice.type
      } : null;
    } catch (error) {
      console.error('Failed to get device info:', error);
      return null;
    }
  }
}
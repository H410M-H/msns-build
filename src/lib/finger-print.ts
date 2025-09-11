import fprint from "fprint";

export class FingerprintService {
  private static instance: FingerprintService;
  private device: FingerprintDeviceProps | null = null;

  public static getInstance(): FingerprintService {
    if (!FingerprintService.instance) {
      FingerprintService.instance = new FingerprintService();
    }
    return FingerprintService.instance;
  }

  async initialize(): Promise<boolean> {
    try {
      console.log("Discovering fingerprint devices...");
      const devices: FingerprintDeviceProps[] = await fprint.discoverDevices();

      if (devices.length === 0) {
        console.warn("No fingerprint devices found");
        return false;
      }

      this.device = devices[0] ?? null;
      console.log("Found device:", this.device?.name);

      await this.device!.open();
      console.log("Fingerprint device initialized successfully");

      return true;
    } catch (error) {
      console.error("Failed to initialize fingerprint device:", error);
      return false;
    }
  }

  async captureFingerprint(): Promise<{ template: string; quality: number }> {
    if (!this.device) {
      throw new Error("Fingerprint device not initialized");
    }

    console.log("Waiting for fingerprint...");

    try {
      const result: CaptureResultProps = await this.device.capture({
        timeout: 30000,
        waitForFinger: true,
        qualityThreshold: 50, // Minimum quality threshold
      });

      if (!result.template) {
        throw new Error("Failed to capture fingerprint template");
      }

      // Convert template to base64 for storage
      const templateBase64 = Buffer.from(result.template).toString("base64");
      const quality = result.quality ?? 0;

      console.log("Fingerprint captured successfully. Quality:", quality);

      return { template: templateBase64, quality };
    } catch (error) {
      console.error("Fingerprint capture failed:", error);
      throw new Error("Fingerprint capture failed. Please try again.");
    }
  }
  async verify(): Promise<string> {
    if (!this.device) {
      throw new Error("Fingerprint device not initialized");
    }

    console.log("Please place your finger for verification...");

    try {
      const result: CaptureResultProps = await this.device.capture({
        timeout: 15000,
        waitForFinger: true,
      });

      if (!result.template) {
        throw new Error("No template captured");
      }

      const currentTemplate = Buffer.from(result.template).toString("base64");
      return currentTemplate;
    } catch (error) {
      console.error("Verification failed:", error);
      throw new Error("Fingerprint verification failed. Please try again.");
    }
  }

  async close(): Promise<void> {
    if (this.device) {
      await this.device.close();
      this.device = null;
      console.log("Fingerprint device closed");
    }
  }

  isDeviceAvailable(): boolean {
    return this.device !== null;
  }

  getDeviceInfo(): { id: string; name: string } | null {
    return this.device ? { id: this.device.id, name: this.device.name } : null;
  }
}

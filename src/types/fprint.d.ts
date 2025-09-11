declare module 'fprint' {
  export interface Device {
    id: string;
    name: string;
    open(): Promise<void>;
    close(): Promise<void>;
    capture(options?: CaptureOptions): Promise<CaptureResult>;
  }

  export interface CaptureOptions {
    timeout?: number;
    waitForFinger?: boolean;
    qualityThreshold?: number;
  }

  export interface CaptureResult {
    template?: Uint8Array;
    image?: Uint8Array;
    quality?: number;
  }

  const fprint: {
    discoverDevices(): Promise<Device[]>;
    // Add other methods if available
  };
  
  export default fprint;
}
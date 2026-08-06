import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.msns.lms',
  appName: 'MSNS LMS',
  webDir: 'public',
  server: {
    // Live LMS production server domain
    url: 'https://lms.msns.edu.pk',
    cleartext: true,
    androidScheme: 'https'
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#020806',
      showSpinner: true,
      androidSpinnerStyle: 'large',
      spinnerColor: '#10b981'
    }
  }
};

export default config;

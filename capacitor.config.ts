import type { CapacitorConfig } from '@capacitor/cli';

const isProduction = process.env.NODE_ENV === 'production';

const config: CapacitorConfig = {
  appId: 'com.msns.lms',
  appName: 'MSNS LMS',
  webDir: 'public',
  server: {
    // Live LMS production server domain
    url: 'https://lms.msns.edu.pk',
    cleartext: !isProduction,
    androidScheme: 'https'
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: !isProduction
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#020806',
      showSpinner: true,
      androidSpinnerStyle: 'large',
      spinnerColor: '#10b981'
    },
    CapacitorSQLite: {
      iosIsEncryption: true,
      iosBiometric: {
        biometricAuth: true,
        biometricTitle: "MSNS Secure Cache Unlock"
      },
      androidIsEncryption: true,
      androidBiometric: {
        biometricAuth: true,
        biometricTitle: "MSNS Secure Cache Unlock",
        biometricSubTitle: "Please verify biometrics to decrypt offline roster data"
      }
    }
  }
};

export default config;


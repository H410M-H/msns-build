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
      launchShowDuration: 0,
      launchAutoHide: true,
      backgroundColor: '#020806',
      showSpinner: false
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


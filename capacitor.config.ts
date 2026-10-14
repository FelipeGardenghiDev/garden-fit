import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'dev.gardenghi.gardenfit',
  appName: 'GardenFit',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  android: {
    backgroundColor: '#020617'
  }
};

export default config;

/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
declare module 'react-native-android-wifi' {
  interface WifiNetwork {
    SSID: string;
    BSSID: string;
    capabilities: string;
    frequency: number;
    level: number;
    timestamp: number;
  }

  function loadWifiList(
    successCallback: (wifiStringList: string) => void,
    errorCallback: (error: any) => void,
  ): void;

  // Correct export for CommonJS-style modules
  const wifi: {
    loadWifiList: typeof loadWifiList;
  };

  export = wifi;
}

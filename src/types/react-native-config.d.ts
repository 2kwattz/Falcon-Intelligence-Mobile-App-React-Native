declare module 'react-native-config' {
  export interface NativeConfig {
    API_BASE_URL?: string;
    WEBSOCKET_URL?: string;
    USE_MOCK_API?: string;
    USE_MOCK_WEBSOCKET?: string;
    REFERRAL_REQUEST_EMAIL?: string;
    MOCK_LOGIN_EMAIL?: string;
    MOCK_LOGIN_PASSWORD?: string;
  }

  const Config: NativeConfig;
  export default Config;
}

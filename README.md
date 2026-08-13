# Falcon Intelligence

Falcon Intelligence is a React Native CLI aviation operations app for aircraft tracking, RTL-SDR telemetry, flight alerts, system health, and ephemeral operator chat. It is a native Android/iOS project—Expo is not used.

The current build uses realistic mock data while keeping REST, authentication, storage, maps, and WebSocket logic behind service boundaries that can be connected to the live Falcon backend later.

## Stack

- React Native CLI 0.83 and TypeScript
- React Navigation native stack and four-tab bottom navigator
- Axios with centralized JWT injection and normalized errors
- AsyncStorage for the operator JWT and profile
- MapLibre with EOxCloudless Sentinel-2 imagery for satellite aircraft maps
- `react-native-safe-area-context` for device insets
- React Native Animated and SVG for the radar experience
- Native WebSocket API behind a mockable service
- No Redux

## Requirements

- Node.js 20.19.4 or newer
- JDK 17
- Android Studio with an Android SDK and a running emulator or connected device
- macOS with Xcode and CocoaPods for iOS builds

## Install and run on Android

Install JavaScript dependencies:

```bash
npm install
```

The checked-in `.npmrc` prevents npm from installing the vector-icon packages' optional Expo compatibility peers. All runtime peer dependencies required by this React Native CLI app are declared directly in `package.json`.

Start Metro in one terminal:

```bash
npm start
```

Build and install the app from another terminal:

```bash
npm run android
```

The generated debug APK is located at `android/app/build/outputs/apk/debug/app-debug.apk`.

### Low system-disk workaround

This workstation's system partition has limited free space. Keep Gradle's large native-build cache on the project drive when building locally:

```bash
GRADLE_USER_HOME="$PWD/.gradle-user-home" \
TMPDIR="$PWD/.gradle-tmp" \
npm run android
```

Both cache directories are ignored by Git.

## Run on iOS

On macOS, install the native pods once:

```bash
cd ios
bundle install
bundle exec pod install
cd ..
```

Then start Metro and run the app:

```bash
npm start
npm run ios
```

## Mock login

The login form is prefilled from `MOCK_LOGIN_EMAIL` and `MOCK_LOGIN_PASSWORD` in the local `.env` while mock APIs are enabled. Any valid email address and any password containing at least six characters are accepted by the mock authentication service.

The animated splash runs its five-second cinematic sequence while the stored session is restored. A saved JWT goes directly to the dashboard; logout deletes the session and returns to the authentication stack.

AsyncStorage keys:

- `@falcon_intelligence/auth_token`
- `@falcon_intelligence/auth_user`

## Environment configuration

Copy `.env.example` to `.env` before running or building the application, then replace the placeholders with values for the target environment:

```bash
cp .env.example .env
```

The local `.env` is ignored by Git. It supplies the API and WebSocket endpoints, mock-mode flags, referral-request email address, and development-only mock login values through `react-native-config`.

Environment values in a mobile application are compiled into the APK/IPA and can be extracted by an end user. Never place private API secrets, signing passwords, service-account credentials, or privileged tokens in `.env`; keep those on a trusted backend or in the release pipeline's secret store.

## Validation

```bash
npm run typecheck
npx react-native config
npm run doctor
```

Build Android without installing it:

```bash
cd android
GRADLE_USER_HOME="$PWD/../.gradle-user-home" \
TMPDIR="$PWD/../.gradle-tmp" \
./gradlew assembleDebug --no-daemon --max-workers=2
```

Do not run `npm audit fix --force` blindly: forced npm remediations can introduce incompatible major-version changes. Review each advisory before upgrading native dependencies.

## Project layout

```text
android/        Native Android project
ios/            Native iOS project
src/
  apis/         Axios client, typed endpoints, and mock JSON data
  assets/       Images, icons, and animation assets
  components/   Reusable visual building blocks
  constants/    Theme tokens and runtime configuration
  context/      Authentication provider
  hooks/        Dashboard, aircraft, auth, and WebSocket state
  navigation/   Root, authentication, and four-tab navigation
  screens/      Every full-page app screen
  services/     AsyncStorage and WebSocket boundaries
  types/        Shared domain contracts
  utils/        Validation and formatting helpers
```

## Connect the real APIs

Runtime networking is loaded from `.env` and exposed through `src/constants/config.ts`:

```dotenv
API_BASE_URL=https://api.example.com
WEBSOCKET_URL=wss://api.example.com/ws/chat
USE_MOCK_API=false
USE_MOCK_WEBSOCKET=false
```

Set `USE_MOCK_API` to `false` after the placeholder endpoint paths under `src/apis/` match the backend. `apiClient.ts` already adds `Authorization: Bearer <token>`, applies a timeout, sends JSON headers, and normalizes common errors. Tokens are never logged.

OpenSky traffic is routed through `aircraftApi.ts`. A server-side proxy is recommended so third-party credentials are not shipped inside the mobile application. Local SDR and OpenSky observations are merged by ICAO24, with the local observation taking precedence.

The Indian Air Force Database reads `GET /api/aircraft/indian-air-force`. The endpoint returns a JSON array using this contract:

```json
[
  {
    "id": "iaf-1",
    "aircraftName": "HAL Tejas Mk1",
    "modeSHex": "8001CA",
    "operator": "Indian Air Force",
    "lastTracked": "2026-07-22T10:30:00.000Z",
    "registration": "LA-5031"
  }
]
```

The endpoint path is configurable as `INDIAN_AIR_FORCE_DATABASE_PATH` in `src/constants/config.ts`. While `USE_MOCK_API` is enabled, the page displays representative local records instead.

## Location-based weather

The dashboard asks for foreground location access and retrieves current weather directly from the keyless Open-Meteo Forecast API. Weather remains live even while the rest of the application uses mock API data. The request includes the device latitude and longitude and retrieves temperature, WMO condition code, visibility, wind, pressure, sunrise, and sunset.

Android declares coarse and fine location permissions in `android/app/src/main/AndroidManifest.xml`. iOS uses `NSLocationWhenInUseUsageDescription` in `ios/FalconIntelligence/Info.plist`. If access is denied, the Weather panel leaves the rest of the dashboard available and offers retry and app-settings actions.

Open-Meteo endpoint configuration lives in `OPEN_METEO_FORECAST_URL` under `src/constants/config.ts`. Keep the visible Open-Meteo attribution when changing the Weather panel.

## Connect the real WebSocket

Update `WEBSOCKET_URL` and set `USE_MOCK_WEBSOCKET` to `false` in `src/constants/config.ts`. Adapt frame parsing in `src/services/websocketService.ts` if the server payload differs from the `ChatMessage` contract.

Chat messages only live in component memory. They are not written to AsyncStorage, a database, the mock API, or any other persistence layer. The socket and listeners are closed on unmount and logout.

## Maps and HTTP configuration

Satellite maps use the public EOxCloudless 2025 WMTS through MapLibre, so no Google Maps key or paid map account is needed. EOxCloudless attribution remains visible on the map as required by the imagery license. The hosted imagery is free for non-commercial use; review EOX's current license before commercial distribution.

The supplied Falcon server address uses plain HTTP. The React Native Android build configuration resolves the manifest placeholder to permit cleartext traffic in debug builds; release builds do not. Move the production REST and WebSocket endpoints to HTTPS/WSS before releasing the app.

## Replace the logo

Place the official logo under `src/assets/images/`, then replace the vector placeholder rendered by `src/components/LogoMark.tsx`. Production launcher icons and the native launch artwork live under `android/app/src/main/res/` and `ios/FalconIntelligence/`.

## Key integration points

- Mock data: `src/apis/mockData.ts`
- REST endpoint adapters: `src/apis/*.ts`
- JWT request interceptor: `src/apis/apiClient.ts`
- WebSocket lifecycle and payload parsing: `src/services/websocketService.ts`
- Design palette: `src/constants/colors.ts`
- Bottom tabs: `src/navigation/MainTabNavigator.tsx`

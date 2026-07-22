import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '@/constants/colors';
import { ForgotPasswordScreen } from '@/screens/ForgotPasswordScreen';
import { LoginScreen } from '@/screens/LoginScreen';
import { ReferralAccessScreen } from '@/screens/ReferralAccessScreen';
import { AuthStackParamList } from './navigationTypes';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.background },
      headerTintColor: colors.text,
      headerShadowVisible: false,
      contentStyle: { backgroundColor: colors.background },
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Account Recovery' }} />
    <Stack.Screen name="ReferralAccess" component={ReferralAccessScreen} options={{ title: 'Referral Access' }} />
  </Stack.Navigator>
);

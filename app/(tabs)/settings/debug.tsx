import { Redirect } from 'expo-router';

export default function SettingsDebugRoute() {
  return <Redirect href={'/debug' as never} />;
}

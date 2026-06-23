import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_700Bold,
  useFonts,
  PlusJakartaSans_600SemiBold,
} from "@expo-google-fonts/plus-jakarta-sans";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    regular: PlusJakartaSans_400Regular,
    bold: PlusJakartaSans_700Bold,
    medium: PlusJakartaSans_600SemiBold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="add-task" />
    </Stack>
  );
}

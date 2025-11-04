import NetworkMonitor from "@/components/NetworkMonitor";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import GlobalActionToast from "../components/GlobalActionToast";
import ToastContainer from "../components/ToastContainer";

export default function StackLayout() {
  SplashScreen.preventAutoHideAsync();

  const [loaded] = useFonts({
    b: require("../assets/fonts/Lato-Bold.ttf"),
    r: require("../assets/fonts/Lato-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null; // or <Loading />
  }
  return (
    <NetworkMonitor>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>

      {/* Global Toast Container - must be at root level */}
      <ToastContainer />

      {/* Global Action Toast */}
      <GlobalActionToast />
    </NetworkMonitor>
  );
}
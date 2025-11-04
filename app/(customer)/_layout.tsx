import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Dimensions, View } from "react-native";

export default function CustomerLayout() {
  const { width } = Dimensions.get("window");
  const isMobileSize = width < 450;

  return (
    <View style={{
      width: isMobileSize ? "100%" : "40%",
      flex: 1,
      backgroundColor: "#ffffffff",
      alignSelf: "center"
    }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#28aefbff",
          tabBarInactiveTintColor: "#ffffffff",
          tabBarStyle: {
            backgroundColor: "#252525",
            borderTopLeftRadius: 60,
            borderTopRightRadius: 60,
            width: "80%",
            alignSelf: "center"
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={isMobileSize ? 22 : 28} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="queue"
          options={{
            href: null,
            tabBarStyle: { display: "none" },
          }}
        />
        <Tabs.Screen
          name="account"
          options={{
            title: "Account",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={isMobileSize ? 22 : 28} color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
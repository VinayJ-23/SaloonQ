import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Dimensions, View } from "react-native";

export default function BarberLayout() {
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
          name="barber_home"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => (
              <Ionicons name="home" size={isMobileSize ? 22 : 30} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="barber_queue"
          options={{
            title: "Queue",
            tabBarIcon: ({ color }) => (
              <View style={{ transform: [{ rotate: '45deg' }] }}>
                <Ionicons name="grid" size={isMobileSize ? 20 : 28} color={color} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color }) => (
              <Ionicons name="person" size={isMobileSize ? 20 : 28} color={color} />
            ),
          }}
        />
      </Tabs>
    </View>

  );
}
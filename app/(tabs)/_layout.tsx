import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { colors } from "../../src/styles/theme";

export default function TabLayout() {
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.secondary,   
        tabBarInactiveTintColor: colors.textTertiary, 
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Nueva Receta",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={50} name="fork.knife" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

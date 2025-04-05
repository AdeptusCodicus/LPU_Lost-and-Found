import { Tabs } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import Header from "@/components/Header";

export default function TabLayout() {
  const { isAdmin } = useAuth();

  return (
    <>
      <Header />
      <Tabs
        screenOptions={({ route }) => ({
          tabBarActiveTintColor: "#e91e63",
          headerShown: false,
          tabBarIcon: ({ color, size }) => {
            let iconName = "home";
            if (route.name === "report") iconName = "add-circle-outline";
            if (route.name === "admin-reports") iconName = "document-text-outline";
            if (route.name === "admin-add") iconName = "add-circle";
            if (route.name === "missing") iconName = "search";

            return <Ionicons name={iconName as any} size={size} color={color} />;
          },
        })}
      >
        {isAdmin ? (
          <>
            <Tabs.Screen name="missing" options={{ title: "Missing Items" }} />
            <Tabs.Screen name="admin-reports" options={{ title: "Reports" }} />
            <Tabs.Screen name="admin-add" options={{ title: "Add Item" }} />
          </>
        ) : (
          <>
            <Tabs.Screen name="missing" options={{ title: "Missing Items" }} />
            <Tabs.Screen name="report" options={{ title: "Report Missing" }} />
          </>
        )}
      </Tabs>
    </>
  );
}

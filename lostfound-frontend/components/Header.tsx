import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Header() {
  const router = useRouter();

  return (
    <View style={{
      backgroundColor: "#800000",
      padding: 20,
      paddingTop: 50,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center"
    }}>
      <Text style={{ color: "white", fontSize: 20, fontWeight: "bold" }}>
        LPU Lost&Found
      </Text>
      <TouchableOpacity onPress={() => router.push("/settings")}>
        <Ionicons name="menu" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

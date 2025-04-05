import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, ScrollView } from "react-native";
import { API_URL } from "@/config/api";

export default function ReportScreen() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    location: "",
    contact: "",
  });

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.description || !form.location || !form.contact) {
      Alert.alert("Please fill in all fields.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        Alert.alert("Report submitted successfully!");
        setForm({ name: "", description: "", location: "", contact: "" });
      } else {
        Alert.alert("Error submitting report.");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Network error.");
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>Report a Missing Item</Text>

      {Object.entries(form).map(([key, val]) => (
        <TextInput
          key={key}
          placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
          value={val}
          onChangeText={(text) => handleChange(key as keyof typeof form, text)}
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            padding: 10,
            marginBottom: 10,
            borderRadius: 8,
          }}
        />
      ))}

      <Button title="Submit Report" onPress={handleSubmit} />
    </ScrollView>
  );
}

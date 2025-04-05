import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, ScrollView } from "react-native";
import { API_URL } from "@/config/api";

export default function AdminAddScreen() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    location: "",
    contact: "",
    date_lost: "",
  });

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.description || !form.location || !form.contact || !form.date_lost) {
      Alert.alert("All fields are required.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        Alert.alert("Item added successfully!");
        setForm({ name: "", description: "", location: "", contact: "", date_lost: "" });
      } else {
        Alert.alert("Failed to add item.");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Network error.");
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>Add New Item</Text>

      {Object.entries(form).map(([key, val]) => (
        <TextInput
          key={key}
          placeholder={key.replace("_", " ").toUpperCase()}
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

      <Button title="Add Item" onPress={handleSubmit} />
    </ScrollView>
  );
}

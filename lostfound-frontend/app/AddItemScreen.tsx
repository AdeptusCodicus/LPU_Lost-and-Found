import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Alert } from "react-native";
import { API_URL } from "../config/api";

const AddItemScreen: React.FC = () => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    location: "",
    contact: "",
    date_lost: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    fetch(`${API_URL}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then(res => res.json())
      .then(data => {
        Alert.alert("Success", data.message);
        setForm({ name: "", description: "", location: "", contact: "", date_lost: "" });
      })
      .catch(err => Alert.alert("Error", "Could not submit item."));
  };

  return (
    <View style={styles.container}>
      {["name", "description", "location", "contact", "date_lost"].map(field => (
        <TextInput
          key={field}
          style={styles.input}
          placeholder={field.replace("_", " ")}
          value={form[field as keyof typeof form]}
          onChangeText={value => handleChange(field, value)}
        />
      ))}
      <Button title="Submit" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
  },
});

export default AddItemScreen;

import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface ItemProps {
  item: {
    id: number;
    name: string;
    description: string;
    location: string;
    contact: string;
    date_lost: string;
  };
}

const ItemCard: React.FC<ItemProps> = ({ item }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{item.name}</Text>
      <Text>{item.description}</Text>
      <Text>📍 {item.location}</Text>
      <Text>📞 {item.contact}</Text>
      <Text>📅 {item.date_lost}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    margin: 10,
    padding: 15,
    borderRadius: 10,
    elevation: 3,
  },
  name: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 5,
  },
});

export default ItemCard;

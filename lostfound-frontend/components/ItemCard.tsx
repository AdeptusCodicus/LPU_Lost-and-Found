// ItemCard.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

// Define the types for props
interface ItemCardProps {
  id: number;
  name: string;
  description: string;
  location: string;
  contact: string;
  date_lost: string;
}

const ItemCard: React.FC<ItemCardProps> = ({
  id,
  name,
  description,
  location,
  contact,
  date_lost,
}) => {
  return (
    <TouchableOpacity style={styles.cardContainer}>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{name}</Text>
        <Text style={styles.cardDescription}>{description}</Text>
        <Text style={styles.cardLocation}>Location: {location}</Text>
        <Text style={styles.cardContact}>Contact: {contact}</Text>
        <Text style={styles.cardDate}>Date Lost: {date_lost}</Text>
      </View>
    </TouchableOpacity>
  );
};

// Add styles for responsiveness
const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#fff",
    padding: 10,
    marginVertical: 10,
    borderRadius: 8,
    elevation: 5, // For shadow effect on Android
    shadowColor: "#000", // Shadow effect for iOS
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  cardContent: {
    padding: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  cardDescription: {
    marginTop: 5,
    fontSize: 14,
    color: "#555",
  },
  cardLocation: {
    marginTop: 5,
    fontSize: 12,
    color: "#888",
  },
  cardContact: {
    marginTop: 5,
    fontSize: 12,
    color: "#888",
  },
  cardDate: {
    marginTop: 5,
    fontSize: 12,
    color: "#888",
  },
});

export default ItemCard;

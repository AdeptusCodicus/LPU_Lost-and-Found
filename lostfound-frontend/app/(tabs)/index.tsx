import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import ItemCard from "@/components/ItemCard";
import { API_URL } from "@/config/api";

interface Item {
  id: number;
  name: string;
  description: string;
  location: string;
  contact: string;
  date_lost: string;
}

const HomeScreen: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        console.log("Attempting to fetch items from:", `http://192.168.100.158:3000/items`);
        
        const response = await fetch(`http://192.168.100.158:3000/items`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        console.log("Received data:", data);
        
        if (Array.isArray(data)) {
          setItems(data);
        } else if (data.items && Array.isArray(data.items)) {
          setItems(data.items);
        } else {
          throw new Error('Invalid data format received');
        }
      } catch (err) {
        console.error("Error details:", {
          message: err instanceof Error ? err.message : 'Unknown error',
          stack: err instanceof Error ? err.stack : undefined
        });
        
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {items.length > 0 ? (
        items.map(item => (
          <ItemCard key={item.id} item={item} />
        ))
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No items found</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default HomeScreen;
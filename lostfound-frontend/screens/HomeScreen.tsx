import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
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

  useEffect(() => {
    fetch(`${API_URL}/items`)
      .then(res => res.json())
      .then(data => {
        setItems(data.items);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 100 }} />;

  return (
    <ScrollView>
      {items.length > 0 ? (
        items.map(item => <ItemCard key={item.id} item={item} />)
      ) : (
        <Text style={{ textAlign: "center", marginTop: 50 }}>No items found</Text>
      )}
    </ScrollView>
  );
};

export default HomeScreen;

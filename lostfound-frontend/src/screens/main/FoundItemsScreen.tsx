import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity, ScrollView } from 'react-native';
import { Text, Card, ActivityIndicator, Modal, Portal, Button, Divider } from 'react-native-paper';
import apiClient from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

interface FoundItem {
  id: number | string;
  name: string;
  description: string;
  location: string;
  contact?: string;
  date_found: string;
  status: string;
}

interface FoundItemsScreenProps {
  searchQuery: string;
}

const FoundItemsScreen: React.FC<FoundItemsScreenProps> = ({ searchQuery }) => {
  const { user } = useAuth();
  const [allItems, setAllItems] = useState<FoundItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedItem, setSelectedItem] = useState<FoundItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const showModal = (item: FoundItem) => {
    setSelectedItem(item);
    setModalVisible(true);
  };
  const hideModal = () => {
    setModalVisible(false);
    setSelectedItem(null);
  };

  const fetchFoundItems = async () => {
    if (!user) {
        setError("Authentication required to view items.");
        setIsLoading(false);
        setRefreshing(false);
        return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<{ items: FoundItem[] }>('/found-items');
      setAllItems(response.data.items || []);
    } catch (err: any) {
      console.error("Failed to fetch found items:", err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to load found items. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFoundItems();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchFoundItems();
  }, []);

  const filteredItems = useMemo(() => {
    if (!searchQuery) {
      return allItems;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return allItems.filter(item =>
      item.name.toLowerCase().includes(lowercasedQuery) ||
      item.description.toLowerCase().includes(lowercasedQuery) ||
      item.location.toLowerCase().includes(lowercasedQuery)
    );
  }, [allItems, searchQuery]);

  const renderItem = ({ item }: { item: FoundItem }) => (
    <TouchableOpacity onPress={() => showModal(item)}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
          <Text variant="bodySmall" style={styles.cardSubtitle}>Location: {item.location}</Text>
          <Text variant="bodySmall" style={styles.cardSubtitle}>Date: {new Date(item.date_found).toLocaleDateString()}</Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  if (isLoading && !refreshing && allItems.length === 0) {
    return <ActivityIndicator animating={true} color="#800000" style={styles.loader} size="large" />;
  }

  if (error) {
    return <View style={styles.container}><Text style={styles.errorText}>{error}</Text></View>;
  }

  if (!isLoading && filteredItems.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>
          {searchQuery ? 'No items match your search.' : 'No found items reported yet.'}
        </Text>
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#800000"]} />
        }
      />
      <Portal>
        <Modal visible={modalVisible} onDismiss={hideModal} contentContainerStyle={styles.modalContainer}>
          {selectedItem && (
            <ScrollView>
              <Text variant="headlineSmall" style={styles.modalTitle}>{selectedItem.name}</Text>
              <Divider style={styles.divider} />

              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Description:</Text>
                <Text style={styles.modalValue}>{selectedItem.description}</Text>
              </View>

              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Location Found:</Text>
                <Text style={styles.modalValue}>{selectedItem.location}</Text>
              </View>

              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Date Found:</Text>
                <Text style={styles.modalValue}>{new Date(selectedItem.date_found).toLocaleDateString()}</Text>
              </View>

              {selectedItem.contact && (
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Contact Info:</Text>
                  <Text style={styles.modalValue}>{selectedItem.contact}</Text>
                </View>
              )}

              {selectedItem.status && (
                <View style={styles.modalRow}>
                  <Text style={styles.statusLabel}>Status:</Text>
                  <Text style={styles.statusValue}>
                    {selectedItem.status.charAt(0).toUpperCase() + selectedItem.status.slice(1)}
                  </Text>
                </View>
              )}

              <Button mode="contained" onPress={hideModal} style={styles.modalButton} buttonColor="#800000">
                Close
              </Button>
            </ScrollView>
          )}
        </Modal>
      </Portal>
    </>
  );
};

const styles = StyleSheet.create({
  listContainer: { 
    flexGrow: 1,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  container: { 
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginBottom: 12,
    elevation: 3,
  },
  cardTitle: {
    fontWeight: 'bold',
    color: '#800000',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#555',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#777',
  },
  errorText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'red',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: 'center',
    color: '#800000',
  },
  modalRow: { 
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  modalLabel: { 
    fontSize: 16,
    lineHeight: 24,
    color: '#800000',
    fontWeight: 'bold', 
    marginRight: 5, 
  },
  modalValue: { 
    fontSize: 16,
    lineHeight: 24,
    color: '#000000', 
    flex: 1, 
  },
  statusLabel: { 
    fontSize: 16,
    lineHeight: 24,
    color: '#800000',
    fontWeight: 'bold',
    marginRight: 5,
  },
  statusValue: { 
    fontSize: 16,
    lineHeight: 24,
    color: 'green',
    fontWeight: 'bold',
    flex: 1,
  },
  divider: {
    marginVertical: 10,
  },
  modalButton: {
    marginTop: 20,
  }
});

export default FoundItemsScreen;
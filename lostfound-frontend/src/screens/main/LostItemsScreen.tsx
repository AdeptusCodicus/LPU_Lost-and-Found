import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity, ScrollView } from 'react-native';
import { Text, Card, ActivityIndicator, Modal, Portal, Button, Divider } from 'react-native-paper';
import apiClient from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

interface LostItem {
  id: number | string;
  name: string;
  description: string;
  location: string; // Last seen location
  contact?: string;
  owner?: string; // Email of the owner
  date_lost: string;
  status: string;
  // Add any other fields that might come from the backend
  user_id?: number;
  image_url?: string;
}

interface LostItemsScreenProps {
  searchQuery: string;
}

const LostItemsScreen: React.FC<LostItemsScreenProps> = ({ searchQuery }) => {
  const { user } = useAuth();
  const [allItems, setAllItems] = useState<LostItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // State for Modal
  const [selectedItem, setSelectedItem] = useState<LostItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const showModal = (item: LostItem) => {
    setSelectedItem(item);
    setModalVisible(true);
  };
  const hideModal = () => {
    setModalVisible(false);
    setSelectedItem(null);
  };

  const fetchLostItems = async () => {
    if (!user) {
        setError("Authentication required to view items.");
        setIsLoading(false);
        setRefreshing(false);
        return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<{ items: LostItem[] }>('/lost-items');
      setAllItems(response.data.items || []);
    } catch (err: any) {
      console.error("Failed to fetch lost items:", err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to load lost items. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchLostItems();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLostItems();
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

  const renderItem = ({ item }: { item: LostItem }) => (
    <TouchableOpacity onPress={() => showModal(item)}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
          <Text variant="bodySmall" style={styles.cardSubtitle}>Last Seen: {item.location}</Text>
          <Text variant="bodySmall" style={styles.cardSubtitle}>Date Lost: {new Date(item.date_lost).toLocaleDateString()}</Text>
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
          {searchQuery ? 'No items match your search.' : 'No lost items reported yet.'}
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
                <Text style={styles.modalLabel}>Last Seen At:</Text>
                <Text style={styles.modalValue}>{selectedItem.location}</Text>
              </View>

              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Date Lost:</Text>
                <Text style={styles.modalValue}>{new Date(selectedItem.date_lost).toLocaleDateString()}</Text>
              </View>

              {selectedItem.contact && (
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Contact Info:</Text>
                  <Text style={styles.modalValue}>{selectedItem.contact}</Text>
                </View>
              )}

              {selectedItem.owner && ( // Assuming owner label is maroon, value is black
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Reported by:</Text>
                  <Text style={styles.modalValue}>{selectedItem.owner}</Text>
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
  container: { // General container for error/empty states
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
  // Modal Styles
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
  modalText: {
    marginBottom: 10,
    fontSize: 16,
    lineHeight: 24,
  },
  statusText: {
    color: 'green',
    fontWeight: 'bold', // Optional: make it bold
  },
  divider: {
    marginVertical: 10,
  },
  modalButton: {
    marginTop: 20,
  }
});

export default LostItemsScreen;
import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity, ScrollView } from 'react-native';
import { Text, Card, ActivityIndicator, Chip, Button, Modal, Portal, Divider, Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import apiClient from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#800000',
    accent: '#800000',
  },
};
interface ReportItem {
  id: number | string;
  name: string;
  description: string;
  location: string;
  contact?: string;
  date_reported: string;
  type: 'found' | 'lost';
  status: 'pending' | 'approved' | 'rejected';
  user_email?: string; 
  reporterID?: number;
}

const MyReportsScreen = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const showModal = (item: ReportItem) => {
    setSelectedReport(item);
    setModalVisible(true);
  };
  const hideModal = () => {
    setModalVisible(false);
    setSelectedReport(null);
  };

  const fetchMyReports = async () => {
    if (!user) {
      setError("Authentication required to view your reports.");
      setIsLoading(false);
      setRefreshing(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<{ reports: ReportItem[]; message?: string }>('/user/my-reports');
      if (response.data.reports) {
        setReports(response.data.reports);
      } else {
        setReports([]);
      }
    } catch (err: any) {
      console.error("Failed to fetch user reports:", err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to load your reports. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMyReports();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMyReports();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return '#4CAF50';
      case 'pending':
        return '#FFC107'; 
      case 'rejected':
        return '#F44336'; 
      default:
        return '#757575'; 
    }
  };

  const renderItem = ({ item }: { item: ReportItem }) => (
    <PaperProvider theme={theme}>
      <TouchableOpacity onPress={() => showModal(item)}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
            <View style={styles.row}>
              <Text variant="bodyMedium" style={styles.label}>Type:</Text>
              <Chip
                icon={item.type === 'found' ? "magnify-plus-outline" : "magnify-minus-outline"}
                style={[styles.chip, { backgroundColor: item.type === 'found' ? '#BBDEFB' : '#FFCDD2' }]}
                textStyle={styles.chipText}
              >
                {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
              </Chip>
            </View>
            <View style={styles.row}>
              <Text variant="bodyMedium" style={styles.label}>Status:</Text>
              <Chip
                style={[styles.chip, { backgroundColor: getStatusColor(item.status) }]}
                textStyle={styles.chipText}
              >
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Chip>
            </View>
            <Text variant="bodySmall" style={styles.dateText}>
              Reported on: {new Date(item.date_reported).toLocaleDateString()}
            </Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    </PaperProvider>  
  );

  if (isLoading && !refreshing && reports.length === 0) {
    return <ActivityIndicator animating={true} color="#800000" style={styles.loader} size="large" />;
  }

  if (error) {
    return <View style={styles.container}><Text style={styles.errorText}>{error}</Text></View>;
  }

  if (!isLoading && reports.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>You haven't submitted any reports yet.</Text>
        <Button mode="outlined" onPress={onRefresh} style={{marginTop: 10}} textColor="#800000">Refresh</Button>
      </View>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <FlatList
        data={reports}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#800000"]} />
        }
      />
      <Portal>
        <Modal visible={modalVisible} onDismiss={hideModal} contentContainerStyle={styles.modalContainer}>
          {selectedReport && (
            <ScrollView>
              <Text variant="headlineSmall" style={styles.modalTitle}>{selectedReport.name}</Text>
              <Divider style={styles.divider} />

              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Description:</Text>
                <Text style={styles.modalValue}>{selectedReport.description}</Text>
              </View>

              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Location:</Text>
                <Text style={styles.modalValue}>{selectedReport.location}</Text>
              </View>

              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Date Reported:</Text>
                <Text style={styles.modalValue}>{new Date(selectedReport.date_reported).toLocaleDateString()}</Text>
              </View>

              {selectedReport.contact && (
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Contact Info:</Text>
                  <Text style={styles.modalValue}>{selectedReport.contact}</Text>
                </View>
              )}
              
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Type:</Text>
                <Text style={styles.modalValue}>{selectedReport.type.charAt(0).toUpperCase() + selectedReport.type.slice(1)}</Text>
              </View>

              <View style={styles.modalRow}>
                <Text style={styles.statusLabelModal}>Status:</Text>
                <Text style={[styles.statusValueModal, { color: getStatusColor(selectedReport.status) }]}>
                  {selectedReport.status.charAt(0).toUpperCase() + selectedReport.status.slice(1)}
                </Text>
              </View>

              <Button mode="contained" onPress={hideModal} style={styles.modalButton} buttonColor="#800000">
                Close
              </Button>
            </ScrollView>
          )}
        </Modal>
      </Portal>
    </PaperProvider>
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
    padding: 20,
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
    color: '#800000',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    marginRight: 8,
    color: '#333',
  },
  chip: {
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 13,
    color: '#000000',
  },
  dateText: {
    color: '#757575',
    marginTop: 8,
    textAlign: 'right',
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
    marginRight: 8, 
    width: '40%', 
  },
  modalValue: {
    fontSize: 16,
    lineHeight: 24,
    color: '#000000',
    flex: 1, 
  },
  statusLabelModal: { 
    fontSize: 16,
    lineHeight: 24,
    color: '#800000',
    fontWeight: 'bold',
    marginRight: 8,
    width: '40%',
  },
  statusValueModal: { 
    fontSize: 16,
    lineHeight: 24,
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

export default MyReportsScreen;
import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
// Make sure Text is imported, Title and Paragraph can be removed if no longer used elsewhere
import { Text, Card, ActivityIndicator, Chip, Button } from 'react-native-paper';
import apiClient from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

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
        return '#4CAF50'; // Green
      case 'pending':
        return '#FFC107'; // Amber
      case 'rejected':
        return '#F44336'; // Red
      default:
        return '#757575'; // Grey
    }
  };

  const renderItem = ({ item }: { item: ReportItem }) => (
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
  );

  if (isLoading && !refreshing && reports.length === 0) {
    return <ActivityIndicator animating={true} color="#800000" style={styles.loader} size="large" />;
  }

  if (error) {
    // Ensure Text is used here too if it was Paragraph/Title before
    return <View style={styles.container}><Text style={styles.errorText}>{error}</Text></View>;
  }

  if (!isLoading && reports.length === 0) {
    // Ensure Text is used here too
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>You haven't submitted any reports yet.</Text>
        <Button mode="outlined" onPress={onRefresh} style={{marginTop: 10}} textColor="#800000">Refresh</Button>
      </View>
    );
  }

  return (
    <FlatList
      data={reports}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.listContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#800000"]} />
      }
    />
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
  cardTitle: { // Style for the item name Text
    // fontSize: 18, // variant="titleMedium" will handle this
    // fontWeight: 'bold', // variant="titleMedium" will handle this
    color: '#800000',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: { // Style for "Type:" and "Status:" Text
    marginRight: 8,
    // fontSize: 15, // variant="bodyMedium" will handle this
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
  dateText: { // Style for "Reported on:" Text
    // fontSize: 12, // variant="bodySmall" will handle this
    color: '#757575',
    marginTop: 8,
    textAlign: 'right',
  },
  emptyText: { // Style for empty state message
    textAlign: 'center',
    fontSize: 16, // You can keep this or use a Text variant
    color: '#777',
  },
  errorText: { // Style for error message
    textAlign: 'center',
    fontSize: 16, // You can keep this or use a Text variant
    color: 'red',
  },
});

export default MyReportsScreen;
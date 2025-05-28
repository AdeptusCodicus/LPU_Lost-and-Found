import React, { useState, useCallback } from 'react';
import { ScrollView, StyleSheet, View, Alert, LayoutChangeEvent, RefreshControl } from 'react-native'; // Add RefreshControl
import {
  TextInput,
  Button,
  Text,
  ActivityIndicator,
  Menu,
  Divider,
  HelperText,
  Provider as PaperProvider,
  DefaultTheme,
} from 'react-native-paper';
import { DatePickerModal } from 'react-native-paper-dates';
import apiClient from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#800000',
    accent: '#800000',
  },
  roundness: DefaultTheme.roundness,
};

const ReportItemScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [contact, setContact] = useState('');
  const [dateReported, setDateReported] = useState<Date | undefined>(undefined);
  const [itemType, setItemType] = useState<'found' | 'lost' | ''>('');

  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [typeMenuVisible, setTypeMenuVisible] = useState(false);
  const [typeMenuAnchorWidth, setTypeMenuAnchorWidth] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [refreshing, setRefreshing] = useState(false);

  const { user } = useAuth();

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    
    setName('');
    setDescription('');
    setLocation('');
    setContact('');
    setDateReported(undefined); 
    setItemType(''); 
    
    setErrors({});
    setSubmitMessage(null);
    
    setOpenDatePicker(false);
    setTypeMenuVisible(false);
    
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const parseDisplayDate = (dateString: string | undefined | null): string => {
    if (!dateString) return 'N/A';
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; 
      const day = parseInt(parts[2], 10);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        return new Date(year, month, day).toLocaleDateString();
      }
    }
    return new Date(dateString).toLocaleDateString();
  };

  const onDismissDatePicker = useCallback(() => {
    setOpenDatePicker(false);
  }, [setOpenDatePicker]);

  const onConfirmDatePicker = useCallback(
    (params: { date: Date | undefined }) => {
      setOpenDatePicker(false);
      setDateReported(params.date);
      if (params.date) setErrors(prev => ({ ...prev, dateReported: '' }));
    },
    [setOpenDatePicker, setDateReported]
  );

  const openTypeMenu = () => setTypeMenuVisible(true);
  const closeTypeMenu = () => setTypeMenuVisible(false);

  const selectItemType = (type: 'found' | 'lost') => {
    setItemType(type);
    setErrors(prev => ({ ...prev, itemType: '' }));
    closeTypeMenu();
  };

  const onTypeMenuLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setTypeMenuAnchorWidth(width);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Item name is required.';
    if (!description.trim()) newErrors.description = 'Description is required.';
    if (!location.trim()) newErrors.location = 'Location is required.';
    if (!contact.trim()) newErrors.contact = 'Contact information is required.';
    if (!dateReported) newErrors.dateReported = 'Date is required.';
    if (!itemType) newErrors.itemType = 'Item type (Found/Lost) is required.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setSubmitMessage(null);
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      let formattedDateReported = '';
      if (dateReported) {
        const year = dateReported.getFullYear();
        const month = (dateReported.getMonth() + 1).toString().padStart(2, '0'); 
        const day = dateReported.getDate().toString().padStart(2, '0');
        formattedDateReported = `${year}-${month}-${day}`;
      }

      const payload = {
        name,
        description,
        location,
        contact,
        date_reported: formattedDateReported, 
        type: itemType,
      };

      const response = await apiClient.post('/user/report', payload);
      
      setSubmitMessage({ type: 'success', text: response.data.message || 'Report submitted successfully!' });
      setName('');
      setDescription('');
      setLocation('');
      setContact('');
      setDateReported(undefined);
      setItemType('');
      setErrors({});
      Alert.alert("Success", response.data.message || "Report submitted successfully!");

    } catch (error: any) {
      console.error("Failed to submit report:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.error || 'Failed to submit report. Please try again.';
      setSubmitMessage({ type: 'error', text: errorMessage });
      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PaperProvider theme={theme}>
      <ScrollView 
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]} 
            tintColor={theme.colors.primary} 
            title="Pull to refresh" 
            titleColor={theme.colors.primary} 
          />
        }
      >
        <Text variant="headlineMedium" style={styles.title}>Report an Item</Text>

        {submitMessage && (
          <Text style={submitMessage.type === 'success' ? styles.successText : styles.errorText}>
            {submitMessage.text}
          </Text>
        )}

        <TextInput
          label="Item Name"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
          error={!!errors.name}
          disabled={refreshing} 
          onBlur={() => { if(name.trim()) setErrors(prev => ({ ...prev, name: '' }))}}
        />
        {errors.name && <HelperText type="error" visible={!!errors.name}>{errors.name}</HelperText>}

        <TextInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          mode="outlined"
          style={styles.input}
          multiline
          numberOfLines={3}
          error={!!errors.description}
          disabled={refreshing} 
          onBlur={() => { if(description.trim()) setErrors(prev => ({ ...prev, description: '' }))}}
        />
        {errors.description && <HelperText type="error" visible={!!errors.description}>{errors.description}</HelperText>}

        <TextInput
          label="Location (e.g., Library, Canteen)"
          value={location}
          onChangeText={setLocation}
          mode="outlined"
          style={styles.input}
          error={!!errors.location}
          disabled={refreshing} 
          onBlur={() => { if(location.trim()) setErrors(prev => ({ ...prev, location: '' }))}}
        />
        {errors.location && <HelperText type="error" visible={!!errors.location}>{errors.location}</HelperText>}

        <TextInput
          label="Your Contact Info (Phone or Email)"
          value={contact}
          onChangeText={setContact}
          mode="outlined"
          style={styles.input}
          keyboardType="default" 
          error={!!errors.contact}
          disabled={refreshing} 
          onBlur={() => { if(contact.trim()) setErrors(prev => ({ ...prev, contact: '' }))}}
        />
        {errors.contact && <HelperText type="error" visible={!!errors.contact}>{errors.contact}</HelperText>}
        
        <Button
          icon="calendar"
          mode="outlined"
          onPress={() => setOpenDatePicker(true)}
          style={styles.input}
          textColor={errors.dateReported ? styles.errorColor.color : theme.colors.primary}
          uppercase={false}
          contentStyle={styles.buttonContent}
          disabled={refreshing} 
        >
          {dateReported ? dateReported.toLocaleDateString() : 'Select Date Reported'}
        </Button>
        {errors.dateReported && <HelperText type="error" visible={!!errors.dateReported}>{errors.dateReported}</HelperText>}

        <DatePickerModal
          locale="en"
          mode="single"
          visible={openDatePicker}
          onDismiss={onDismissDatePicker}
          date={dateReported}
          onConfirm={onConfirmDatePicker}
        />

        <View onLayout={onTypeMenuLayout}>
          <Menu
            visible={typeMenuVisible}
            onDismiss={closeTypeMenu}
            anchor={
              <Button
                mode="outlined"
                onPress={openTypeMenu}
                style={styles.input}
                icon="chevron-down"
                textColor={errors.itemType ? styles.errorColor.color : theme.colors.primary}
                uppercase={false}
                contentStyle={styles.buttonContent}
                disabled={refreshing}
              >
                {itemType ? (itemType === 'found' ? 'Found Item' : 'Lost Item') : 'Select Item Type'}
              </Button>
            }
            style={{ marginTop: -50 }}
            contentStyle={{ width: typeMenuAnchorWidth }}
          >
            <Menu.Item onPress={() => selectItemType('found')} title="Found Item" />
            <Divider />
            <Menu.Item onPress={() => selectItemType('lost')} title="Lost Item" />
          </Menu>
        </View>
        {errors.itemType && <HelperText type="error" visible={!!errors.itemType}>{errors.itemType}</HelperText>}

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={isLoading}
          disabled={isLoading || refreshing} 
          style={styles.button}
          buttonColor={theme.colors.primary}
        >
          {isLoading ? 'Submitting...' : 'Submit Report'}
        </Button>
      </ScrollView>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
    color: '#800000',
  },
  input: {
    marginBottom: 10,
  },
  buttonContent: { 
    justifyContent: 'center',
  },
  button: {
    marginTop: 20,
    paddingVertical: 8,
  },
  successText: {
    color: 'green',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorColor: { 
    color: 'rgb(176, 0, 32)', 
  }
});

export default ReportItemScreen;
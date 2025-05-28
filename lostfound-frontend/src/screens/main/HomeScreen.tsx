import React, { useState } from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useAuth } from '../../contexts/AuthContext';
import { Searchbar } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import SafeAreaView from '../../components/CustomSafeAreaView';

import FoundItemsScreen from './FoundItemsScreen';
import LostItemsScreen from './LostItemsScreen';

const Tab = createMaterialTopTabNavigator();

export type HomeTabParamList = {
  FoundItems: undefined;
  LostItems: undefined;
};

const HomeScreen = () => {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const onChangeSearch = (query: string) => setSearchQuery(query);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search items..."
          onChangeText={onChangeSearch}
          value={searchQuery}
          style={styles.searchbar}
          elevation={1}
        />
      </View>

      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#800000',
          tabBarInactiveTintColor: 'gray',
          tabBarIndicatorStyle: {
            backgroundColor: '#800000',
          },
          tabBarLabelStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Tab.Screen name="FoundItems" options={{ title: 'Found Items' }}>
          {(props) => <FoundItemsScreen {...props} searchQuery={searchQuery} />}
        </Tab.Screen>
        <Tab.Screen name="LostItems" options={{ title: 'Lost Items' }}>
          {(props) => <LostItemsScreen {...props} searchQuery={searchQuery} />}
        </Tab.Screen>
      </Tab.Navigator>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff', 
  },
  searchContainer: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#fff', 
  },
  searchbar: {
    marginTop: -30,
  },
});

export default HomeScreen;
import React, { useState } from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useAuth } from '../../contexts/AuthContext';
import { Searchbar, Appbar } from 'react-native-paper'; // Appbar removed for simplicity, can be added back
import { SafeAreaView, StyleSheet, View } from 'react-native';

import FoundItemsScreen from './FoundItemsScreen';
import LostItemsScreen from './LostItemsScreen';

const Tab = createMaterialTopTabNavigator();

// Define ParamList for the HomeTabs if you plan to pass params via navigation
// For now, searchQuery is passed as a direct prop, so this might not be strictly needed for that.
export type HomeTabParamList = {
  FoundItems: undefined;
  LostItems: undefined;
};

const HomeScreen = () => {
  const { user, logout } = useAuth(); // user and logout might be used for an Appbar or profile features
  const [searchQuery, setSearchQuery] = useState('');

  const onChangeSearch = (query: string) => setSearchQuery(query);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/*
      // Optional Appbar Header - You can add this back if needed
      <Appbar.Header>
        <Appbar.Content title={`Welcome, ${user?.username || 'User'}`} />
        <Appbar.Action icon="logout" onPress={logout} />
      </Appbar.Header>
      */}

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
    backgroundColor: '#fff', // Or your app's primary background color
  },
  searchContainer: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#fff', // Or a color that fits your theme
  },
  searchbar: {
    // You can add custom styles to the searchbar if needed
    // e.g., borderRadius: 25,
  },
});

export default HomeScreen;
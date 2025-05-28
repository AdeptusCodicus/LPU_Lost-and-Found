import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/main/HomeScreen';
import ReportItemScreen from '../screens/main/ReportItemScreen';
import MyReportsScreen from '../screens/main/MyReportsScreen';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export type AppTabParamList = {
    Home: undefined;
    Report: undefined;
    MyReports: undefined;
    Account: undefined;
};

const Tab = createBottomTabNavigator<AppTabParamList>();

const AppNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: string = 'alert-circle-outline';

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Report') {
                        iconName = focused ? 'plus-circle' : 'plus-circle-outline';
                    } else if (route.name === 'MyReports') {
                        iconName = focused ? 'format-list-bulleted' : 'format-list-bulleted-type';
                    } else if (route.name === 'Account') {
                        iconName = focused ? 'account-circle' : 'account-circle-outline';
                    }
                    return <MaterialCommunityIcons name={iconName} size={size} color={color} />
                },
                tabBarActiveTintColor: '#800000',
                tabBarInactiveTintColor: 'gray',
                headerShown: true,
                headerStyle: {
                    backgroundColor: '#800000',
                },
                headerTintColor: 'white',
            })}>
                <Tab.Screen name ="Home" component={HomeScreen} />
                <Tab.Screen name ="Report" component={ReportItemScreen} />
                <Tab.Screen name ="MyReports" component={MyReportsScreen} />
                <Tab.Screen name ="Account" component={HomeScreen} />
            </Tab.Navigator>
    );
};

export default AppNavigator;
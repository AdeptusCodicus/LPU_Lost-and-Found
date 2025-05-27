import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';

const Tab = createBottomTabNavigator();

const PlaceholderAppScreen = ({ route }) => {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 20 }}>{route.name} Screen (App)</Text>
        </View>
    )
};

const AppNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerStyle: {
                    backgroundColor: '#800000',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
                tabBarActiveBackgroundColor: '#800000',
                tabBarActiveTintColor: 'gray',
                   /* tabBarIcon: ({ focused, color, size }) => {
                        let iconName;
                        if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
                        else if (route.name === 'Report') iconName = focused ? 'add-circle' : 'add-circle-outline';
                        return <Ionicons name={iconName} size={size} color={color}/>;
                    }; */
            })}>
                <Tab.Screen name="Home" component={PlaceholderAppScreen}/>
                <Tab.Screen name="Report" component={PlaceholderAppScreen}/>
                <Tab.Screen name="My Reports" component={PlaceholderAppScreen}/>
                <Tab.Screen name="Account" component={PlaceholderAppScreen}/>
            </Tab.Navigator>
    );
};

export default AppNavigator;
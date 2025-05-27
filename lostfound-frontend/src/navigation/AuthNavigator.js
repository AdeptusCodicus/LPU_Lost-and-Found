import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/auth/LoginScreen';
import { Text, View } from 'react-native';

const PlaceholderAuthScreen = ({ route }) => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text style={{ fontSize: 20 }}>{route.name} Screen (Auth)</Text>
    </View>
);

const Stack = createStackNavigator();

const AuthNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen}/>
            <Stack.Screen name="Register" component={PlaceholderAuthScreen}/>
        </Stack.Navigator>
    );
};

export default AuthNavigator;
import React from 'react';
import { NavigationContainer  } from '@react-navigation/native';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import { useAuth } from '../contexts/AuthContext';

const RootNavigator = () => {
    const { token, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={StyleSheet.loadingContainer}>
                <ActivityIndicator size="large" color="#800000"/>
            </View>
        );
    }

    return (
        <NavigationContainer>
            {token ? <AppNavigator /> : <AuthNavigator />}
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff'
    }
});

export default RootNavigator;
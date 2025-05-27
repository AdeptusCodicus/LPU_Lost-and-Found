import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth

const HomeScreen = () => {
  const { logout, user } = useAuth(); // Get logout function and user

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Home Screen</Text>
      {user && <Text variant="bodyLarge">Welcome, {user.email}!</Text>}
      <Button
        mode="outlined"
        onPress={logout}
        style={styles.button}
        textColor="#800000" // Example primary color
      >
        Logout
      </Button>
    </View>
  );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    button: {
        marginTop: 20,
        borderColor: '#800000'
    }
});

export default HomeScreen;
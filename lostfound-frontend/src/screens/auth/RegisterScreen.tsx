import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Text, Button, TextInput, ActivityIndicator, HelperText } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext'; // We might add a register function here later
import apiClient from '../../services/api'; // For direct API call
import { useNavigation } from '@react-navigation/native';
import { AuthStackParamList } from '../../navigation/AuthNavigator'; // To type navigation
import { StackNavigationProp } from '@react-navigation/stack';

type RegisterScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;

const RegisterScreen = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  // const { register, isLoading: authIsLoading } = useAuth(); // If register func is in AuthContext
  const [isLoading, setIsLoading] = useState(false); // Local loading state for registration

  const [username, setUsername] = useState(''); // Or whatever your backend requires
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const customFocusedColor = '#800000'; // Maroon

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    // Basic email validation (you might want a more robust one)
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    // Password strength (example: at least 6 characters)
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      // Adjust the payload and endpoint to match your backend's registration API
      const response = await apiClient.post('/auth/register', {
        username, // Or firstName, lastName, etc.
        email,
        password,
      });

      // Handle successful registration
      // response.data might contain the new user or a success message
      console.log('Registration successful:', response.data);
      setSuccessMessage('Registration successful! Please login.');
      // Optionally, navigate to login or auto-login
      setTimeout(() => {
         navigation.navigate('Login');
      }, 2000); // Navigate after 2 seconds

    } catch (err: any) {
      const apiErrorMessage = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      setError(apiErrorMessage);
      console.error("Registration error details:", err.response?.data || err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text variant="headlineMedium" style={styles.title}>Create Account</Text>

          <TextInput
            label="Username" // Or Full Name, etc.
            value={username}
            onChangeText={setUsername}
            style={styles.input}
            mode="outlined"
            disabled={isLoading}
            activeOutlineColor={customFocusedColor}
            autoCapitalize="none"
          />
          <TextInput
            label="LPU Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            mode="outlined"
            disabled={isLoading}
            activeOutlineColor={customFocusedColor}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            mode="outlined"
            disabled={isLoading}
            activeOutlineColor={customFocusedColor}
          />
          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            style={styles.input}
            mode="outlined"
            disabled={isLoading}
            activeOutlineColor={customFocusedColor}
          />

          {error ? <HelperText type="error" visible={!!error} style={styles.errorText}>{error}</HelperText> : null}
          {successMessage ? <HelperText type="info" visible={!!successMessage} style={styles.successText}>{successMessage}</HelperText> : null}

          {isLoading ? (
            <ActivityIndicator animating={true} color="#800000" style={styles.buttonActivity} />
          ) : (
            <Button
              mode="contained"
              onPress={handleRegister}
              style={styles.button}
              buttonColor={customFocusedColor}
            >
              Register
            </Button>
          )}

          <Button
            mode="text"
            onPress={() => navigation.navigate('Login')}
            style={styles.loginLink}
            textColor={customFocusedColor}
            disabled={isLoading}
          >
            Already have an account? Login
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1, // Ensures content can scroll if it overflows
    justifyContent: 'center',
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    marginBottom: 20, // Adjusted margin
    color: '#333',
  },
  input: {
    width: '100%',
    marginBottom: 10, // Adjusted margin
  },
  button: {
    width: '100%',
    paddingVertical: 8,
    marginTop: 15, // Adjusted margin
    borderRadius: 8,
  },
  buttonActivity: {
    width: '100%',
    paddingVertical: 20,
    marginTop: 15,
  },
  errorText: {
    // color: 'red', // HelperText handles color by type
    marginBottom: 5,
    textAlign: 'center',
    width: '100%',
  },
  successText: {
    // color: 'green', // HelperText handles color by type
    marginBottom: 5,
    textAlign: 'center',
    width: '100%',
  },
  loginLink: {
    marginTop: 20,
  }
});

export default RegisterScreen;
import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { Text, Button, TextInput, ActivityIndicator, HelperText } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import apiClient from '../../services/api';

const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const customFocusedColor = '#800000';

  const handleRequestReset = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setSuccessMessage('');
    setIsLoading(true);
    try {
      // Replace with your actual endpoint for requesting password reset
      await apiClient.post('/auth/request-password-reset', { email });
      setSuccessMessage('If an account exists for this email, a password reset link has been sent.');
      setEmail(''); // Clear email field
    } catch (err: any) {
      // Avoid revealing if an email exists or not for security reasons
      // So, show a generic success message even on error, or a very generic error.
      // For now, let's assume the backend handles this gracefully.
      console.error("Request password reset error:", err.response?.data || err.message);
      setSuccessMessage('If an account exists for this email, a password reset link has been sent.');
      // setError('Failed to send reset link. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text variant="headlineMedium" style={styles.title}>Forgot Password</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Enter your email address and we'll send you a link to reset your password.
        </Text>
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
        {error && <HelperText type="error" visible={!!error}>{error}</HelperText>}
        {successMessage && <HelperText type="info" visible={!!successMessage}>{successMessage}</HelperText>}
        {isLoading ? (
          <ActivityIndicator animating={true} color={customFocusedColor} style={styles.buttonActivity} />
        ) : (
          <Button
            mode="contained"
            onPress={handleRequestReset}
            style={styles.button}
            buttonColor={customFocusedColor}
            disabled={!!successMessage} // Disable after success
          >
            Send Reset Link
          </Button>
        )}
        <Button
          mode="text"
          onPress={() => navigation.goBack()} // Or navigation.navigate('Login')
          style={styles.backLink}
          textColor={customFocusedColor}
          disabled={isLoading}
        >
          Back to Login
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { marginBottom: 10, color: '#333' },
  subtitle: { marginBottom: 20, textAlign: 'center', color: '#555' },
  input: { width: '100%', marginBottom: 15 },
  button: { width: '100%', paddingVertical: 8, marginTop: 10, borderRadius: 8 },
  buttonActivity: { width: '100%', paddingVertical: 20, marginTop: 10 },
  backLink: { marginTop: 20 },
});

export default ForgotPasswordScreen;
import React, { useState} from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, TextInput, ActivityIndicator } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';

const LoginScreen = () => {
  const { login, isLoading: authIsLoading } = useAuth(); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); 
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const customFocusedColor = '#800000';

  const handleLogin = async () => {
    if (!email || !password) {
      setError("email and password are required.");
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError('Login failed. Please check your credentials.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Login</Text>
      <TextInput
        label="LPU Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        mode="outlined"
        disabled={isSubmitting || authIsLoading}
        activeOutlineColor={customFocusedColor}
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        mode="outlined"
        disabled={isSubmitting || authIsLoading}
        activeOutlineColor={customFocusedColor}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {(isSubmitting || authIsLoading) ? (
        <ActivityIndicator animating={true} color="#800000" style={styles.button} />
      ) : (
        <Button
          mode="contained"
          onPress={handleLogin}
          style={styles.button}
          buttonColor="#800000" 
        >
          Login
        </Button>
      )}
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
  title: {
    marginBottom: 20,
  },
  input: {
    width: '100%',
    marginBottom: 15,
  },
  button: {
    width: '100%',
    paddingVertical: 8,
    marginTop: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  }
});

export default LoginScreen;
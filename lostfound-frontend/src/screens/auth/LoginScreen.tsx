import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { Text, Button, TextInput, ActivityIndicator } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack'; 
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { login, isLoading: authIsLoading } = useAuth(); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); 
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const customFocusedColor = '#800000';
  const [showPassword, setShowPassword] = useState(false);
  
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  const handleLogin = async () => {
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError('Login failed. Please check your credentials.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
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
            secureTextEntry={!showPassword}
            style={styles.input}
            mode="outlined"
            disabled={isSubmitting || authIsLoading}
            activeOutlineColor={customFocusedColor}
            right={<TextInput.Icon icon={showPassword ? "eye-off" : "eye"} onPress={toggleShowPassword} />}
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
        <Button
            mode="text"
            onPress={() => navigation.navigate('Register')}
            style={styles.registerLink}
            textColor="#800000"
            disabled={isSubmitting || authIsLoading}
        >
            Don't have an account? Sign Up
        </Button>
        </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff'
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    marginBottom: 30,
    color: '#333',
  },
  input: {
    width: '100%',
    marginBottom: 15,
  },
  button: {
    width: '100%',
    paddingVertical: 8,
    marginTop: 10,
    borderRadius: 8,
  },
  buttonActivity: {
    width: '100%',
    paddingVertical: 20,
    marginTop: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
    width: '100%',
  },
  registerLink: {
    marginTop: 20,
  }
});

export default LoginScreen;
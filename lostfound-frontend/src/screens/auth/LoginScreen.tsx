import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { Text, Button, TextInput, ActivityIndicator, HelperText } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { login, isLoading: authIsLoading, authError, clearAuthError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const customFocusedColor = '#800000';
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setFormError('');
      // authError from context is no longer cleared here.
      // It's cleared before a new login attempt in handleLogin.
    });
    return unsubscribe;
  }, [navigation]); // Dependencies updated

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async () => {
    setFormError('');
    if (authError) {
      clearAuthError();
    }

    if (!email || !password) {
      setFormError("Email and password are required.");
      return;
    }

    setIsSubmitting(true);
    await login(email, password);
    setIsSubmitting(false);
  };

  const displayError = authError || formError;

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
             disabled={isSubmitting || authIsLoading} // Use authIsLoading from context
             activeOutlineColor={customFocusedColor}
             keyboardType="email-address"
             autoCapitalize="none"
         />
         <TextInput
             label="Password"
             value={password}
             onChangeText={setPassword}
             secureTextEntry={!showPassword}
             style={styles.input}
             mode="outlined"
             disabled={isSubmitting || authIsLoading} // Use authIsLoading from context
             activeOutlineColor={customFocusedColor}
             right={<TextInput.Icon icon={showPassword ? "eye-off" : "eye"} onPress={toggleShowPassword} />}
         />

        <View style={styles.forgotPasswordContainer}>
          <Button
            mode="text"
            onPress={() => navigation.navigate('ForgotPassword')}
            compact
            disabled={isSubmitting || authIsLoading}
            labelStyle={styles.forgotPasswordLabel}
          >
            Forgot Password?
          </Button>
        </View>

        {/* Display error message: authError from context or local formError */}
        {displayError ? (
            <HelperText type="error" visible={!!displayError} style={styles.errorText}>
              {displayError}
            </HelperText>
        ) : null}

        {/* Show ActivityIndicator if AuthContext is loading */}
        {(authIsLoading) ? ( // Primarily rely on authIsLoading from context
            <ActivityIndicator animating={true} color="#800000" style={styles.buttonActivity} />
        ) : (
            <Button
            mode="contained"
            onPress={handleLogin}
            style={styles.button}
            buttonColor="#800000"
            disabled={isSubmitting} // Can also add authIsLoading here if needed
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
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { marginBottom: 30, color: '#333' },
  input: { width: '100%', marginBottom: 10 },
  forgotPasswordContainer: {
     width: '100%',
     alignItems: 'flex-end',
     marginBottom: 10,
  },
  forgotPasswordLabel: {
     fontSize: 14,
     color: '#800000',
  },
  errorText: { // Make sure this style is visible
     marginBottom: 10,
     textAlign: 'center',
     width: '100%',
     // color: 'red', // HelperText type="error" should handle this
     fontSize: 14,
  },
  button: { width: '100%', paddingVertical: 8, marginTop: 5, borderRadius: 8 },
  buttonActivity: { width: '100%', paddingVertical: 20, marginTop: 5 }, // Ensure this has enough height
  registerLink: { marginTop: 15 }
});

export default LoginScreen;
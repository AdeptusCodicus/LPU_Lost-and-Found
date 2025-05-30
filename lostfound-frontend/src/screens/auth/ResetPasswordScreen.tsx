import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button, TextInput, ActivityIndicator, HelperText } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import apiClient from '../../services/api';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import SafeAreaView from '../../components/CustomSafeAreaView';

type ResetPasswordScreenRouteProp = RouteProp<AuthStackParamList, 'ResetPassword'>;
type ResetPasswordScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'ResetPassword'>;


const ResetPasswordScreen = () => {
  const navigation = useNavigation<ResetPasswordScreenNavigationProp>();
  const route = useRoute<ResetPasswordScreenRouteProp>();

  const [token, setToken] = useState('');
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState(''); 
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const customFocusedColor = '#800000';

  useEffect(() => {
    if (route.params?.token && route.params?.email) {
      setToken(route.params.token);
      setEmail(route.params.email); 
      console.log(`ResetPasswordScreen: Token: ${route.params.token}, Email: ${route.params.email}`);
    } else {
      setError('Invalid or missing reset link parameters. Please request a new reset link.');
      console.warn("ResetPasswordScreen: Token or email not found in route params.");
    }
  }, [route.params?.token, route.params?.email]);

  const handleResetPassword = async () => {
    if (!token || !email) { 
      setError('Reset link parameters are missing. Please use the link from your email.');
      return;
    }
    if (!password || !confirmPassword) {
      setError('Please enter and confirm your new password.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
    }

    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const resetUrl = `/auth/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
      console.log('Attempting to reset password with URL:', resetUrl);

      await apiClient.post(
        resetUrl, 
        { newPassword: password } 
      );

      setSuccessMessage('Your password has been reset successfully! You can now log in.');
      setPassword('');
      setConfirmPassword('');
      Alert.alert(
        "Password Reset Successful",
        "You can now log in with your new password.",
        [{ text: "OK", onPress: () => navigation.navigate('Login') }]
      );
    } catch (err: any) {
      const apiErrorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to reset password. The link may be invalid or expired.';
      setError(apiErrorMessage);
      console.error("Reset password error:", err.response?.data || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text variant="headlineMedium" style={styles.title}>Reset Password</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Enter your new password below.
        </Text>

        {email && <Text style={styles.emailDisplay}>Resetting password for: {email}</Text>}

        <TextInput
          label="New Password"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          mode="outlined"
          secureTextEntry={!showPassword}
          disabled={isLoading || !!successMessage}
          activeOutlineColor={customFocusedColor}
          right={<TextInput.Icon icon={showPassword ? "eye-off" : "eye"} onPress={() => setShowPassword(!showPassword)} />}
        />
        <TextInput
          label="Confirm New Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={styles.input}
          mode="outlined"
          secureTextEntry={!showConfirmPassword}
          disabled={isLoading || !!successMessage}
          activeOutlineColor={customFocusedColor}
          right={<TextInput.Icon icon={showConfirmPassword ? "eye-off" : "eye"} onPress={() => setShowConfirmPassword(!showConfirmPassword)} />}
        />

        {error && <HelperText type="error" visible={!!error} style={styles.messageText}>{error}</HelperText>}
        {successMessage && <HelperText type="info" visible={!!successMessage} style={styles.messageText}>{successMessage}</HelperText>}

        {isLoading ? (
          <ActivityIndicator animating={true} color={customFocusedColor} style={styles.buttonActivity} />
        ) : (
          !successMessage && (
            <Button
              mode="contained"
              onPress={handleResetPassword}
              style={styles.button}
              buttonColor={customFocusedColor}
              disabled={!token || !email}
            >
              Reset Password
            </Button>
          )
        )}

        <Button
          mode="text"
          onPress={() => navigation.navigate('Login')}
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
  subtitle: { marginBottom: 15, textAlign: 'center', color: '#555' },
  emailDisplay: { marginBottom: 15, fontSize: 14, color: '#333' }, 
  input: { width: '100%', marginBottom: 15 },
  button: { width: '100%', paddingVertical: 8, marginTop: 10, borderRadius: 8 },
  buttonActivity: { width: '100%', paddingVertical: 20, marginTop: 10 },
  backLink: { marginTop: 20 },
  messageText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  }
});

export default ResetPasswordScreen;
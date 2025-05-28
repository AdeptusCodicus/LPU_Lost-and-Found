import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { 
  Text, 
  Button, 
  TextInput, 
  ActivityIndicator, 
  HelperText, 
  Card,
  Provider as PaperProvider,
  DefaultTheme,
} from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import apiClient from '../../services/api';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#800000',
    accent: '#800000',  
  },
};
const customFocusedColor = theme.colors.primary;

type PasswordResetOtpScreenRouteProp = RouteProp<AuthStackParamList, 'PasswordResetOtp'>;
type PasswordResetOtpScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'PasswordResetOtp'>;

const PasswordResetOtpScreen = () => {
  const navigation = useNavigation<PasswordResetOtpScreenNavigationProp>();
  const route = useRoute<PasswordResetOtpScreenRouteProp>();
  
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [resendOtpLoading, setResendOtpLoading] = useState(false);
  const [resendOtpMessage, setResendOtpMessage] = useState('');

  const email = route.params?.email || '';

  const handleResetPassword = async () => {
    if (!otp.trim()) {
      setError('OTP is required.');
      return;
    }
    if (!newPassword || !confirmPassword) {
      setError('Please enter and confirm your new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (!email) {
      setError('Email not found. Please try the forgot password process again.');
      return;
    }

    setError('');
    setSuccessMessage('');
    setResendOtpMessage('');
    setIsLoading(true);

    try {
      const response = await apiClient.post('/auth/reset-password', { 
        email, 
        otp, 
        newPassword 
      });
      setSuccessMessage(response.data.message || 'Password reset successfully!');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      
      Alert.alert(
        "Password Reset Successful",
        "You can now log in with your new password.",
        [{ text: "OK", onPress: () => navigation.navigate('Login') }]
      );
    } catch (err: any) {
      const apiErrorMessage = err.response?.data?.error || 'Failed to reset password. Please try again.';
      setError(apiErrorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      setError('Email not found. Cannot resend OTP.');
      return;
    }

    setError(''); 
    setResendOtpMessage('');
    setResendOtpLoading(true);

    try {
      await apiClient.post('/auth/resend-otp', { email, purpose: 'passwordReset' });
      setResendOtpMessage('A new OTP has been sent to your email.');
      setOtp('');
    } catch (err: any) {
      const apiErrorMessage = err.response?.data?.error || 'Failed to resend OTP. Please try again.';
      setError(apiErrorMessage); 
    } finally {
      setResendOtpLoading(false);
    }
  };

  return (
    <PaperProvider theme={theme}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text variant="headlineMedium" style={styles.title}>Reset Password</Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            An OTP has been sent to {email}. Enter the OTP and your new password below.
          </Text>

          <Card style={styles.otpCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.cardTitle}>Enter OTP & New Password</Text>
              
              <TextInput
                label="OTP"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                mode="outlined"
                style={styles.input}
                activeOutlineColor={customFocusedColor}
                maxLength={6}
                disabled={isLoading || resendOtpLoading || !!successMessage}
                error={!!error && !newPassword && !confirmPassword && !resendOtpMessage}
              />

              <TextInput
                label="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
                mode="outlined"
                style={styles.input}
                activeOutlineColor={customFocusedColor}
                disabled={isLoading || resendOtpLoading || !!successMessage}
                right={
                  <TextInput.Icon
                    icon={showNewPassword ? "eye-off" : "eye"}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                  />
                }
              />

              <TextInput
                label="Confirm New Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                mode="outlined"
                style={styles.input}
                activeOutlineColor={customFocusedColor}
                disabled={isLoading || resendOtpLoading || !!successMessage}
                error={!!error && (newPassword !== confirmPassword) && !resendOtpMessage}
                right={
                  <TextInput.Icon
                    icon={showConfirmPassword ? "eye-off" : "eye"}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                }
              />
              
              {resendOtpMessage && !error && <HelperText type="info" visible={!!resendOtpMessage} style={styles.successText}>{resendOtpMessage}</HelperText>}
              {error && <HelperText type="error" visible={!!error}>{error}</HelperText>}
              {successMessage && <HelperText type="info" visible={!!successMessage} style={styles.successText}>{successMessage}</HelperText>}
              
              {isLoading ? (
                <ActivityIndicator animating={true} color={customFocusedColor} style={styles.buttonActivity} />
              ) : (
                !successMessage && (
                  <Button
                    mode="contained"
                    onPress={handleResetPassword}
                    style={styles.button}
                    buttonColor={customFocusedColor}
                    disabled={resendOtpLoading}
                  >
                    Reset Password
                  </Button>
                )
              )}
            </Card.Content>
          </Card>

          <Button
            mode="text"
            onPress={handleResendOtp}
            style={styles.resendButton}
            textColor={customFocusedColor}
            disabled={isLoading || resendOtpLoading || !!successMessage}
            loading={resendOtpLoading}
          >
            {resendOtpLoading ? "Resending..." : "Didn't receive OTP? Resend"}
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.navigate('Login')}
            style={styles.backLink}
            textColor={customFocusedColor}
            disabled={isLoading || resendOtpLoading}
          >
            Back to Login
          </Button>
        </View>
      </SafeAreaView>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { marginBottom: 10, color: '#333', textAlign: 'center' },
  subtitle: { marginBottom: 20, textAlign: 'center', color: '#555' },
  otpCard: {
    width: '100%',
    marginBottom: 20,
    elevation: 3,
  },
  cardTitle: {
    marginBottom: 15,
    textAlign: 'center',
    color: '#800000',
  },
  input: { marginBottom: 10, width: '100%' },
  button: { marginTop: 10, width: '100%' },
  buttonActivity: { marginTop: 10, paddingVertical: 10 },
  resendButton: { marginBottom: 10 },
  backLink: { marginTop: 10 },
  successText: {
    color: 'green',
    textAlign: 'center',
  },
});

export default PasswordResetOtpScreen;
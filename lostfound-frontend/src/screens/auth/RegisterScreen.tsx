import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, Alert } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  ActivityIndicator,
  HelperText,
  Dialog,
  Portal,
  Provider as PaperProvider, 
  DefaultTheme,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
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


type RegisterScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;

const RegisterScreen = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [otp, setOtp] = useState('');
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [resendOtpLoading, setResendOtpLoading] = useState(false);
  const [resendOtpMessage, setResendOtpMessage] = useState('');

  const validateForm = () => {
    if (!username.trim()) {
      setError('Username is required.');
      return false;
    }
    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters long.');
      return false;
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid LPU email address.');
      return false;
    }
    if (!email.endsWith('@lpu.edu.ph')) {
        setError('Please use your LPU email address (ends with @lpu.edu.ph).');
        return false;
    }
    if (!password) {
      setError('Password is required.');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const response = await apiClient.post('/auth/register', {
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      setRegisteredEmail(email.trim().toLowerCase());
      setSuccessMessage('Registration successful! An OTP has been sent to your email for verification.');
      setOtpModalVisible(true);
      setOtp('');
      setOtpError('');
      setResendOtpMessage('');

    } catch (err: any) {
      const apiErrorMessage = err.response?.data?.error || err.message || 'Registration failed. Please try again.';
      setError(apiErrorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setOtpError('OTP is required.');
      return;
    }

    setOtpError('');
    setResendOtpMessage('');
    setOtpLoading(true);

    try {
      const response = await apiClient.post('/auth/verify-email', { 
        email: registeredEmail, 
        otp: otp.trim() 
      });
      
      Alert.alert(
        "Email Verified!",
        response.data.message || "Your account has been verified successfully. You can now log in.",
        [
          {
            text: "OK",
            onPress: () => {
              setOtpModalVisible(false);
              setUsername('');
              setEmail('');
              setPassword('');
              setConfirmPassword('');
              setOtp('');
              setSuccessMessage('');
              setError('');
              navigation.navigate('Login');
            }
          }
        ]
      );

    } catch (err: any) {
      const apiErrorMessage = err.response?.data?.error || 'Failed to verify OTP. Please try again.';
      setOtpError(apiErrorMessage);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!registeredEmail) {
      setOtpError('Email not found. Cannot resend OTP.');
      return;
    }

    setOtpError('');
    setResendOtpMessage('');
    setResendOtpLoading(true);

    try {
      await apiClient.post('/auth/resend-otp', { email: registeredEmail, purpose: 'verification' });
      setResendOtpMessage('A new OTP has been sent to your email.');
      setOtp('');
    } catch (err: any) {
      const apiErrorMessage = err.response?.data?.error || 'Failed to resend OTP. Please try again.';
      setOtpError(apiErrorMessage);
    } finally {
      setResendOtpLoading(false);
    }
  };

  const closeOtpModal = () => {
    if (!otpLoading && !resendOtpLoading) {
      setOtpModalVisible(false);
      setOtp('');
      setOtpError('');
      setResendOtpMessage('');
    }
  };

  return (
    <PaperProvider theme={theme}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text variant="headlineLarge" style={styles.title}>Create Account</Text>
          
          <TextInput
            label="Username"
            value={username}
            onChangeText={setUsername}
            mode="outlined"
            style={styles.input}
            disabled={isLoading || otpModalVisible}
            activeOutlineColor={customFocusedColor}
            error={!!error && !username.trim()}
          />

          <TextInput
            label="LPU Email (@lpu.edu.ph)"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            disabled={isLoading || otpModalVisible}
            activeOutlineColor={customFocusedColor}
            error={!!error && (!email || !/\S+@\S+\.\S+/.test(email) || !email.endsWith('@lpu.edu.ph'))}
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            mode="outlined"
            style={styles.input}
            disabled={isLoading || otpModalVisible}
            activeOutlineColor={customFocusedColor}
            error={!!error && (!password || password.length < 6)}
            right={
              <TextInput.Icon
                icon={showPassword ? "eye-off" : "eye"}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
          />

          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            mode="outlined"
            style={styles.input}
            disabled={isLoading || otpModalVisible}
            activeOutlineColor={customFocusedColor}
            error={!!error && (password !== confirmPassword)}
            right={
              <TextInput.Icon
                icon={showConfirmPassword ? "eye-off" : "eye"}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            }
          />

          {error && <HelperText type="error" visible={!!error}>{error}</HelperText>}
          {successMessage && !otpModalVisible && (
            <HelperText type="info" visible={!!successMessage} style={styles.successText}>
              {successMessage}
            </HelperText>
          )}

          {isLoading ? (
            <ActivityIndicator animating={true} color={customFocusedColor} style={styles.buttonActivity} />
          ) : (
            <Button
              mode="contained"
              onPress={handleRegister}
              style={styles.button}
              buttonColor={customFocusedColor}
              disabled={otpModalVisible}
            >
              Register
            </Button>
          )}

          <Button
            mode="text"
            onPress={() => navigation.navigate('Login')}
            style={styles.linkButton}
            textColor={customFocusedColor}
            disabled={isLoading || otpModalVisible}
          >
            Already have an account? Sign In
          </Button>

          <Portal>
            <Dialog visible={otpModalVisible} onDismiss={closeOtpModal} dismissable={!otpLoading && !resendOtpLoading}>
              <Dialog.Content>
                <Text style={styles.dialogTitleCustom}>Verify Your Email</Text>
                <Text style={styles.otpDescription}>
                  An OTP has been sent to {registeredEmail}. Please enter it below to verify your account.
                </Text>
                <TextInput
                  label="Enter OTP"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  mode="outlined"
                  style={styles.otpInput}
                  activeOutlineColor={customFocusedColor}
                  maxLength={6}
                  disabled={otpLoading || resendOtpLoading}
                  error={!!otpError}
                />
                {otpError && <HelperText type="error" visible={!!otpError}>{otpError}</HelperText>}
                {resendOtpMessage && !otpError && <HelperText type="info" visible={!!resendOtpMessage} style={{color: 'green'}}>{resendOtpMessage}</HelperText>}
              </Dialog.Content>
              <Dialog.Actions>
                <Button 
                  onPress={handleResendOtp} 
                  disabled={otpLoading || resendOtpLoading}
                  loading={resendOtpLoading}
                  textColor={customFocusedColor}
                >
                  Resend OTP
                </Button>
                <Button onPress={closeOtpModal} disabled={otpLoading || resendOtpLoading}>
                  Cancel
                </Button>
                <Button 
                  onPress={handleVerifyOtp} 
                  loading={otpLoading} 
                  disabled={otpLoading || resendOtpLoading}
                  buttonColor={customFocusedColor}
                  mode="contained"
                >
                  Verify
                </Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>
        </View>
      </SafeAreaView>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { marginBottom: 30, textAlign: 'center', color: '#333' },
  input: { marginBottom: 15 },
  button: { marginTop: 20, paddingVertical: 5 },
  buttonActivity: { marginTop: 20, paddingVertical: 15 },
  linkButton: { marginTop: 15 },
  successText: {
    color: 'green',
    textAlign: 'center',
    marginBottom: 10,
  },
  dialogTitleCustom: {
    textAlign: 'center',
    color: '#800000',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 10,
  },
  otpDescription: {
    marginBottom: 15,
    textAlign: 'center',
    color: '#555',
  },
  otpInput: {
    marginBottom: 10,
  },
});

export default RegisterScreen;
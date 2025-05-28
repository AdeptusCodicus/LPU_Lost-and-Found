import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, StyleSheet, View, Alert, RefreshControl } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  ActivityIndicator,
  HelperText,
  Dialog,
  Portal,
  Provider as PaperProvider,
  DefaultTheme,
} from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../services/api';
import SafeAreaView from '../../components/CustomSafeAreaView';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#800000',
    accent: '#800000',
  },
};

const AccountScreen = ({ navigation }: any) => {
  const { user, logout, updateUserContext } = useAuth();

  const [newUsername, setNewUsername] = useState('');
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [usernameSuccess, setUsernameSuccess] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [otp, setOtp] = useState('');
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendOtpLoading, setResendOtpLoading] = useState(false);
  const [resendOtpMessage, setResendOtpMessage] = useState('');


  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    
    setNewUsername('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setOtp('');
    
    setUsernameError(null);
    setUsernameSuccess(null);
    setPasswordError(null);
    setPasswordSuccess(null);
    setOtpError(null);
    setResendOtpMessage('');
    
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    
    setOtpModalVisible(false);
    
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []); 

  const handleUsernameChange = async () => {
    setUsernameError(null);
    setUsernameSuccess(null);
    if (!newUsername.trim()) {
      setUsernameError('New username cannot be empty.');
      return;
    }
    if (newUsername.trim().length < 3) {
      setUsernameError('New username must be at least 3 characters long.');
      return;
    }
    if (newUsername.trim() === user?.username) {
      setUsernameError('New username is the same as the current one.');
      return;
    }

    setUsernameLoading(true);
    try {
      const response = await apiClient.post('/auth/change-username', { newUsername: newUsername.trim() });
      setUsernameSuccess(response.data.message || 'Username changed successfully!');
      if (updateUserContext && response.data.user) {
        updateUserContext(response.data.user);
      }
    } catch (err: any) {
      setUsernameError(err.response?.data?.error || 'Failed to change username.');
      console.error("Username change error:", err.response?.data || err);
    } finally {
      setUsernameLoading(false);
    }
  };

  const handleChangePasswordInitiate = async () => {
    setPasswordError(null);
    setPasswordSuccess(null);
    setOtpError(null);
    setResendOtpMessage('');

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordError('All password fields are required.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (currentPassword === newPassword) {
      setPasswordError('New password cannot be the same as the current password.');
      return;
    }

    setPasswordLoading(true);
    try {
      const response = await apiClient.post('/auth/change-password', { currentPassword, newPassword });
      setPasswordSuccess(response.data.message || 'OTP sent to your email to confirm password change.');
      setOtpModalVisible(true);
      setOtp(''); // Clear previous OTP
    } catch (err: any) {
      setPasswordError(err.response?.data?.error || 'Failed to initiate password change.');
      console.error("Password change initiation error:", err.response?.data || err);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleConfirmPasswordChangeWithOtp = async () => {
    setOtpError(null);
    setResendOtpMessage('');
    if (!otp.trim()) {
      setOtpError('OTP is required.');
      return;
    }
    if (!user?.email) {
        setOtpError('User email not found. Cannot confirm password change.');
        return;
    }

    setOtpLoading(true);
    try {
      const response = await apiClient.post('/auth/confirm-password-change', { email: user.email, otp });
      setPasswordSuccess(response.data.message || 'Password changed successfully!');
      setOtpModalVisible(false);
      setOtp('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setPasswordError(null);
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (err: any) {
      setOtpError(err.response?.data?.error || 'Failed to confirm password change with OTP.');
      console.error("OTP confirmation error:", err.response?.data || err);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendChangePasswordOtp = async () => {
    if (!user?.email) {
        setOtpError('User email not found. Cannot resend OTP.');
        return;
    }

    setOtpError(null);
    setResendOtpMessage('');
    setResendOtpLoading(true);

    try {
      await apiClient.post('/auth/resend-otp', { email: user.email, purpose: 'passwordChangeConfirmation' });
      setResendOtpMessage('A new OTP has been sent to your email.');
      setOtp(''); 
    } catch (err: any) {
      const apiErrorMessage = err.response?.data?.error || 'Failed to resend OTP.';
      setOtpError(apiErrorMessage);
      console.error("Resend Change Password OTP error:", err.response?.data || err);
    } finally {
      setResendOtpLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", onPress: () => logout() }
      ]
    );
  };

  if (!user) {
    return (
      <PaperProvider theme={theme}>
        <SafeAreaView style={styles.loaderContainer}>
          <ActivityIndicator animating={true} color={theme.colors.primary} />
          <Text>Loading user data...</Text>
        </SafeAreaView>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView 
          contentContainerStyle={styles.container}
          refreshControl={
            <RefreshControl
              refreshing={refreshing || usernameLoading || passwordLoading}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
              title="Pull to refresh"
              titleColor={theme.colors.primary}
            />
          }
        >
          <Card style={styles.card}>
            <Card.Title title="Account Information" titleStyle={{color: theme.colors.primary}} />
            <Card.Content>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.value}>{user.email}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Username:</Text>
                <Text style={styles.value}>{user.username}</Text>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Title title="Change Username" titleStyle={{color: theme.colors.primary}}/>
            <Card.Content>
              <TextInput
                label="New Username"
                value={newUsername}
                onChangeText={setNewUsername}
                mode="outlined"
                style={styles.input}
                activeOutlineColor={theme.colors.primary}
                error={!!usernameError}
                disabled={refreshing || usernameLoading}
              />
              {usernameError && <HelperText type="error" visible={!!usernameError}>{usernameError}</HelperText>}
              {usernameSuccess && <HelperText type="info" visible={!!usernameSuccess} style={{color: 'green'}}>{usernameSuccess}</HelperText>}
              <Button
                mode="contained"
                onPress={handleUsernameChange}
                loading={usernameLoading}
                disabled={usernameLoading || refreshing}
                style={styles.button}
                buttonColor={theme.colors.primary}
              >
                Update Username
              </Button>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Title title="Change Password" titleStyle={{color: theme.colors.primary}}/>
            <Card.Content>
              <TextInput
                label="Current Password"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={!showCurrentPassword}
                mode="outlined"
                style={styles.input}
                activeOutlineColor={theme.colors.primary}
                disabled={refreshing || passwordLoading}
                right={
                  <TextInput.Icon
                    icon={showCurrentPassword ? "eye-off" : "eye"}
                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                    disabled={refreshing || passwordLoading}
                  />
                }
              />
              <TextInput
                label="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
                mode="outlined"
                style={styles.input}
                activeOutlineColor={theme.colors.primary}
                disabled={refreshing || passwordLoading}
                right={
                  <TextInput.Icon
                    icon={showNewPassword ? "eye-off" : "eye"}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    disabled={refreshing || passwordLoading}
                  />
                }
              />
              <TextInput
                label="Confirm New Password"
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
                secureTextEntry={!showConfirmPassword}
                mode="outlined"
                style={styles.input}
                activeOutlineColor={theme.colors.primary}
                error={!!passwordError && (newPassword !== confirmNewPassword || !confirmNewPassword)}
                disabled={refreshing || passwordLoading}
                right={
                  <TextInput.Icon
                    icon={showConfirmPassword ? "eye-off" : "eye"}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={refreshing || passwordLoading}
                  />
                }
              />
              {passwordError && <HelperText type="error" visible={!!passwordError}>{passwordError}</HelperText>}
              {passwordSuccess && !otpModalVisible && <HelperText type="info" visible={!!passwordSuccess} style={{color: 'green'}}>{passwordSuccess}</HelperText>}
              <Button
                mode="contained"
                onPress={handleChangePasswordInitiate}
                loading={passwordLoading}
                disabled={passwordLoading || otpModalVisible || refreshing}
                style={styles.button}
                buttonColor={theme.colors.primary}
              >
                Change Password
              </Button>
            </Card.Content>
          </Card>

          <Button
            mode="outlined"
            onPress={handleLogout}
            style={[styles.button, styles.logoutButton]}
            icon="logout"
            textColor={theme.colors.primary}
            disabled={refreshing}
          >
            Logout
          </Button>

          <Portal>
            <Dialog visible={otpModalVisible} onDismiss={() => { if(!otpLoading && !resendOtpLoading) setOtpModalVisible(false); }} dismissable={!otpLoading && !resendOtpLoading}>
              <Dialog.Content>
                <Text style={styles.dialogTitleCustom}>Enter OTP</Text>
                <Text style={styles.dialogSubtitle}>An OTP has been sent to {user.email} to confirm your password change.</Text>
                <TextInput
                  label="OTP"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  mode="outlined"
                  style={styles.input}
                  activeOutlineColor={theme.colors.primary}
                  maxLength={6}
                  error={!!otpError}
                  disabled={otpLoading || resendOtpLoading}
                />
                {otpError && <HelperText type="error" visible={!!otpError}>{otpError}</HelperText>}
                {resendOtpMessage && !otpError && <HelperText type="info" visible={!!resendOtpMessage} style={{color: 'green'}}>{resendOtpMessage}</HelperText>}
              </Dialog.Content>
              <Dialog.Actions>
                <Button 
                  onPress={handleResendChangePasswordOtp} 
                  disabled={otpLoading || resendOtpLoading}
                  loading={resendOtpLoading}
                  textColor={theme.colors.primary}
                >
                  Resend OTP
                </Button>
                <Button onPress={() => { if(!otpLoading && !resendOtpLoading) setOtpModalVisible(false); }} disabled={otpLoading || resendOtpLoading}>Cancel</Button>
                <Button 
                  onPress={handleConfirmPasswordChangeWithOtp} 
                  loading={otpLoading} 
                  disabled={otpLoading || resendOtpLoading}
                  buttonColor={theme.colors.primary}
                  mode="contained"
                >
                  Confirm
                </Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>
        </ScrollView>
      </SafeAreaView>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    flexGrow: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginBottom: 15,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  label: {
    fontWeight: 'bold',
    marginRight: 8,
    fontSize: 16,
    color: '#333',
  },
  value: {
    fontSize: 16,
    color: '#555',
    flexShrink: 1,
  },
  dialogTitleCustom: {
    textAlign: 'center',
    color: '#800000',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 10,
  },
  dialogSubtitle: {
    textAlign: 'center',
    marginBottom: 15,
    color: '#555',
  },
  input: {
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
  },
  logoutButton: {
    marginTop: 20,
    borderColor: '#800000',
  },
});

export default AccountScreen;
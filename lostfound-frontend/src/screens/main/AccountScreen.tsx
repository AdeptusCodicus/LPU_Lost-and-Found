import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Alert, RefreshControl } from 'react-native'; // Add RefreshControl
import {
  Text,
  TextInput,
  Button,
  Card,
  Divider,
  ActivityIndicator,
  HelperText,
  Dialog,
  Portal,
  Provider as PaperProvider,
  DefaultTheme,
  IconButton,
} from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../services/api';

// If you have a global theme, you might not need to define it here
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

  // Change Username State
  const [newUsername, setNewUsername] = useState('');
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [usernameSuccess, setUsernameSuccess] = useState<string | null>(null);

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // Password Visibility State
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP Modal State (for password change confirmation)
  const [otp, setOtp] = useState('');
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  // Pull to refresh state
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      setNewUsername(user.username || '');
    }
  }, [user]);

  // Pull to refresh function
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    
    setNewUsername('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setOtp('');
    
    // Clear all error and success messages
    setUsernameError(null);
    setUsernameSuccess(null);
    setPasswordError(null);
    setPasswordSuccess(null);
    setOtpError(null);
    
    // Reset password visibility states
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    
    // Close OTP modal if open
    setOtpModalVisible(false);
    
    // Simulate a small delay for better UX
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, [user]);

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
    } catch (err: any) {
      setPasswordError(err.response?.data?.error || 'Failed to initiate password change.');
      console.error("Password change initiation error:", err.response?.data || err);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleConfirmPasswordChangeWithOtp = async () => {
    setOtpError(null);
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
      // Reset password visibility states
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
      <View style={styles.loaderContainer}>
        <ActivityIndicator animating={true} color={theme.colors.primary} />
        <Text>Loading user data...</Text>
      </View>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <ScrollView 
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]} // Android
            tintColor={theme.colors.primary} // iOS
            title="Pull to refresh" // iOS only
            titleColor={theme.colors.primary} // iOS only
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
              error={!!usernameError}
              disabled={refreshing} // Disable during refresh
            />
            {usernameError && <HelperText type="error" visible={!!usernameError}>{usernameError}</HelperText>}
            {usernameSuccess && <HelperText type="info" visible={!!usernameSuccess} style={{color: 'green'}}>{usernameSuccess}</HelperText>}
            <Button
              mode="contained"
              onPress={handleUsernameChange}
              loading={usernameLoading}
              disabled={usernameLoading || refreshing} // Disable during refresh
              style={styles.button}
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
              disabled={refreshing} // Disable during refresh
              right={
                <TextInput.Icon
                  icon={showCurrentPassword ? "eye-off" : "eye"}
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  disabled={refreshing}
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
              disabled={refreshing} // Disable during refresh
              right={
                <TextInput.Icon
                  icon={showNewPassword ? "eye-off" : "eye"}
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  disabled={refreshing}
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
              error={!!passwordError && (newPassword !== confirmNewPassword || !confirmNewPassword)}
              disabled={refreshing} // Disable during refresh
              right={
                <TextInput.Icon
                  icon={showConfirmPassword ? "eye-off" : "eye"}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={refreshing}
                />
              }
            />
            {passwordError && <HelperText type="error" visible={!!passwordError}>{passwordError}</HelperText>}
            {passwordSuccess && !otpModalVisible && <HelperText type="info" visible={!!passwordSuccess} style={{color: 'green'}}>{passwordSuccess}</HelperText>}
            <Button
              mode="contained"
              onPress={handleChangePasswordInitiate}
              loading={passwordLoading}
              disabled={passwordLoading || otpModalVisible || refreshing} // Disable during refresh
              style={styles.button}
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
          disabled={refreshing} // Disable during refresh
        >
          Logout
        </Button>

        <Portal>
          <Dialog visible={otpModalVisible} onDismiss={() => { if(!otpLoading) setOtpModalVisible(false); }}>
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
                maxLength={6}
                error={!!otpError}
              />
              {otpError && <HelperText type="error" visible={!!otpError}>{otpError}</HelperText>}
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => { if(!otpLoading) setOtpModalVisible(false); }} disabled={otpLoading}>Cancel</Button>
              <Button onPress={handleConfirmPasswordChangeWithOtp} loading={otpLoading} disabled={otpLoading}>Confirm</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </ScrollView>
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
  dialogTitleCustom: { // Fixed the dialog title styling
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
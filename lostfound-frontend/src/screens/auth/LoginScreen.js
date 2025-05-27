import React, { useState } from 'react';
import {
    Box,
    Text,
    Heading,
    VStack,
    FormControl,
    Input,
    InputField,
    Button,
    ButtonText,
    Link,
    LinkText,
    Spinner,
    Toast,
    ToastTitle,
    ToastDescription,
    useToast
} from '@gluestack-ui/themed';
import { useAuth } from '../../contexts/AuthContext';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

const LoginScreen = ({ navigation }) => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();

    const handleLogin = async () => {
        if (!email || !password) {
            toast.show({
                placement: "top",
                render: ({ id }) => (
                    <Toast nativeID={`toast-${id}`} action ="error" variant="accent">
                        <VStack space="xs">
                            <ToastTitle>Input Required</ToastTitle>
                            <ToastDescription>Please enter both email and password.</ToastDescription>
                        </VStack>
                    </Toast>
                ),
            });
            return;
        }

        setIsLoading(true);
        const result = await login(email, password);
        setIsLoading(false);

        if (result.success) {
            toast.show({
                placement: "top",
                render: ({ id }) => (
                    <Toast nativeID={`toast-${id}`} action="success" variant="accent">
                        <VStack space="xs">
                            <ToastTitle>Login Successful</ToastTitle>
                            <ToastDescription>Welcome back, {result.user?.name || 'User'}!</ToastDescription>
                        </VStack>
                    </Toast>
                ),
            });
        } else {
            toast.show({
                placement: "top",
                render: ({ id }) => (
                    <Toast nativeID={`toast-${id}`} action="error" variant="accent">
                        <VStack space="xs">
                            <ToastTitle>Login Failed</ToastTitle>
                            <ToastDescription>{result.error || 'An unexpected error occurred.'}</ToastDescription>
                        </VStack>
                    </Toast>
                ),
            });
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ flexGrow: 1}}>
                <Box flex={1} justifyContent="center" alignItems="center" p="$8" bg="$backgroundLight0">
                    <VStack space="xl" w="100%" alignItems="center">
                        <Heading size="2xl" color="$primary700">LPU Lost & Found</Heading>
                        <Text size="lg" color="$textLight600">Sign in to continue</Text>

                        <VStack space="md" w="100%">
                            <FormControl isRequired>
                                <FormControl.Label>
                                    <Text color="$textLight500">Email</Text>
                                </FormControl.Label>
                                <Input>
                                    <InputField
                                        type="text"
                                        placeholder="your.email@lpu.edu.ph"
                                        value={email}
                                        onChangeText={setEmail}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                    />
                                </Input>
                            </FormControl>

                            <FormControl isRequired>
                                <FormControl.Label>
                                    <Text color="$textLight500">Password</Text>
                                </FormControl.Label>
                                <Input>
                                    <InputField
                                        type="password"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry
                                    />
                                </Input>
                                <Link onPress={() => navigation.navigate('ForgotPassword')} mt="$2" alignSelf="flex-end">
                                    <LinkText size="sm" color="$primary600">Forgot Password?</LinkText>
                                </Link>
                            </FormControl>

                            <Button
                                size="lg"
                                variant="solid"
                                action="primary"
                                onPress={handleLogin}
                                isDisabled={isLoading}
                                mt="$4"
                            >
                                {isLoading ? <Spinner color="$textLight0" /> : <ButtonText>Sign In</ButtonText>}
                            </Button>
                        </VStack>

                        <Box flexDirection="row" mt="$6">
                            <Text size="sm" color="$textLight500">Don't have an account?</Text>
                            <Link onPress={() => navigation.navigate('Register')}>
                                <LinkText size="sm" color="$primary600" frontWeight="$bold">Sign Up</LinkText>
                            </Link>
                        </Box>
                    </VStack>
                </Box>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default LoginScreen;
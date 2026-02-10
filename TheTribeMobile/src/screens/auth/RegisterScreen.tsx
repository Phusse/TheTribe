// Register Screen for TheTribe Mobile
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
    ScrollView,
} from 'react-native';
import { Colors } from '../../theme';
import { useAuth } from '../../context/AuthContext';

interface RegisterScreenProps {
    navigation: any;
}

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();

    const handleRegister = async () => {
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);
        const result = await register({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password,
        });
        setIsLoading(false);

        if (result.success) {
            Alert.alert('Success', 'Registration successful! Please login.', [
                { text: 'OK', onPress: () => navigation.navigate('Login') },
            ]);
        } else {
            Alert.alert('Registration Failed', result.error || 'Unknown error');
        }
    };

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.content}>
                    {/* Logo */}
                    <Image
                        source={require('../../../assets/logo.jpg')}
                        style={styles.logo}
                        resizeMode="contain"
                    />

                    <Text style={styles.title}>Join TheTribe</Text>
                    <Text style={styles.subtitle}>Create your account</Text>

                    {/* Form */}
                    <View style={styles.form}>
                        <View style={styles.row}>
                            <TextInput
                                style={[styles.input, styles.halfInput]}
                                placeholder="First Name"
                                placeholderTextColor={Colors.tribeGray}
                                value={formData.firstName}
                                onChangeText={v => updateField('firstName', v)}
                            />
                            <TextInput
                                style={[styles.input, styles.halfInput]}
                                placeholder="Last Name"
                                placeholderTextColor={Colors.tribeGray}
                                value={formData.lastName}
                                onChangeText={v => updateField('lastName', v)}
                            />
                        </View>

                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            placeholderTextColor={Colors.tribeGray}
                            value={formData.email}
                            onChangeText={v => updateField('email', v)}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor={Colors.tribeGray}
                            value={formData.password}
                            onChangeText={v => updateField('password', v)}
                            secureTextEntry
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Confirm Password"
                            placeholderTextColor={Colors.tribeGray}
                            value={formData.confirmPassword}
                            onChangeText={v => updateField('confirmPassword', v)}
                            secureTextEntry
                        />

                        <TouchableOpacity
                            style={[styles.button, isLoading && styles.buttonDisabled]}
                            onPress={handleRegister}
                            disabled={isLoading}>
                            {isLoading ? (
                                <ActivityIndicator color={Colors.tribeBlack} />
                            ) : (
                                <Text style={styles.buttonText}>Create Account</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Login Link */}
                    <TouchableOpacity
                        style={styles.loginLink}
                        onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.loginText}>
                            Already have an account?{' '}
                            <Text style={styles.loginHighlight}>Sign In</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.tribeBlack,
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 40,
    },
    logo: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.tribeLight,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: Colors.tribeGold,
        marginBottom: 32,
    },
    form: {
        width: '100%',
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    input: {
        backgroundColor: Colors.tribeGray,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: Colors.tribeLight,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    halfInput: {
        flex: 1,
    },
    button: {
        backgroundColor: Colors.tribeGold,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: Colors.tribeBlack,
        fontSize: 16,
        fontWeight: '600',
    },
    loginLink: {
        marginTop: 24,
    },
    loginText: {
        color: Colors.tribeLight,
        fontSize: 14,
    },
    loginHighlight: {
        color: Colors.tribeGold,
        fontWeight: '600',
    },
});

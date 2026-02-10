// Profile Screen for TheTribe Mobile
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Alert,
    Image,
} from 'react-native';
import { Colors } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';

interface ProfileData {
    id: string;
    firstName: string;
    lastName: string;
    bio: string | null;
    profilePhotoUrl: string | null;
    phoneNumber: string | null;
    dateOfBirth: string | null;
    location: string | null;
    timezone: string | null;
    occupation: string | null;
    isProfileComplete: boolean;
}

export default function ProfileScreen({ navigation }: { navigation: any }) {
    const { user, logout } = useAuth();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editData, setEditData] = useState({
        firstName: '',
        lastName: '',
        bio: '',
        phoneNumber: '',
        location: '',
        occupation: '',
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setIsLoading(true);
            const response = await apiService.getProfile();
            if (response.success) {
                setProfile(response.data);
                setEditData({
                    firstName: response.data.firstName || '',
                    lastName: response.data.lastName || '',
                    bio: response.data.bio || '',
                    phoneNumber: response.data.phoneNumber || '',
                    location: response.data.location || '',
                    occupation: response.data.occupation || '',
                });
            }
        } catch (error) {
            console.error('Failed to load profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await apiService.updateProfile(editData);
            if (response.success) {
                setProfile(response.data);
                setIsEditing(false);
                Alert.alert('Success', 'Profile updated successfully');
            } else {
                Alert.alert('Error', response.message || 'Failed to update profile');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', style: 'destructive', onPress: logout },
        ]);
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.tribeGold} />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Profile Header */}
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    {profile?.profilePhotoUrl ? (
                        <Image source={{ uri: profile.profilePhotoUrl }} style={styles.avatar} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>
                                {profile?.firstName?.[0]?.toUpperCase() || 'U'}
                            </Text>
                        </View>
                    )}
                </View>
                <Text style={styles.name}>
                    {profile?.firstName} {profile?.lastName}
                </Text>
                {profile?.occupation && (
                    <Text style={styles.occupation}>{profile.occupation}</Text>
                )}
            </View>

            {/* Profile Fields */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Profile Information</Text>

                <View style={styles.field}>
                    <Text style={styles.fieldLabel}>First Name</Text>
                    {isEditing ? (
                        <TextInput
                            style={styles.input}
                            value={editData.firstName}
                            onChangeText={v => setEditData({ ...editData, firstName: v })}
                        />
                    ) : (
                        <Text style={styles.fieldValue}>{profile?.firstName || '-'}</Text>
                    )}
                </View>

                <View style={styles.field}>
                    <Text style={styles.fieldLabel}>Last Name</Text>
                    {isEditing ? (
                        <TextInput
                            style={styles.input}
                            value={editData.lastName}
                            onChangeText={v => setEditData({ ...editData, lastName: v })}
                        />
                    ) : (
                        <Text style={styles.fieldValue}>{profile?.lastName || '-'}</Text>
                    )}
                </View>

                <View style={styles.field}>
                    <Text style={styles.fieldLabel}>Bio</Text>
                    {isEditing ? (
                        <TextInput
                            style={[styles.input, styles.bioInput]}
                            value={editData.bio}
                            onChangeText={v => setEditData({ ...editData, bio: v })}
                            multiline
                            numberOfLines={3}
                        />
                    ) : (
                        <Text style={styles.fieldValue}>{profile?.bio || '-'}</Text>
                    )}
                </View>

                <View style={styles.field}>
                    <Text style={styles.fieldLabel}>Phone</Text>
                    {isEditing ? (
                        <TextInput
                            style={styles.input}
                            value={editData.phoneNumber}
                            onChangeText={v => setEditData({ ...editData, phoneNumber: v })}
                            keyboardType="phone-pad"
                        />
                    ) : (
                        <Text style={styles.fieldValue}>{profile?.phoneNumber || '-'}</Text>
                    )}
                </View>

                <View style={styles.field}>
                    <Text style={styles.fieldLabel}>Location</Text>
                    {isEditing ? (
                        <TextInput
                            style={styles.input}
                            value={editData.location}
                            onChangeText={v => setEditData({ ...editData, location: v })}
                        />
                    ) : (
                        <Text style={styles.fieldValue}>{profile?.location || '-'}</Text>
                    )}
                </View>

                <View style={styles.field}>
                    <Text style={styles.fieldLabel}>Occupation</Text>
                    {isEditing ? (
                        <TextInput
                            style={styles.input}
                            value={editData.occupation}
                            onChangeText={v => setEditData({ ...editData, occupation: v })}
                        />
                    ) : (
                        <Text style={styles.fieldValue}>{profile?.occupation || '-'}</Text>
                    )}
                </View>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
                {isEditing ? (
                    <>
                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleSave}
                            disabled={isSaving}>
                            {isSaving ? (
                                <ActivityIndicator color={Colors.tribeBlack} />
                            ) : (
                                <Text style={styles.saveButtonText}>Save Changes</Text>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setIsEditing(false)}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => setIsEditing(true)}>
                        <Text style={styles.editButtonText}>Edit Profile</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.tribeBlack,
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: Colors.tribeBlack,
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatarContainer: {
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.tribeGold,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: Colors.tribeBlack,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.tribeLight,
    },
    occupation: {
        fontSize: 14,
        color: Colors.tribeGold,
        marginTop: 4,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.tribeLight,
        marginBottom: 16,
    },
    field: {
        marginBottom: 16,
    },
    fieldLabel: {
        fontSize: 12,
        color: Colors.tribeGold,
        marginBottom: 4,
    },
    fieldValue: {
        fontSize: 16,
        color: Colors.tribeLight,
    },
    input: {
        backgroundColor: Colors.tribeGray,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        color: Colors.tribeLight,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    bioInput: {
        height: 80,
        textAlignVertical: 'top',
    },
    actions: {
        gap: 12,
    },
    editButton: {
        backgroundColor: Colors.tribeGold,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    editButtonText: {
        color: Colors.tribeBlack,
        fontSize: 16,
        fontWeight: '600',
    },
    saveButton: {
        backgroundColor: Colors.tribeGold,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    saveButtonText: {
        color: Colors.tribeBlack,
        fontSize: 16,
        fontWeight: '600',
    },
    cancelButton: {
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.tribeGray,
    },
    cancelButtonText: {
        color: Colors.tribeLight,
        fontSize: 16,
    },
    logoutButton: {
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ef4444',
        marginTop: 12,
    },
    logoutButtonText: {
        color: '#ef4444',
        fontSize: 16,
        fontWeight: '600',
    },
});

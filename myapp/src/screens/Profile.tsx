import React, { useEffect, useState } from 'react';
import { View, Text, ImageBackground, StyleSheet, Alert, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../App';

// Get screen width and height
const { width, height } = Dimensions.get('window');

const Profile = ({ navigation }: NativeStackScreenProps<RootStackParamList, 'MainTabs'>) => {
    const [profilePic, setProfilePic] = useState('');
    const [userName, setUserName] = useState('');
    const [bio, setBio] = useState('');
    const userId = auth().currentUser?.uid;

    useEffect(() => {
        if (!userId) {
            Alert.alert('No user logged in');
            return;
        }

        const fetchUserData = async () => {
            try {
                const userDoc = await firestore().collection('user').doc(userId).get();
                if (userDoc.exists) {
                    const data = userDoc.data();
                    if (data) {
                        setUserName(data.name || '');
                        setProfilePic(data.profilePic || '');
                        setBio(data.bio || '');
                    }
                } else {
                    console.error('User document does not exist');
                }
            } catch (err) {
                const error = err as Error; // Explicitly cast 'err' to the Error type
                console.error('Error fetching data:', error.message);
            }
        };

        fetchUserData();
    }, [userId]);

    const handleImageUpload = async () => {
        if (!userId) {return Alert.alert('No user logged in');}

        launchImageLibrary({ mediaType: 'photo' }, async (response) => {
            if (response.didCancel || !response.assets?.length) {
                Alert.alert('Image selection canceled');
                return;
            }

            const uri = response.assets[0]?.uri;
            if (!uri) {
                Alert.alert('Invalid image URI');
                return;
            }

            setProfilePic(uri);

            try {
                // Save the image URI directly to Firestore
                await firestore().collection('user').doc(userId).update({ profilePic: uri });
                Alert.alert('Profile picture updated successfully');
            } catch (err) {
                const error = err as Error;
                console.error('Error saving image URI to Firestore:', error.message);
                Alert.alert('Error saving image URI:', error.message);
            }
        });
    };

    const handleUpdateBio = async () => {
        if (!userId) {return Alert.alert('No user logged in');}
        try {
            await firestore().collection('user').doc(userId).update({ bio });
            Alert.alert('Bio updated successfully');
        } catch (err) {
            const error = err as Error;
            Alert.alert('Error updating bio:', error.message);
        }
    };

    const handleLogout = async () => {
        try {
            await auth().signOut();
            Alert.alert('Logged out successfully');
        } catch (err) {
            const error = err as Error;
            Alert.alert('Error logging out:', error.message);
        }
    };

    return (
        <View style={styles.container}>
            {/* Profile Section */}
            <View style={styles.imageContainer}>
                <ImageBackground
                    source={require('../images/backgroundImage.jpg')}
                    style={styles.blackBackground}
                />
            </View>

            <TouchableOpacity onPress={handleImageUpload} style={styles.profilePicContainer}>
                <ImageBackground
                    source={profilePic ? { uri: profilePic } : require('../images/profile.png')}
                    style={styles.profilePic}
                    imageStyle={{ borderRadius: 60 }}
                />
                <Icon name="edit" size={30} color="#666" style={styles.editIcon} />
            </TouchableOpacity>

            <Text style={styles.nameText}>{userName || 'Your Name'}</Text>

            <TextInput
                style={styles.bioInput}
                value={bio}
                onChangeText={setBio}
                onBlur={handleUpdateBio}
                placeholder="Set your bio..."
                placeholderTextColor="grey"
            />

            {/* Menu Section */}
            <View style={styles.menuContainer}>
                {/* Home Button */}
                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => navigation.navigate('MainTabs', { screen: 'Dashboard' })}
                >
                    <Icon name="home" size={25} color="#666" style={styles.menuIcon} />
                    <Text style={styles.menuText}>Home</Text>
                    <View style={{ flex: 1 }} />
                    <Icon name="keyboard-arrow-right" size={25} color="#666" />
                </TouchableOpacity>

                {/* Settings Button */}
                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => navigation.navigate('MainTabs', { screen: 'Settings' })}
                >
                    <Icon name="settings" size={25} color="#666" style={styles.menuIcon} />
                    <Text style={styles.menuText}>Settings</Text>
                    <View style={{ flex: 1 }} />
                    <Icon name="keyboard-arrow-right" size={25} color="#666" />
                </TouchableOpacity>

                {/* About Button */}
                <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('About')}>
                    <Icon name="info" size={25} color="#666" style={styles.menuIcon} />
                    <Text style={styles.menuText}>About</Text>
                    <View style={{ flex: 1 }} />
                    <Icon name="keyboard-arrow-right" size={25} color="#666" />
                </TouchableOpacity>

                {/* Logout Button */}
                <TouchableOpacity
                    style={[styles.menuItem, styles.logoutButton]}
                    onPress={handleLogout}
                >
                    <Icon name="logout" size={25} color="#fff" style={styles.menuIcon} />
                    <Text style={[styles.menuText, { color: '#fff' }]}>Logout</Text>
                    <View style={{ flex: 1 }} />
                    <Icon name="keyboard-arrow-right" size={25} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    imageContainer: {
        width: '100%',
        height: height * 0.3, // Responsive height
        borderBottomLeftRadius: 50,
        borderBottomRightRadius: 50,
        overflow: 'hidden',
    },
    blackBackground: {
        width: '100%',
        height: '100%',
    },
    profilePicContainer: {
        position: 'relative',
        marginTop: -40, // Adjusted for better placement
        alignItems: 'center',
    },
    profilePic: {
        width: width * 0.2, // Responsive width
        height: width * 0.2, // Same for height, keep circular shape
    },
    editIcon: {
        position: 'absolute',
        bottom: 0,
        right: -5,
    },
    nameText: {
        fontSize: 28,
        marginTop: 10,
        color: '#666',
    },
    bioInput: {
        marginTop: 10,
        fontSize: 16,
        padding: 8,
        width: '80%', // Responsive width
        textAlign: 'center',
    },
    menuContainer: {
        marginTop: 30,
        width: '80%', // Responsive width
    },
    menuItem: {
        padding: 15,
        borderRadius: 10,
        backgroundColor: '#ffffff',
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuIcon: {
        paddingRight: 10,
    },
    logoutButton: {
        backgroundColor: '#D9534F',
    },
    menuText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
});

export default Profile;

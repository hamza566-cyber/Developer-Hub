import React, { useEffect, useState } from 'react';
import { View, Text, ImageBackground, StyleSheet, Alert, TouchableOpacity, TextInput, Dimensions} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import auth from '@react-native-firebase/auth';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import firestore from '@react-native-firebase/firestore';
import { useCallback } from 'react';


import { RootStackParamList } from '../App';

const { width, height } = Dimensions.get('window');

const Profile = ({ navigation }: NativeStackScreenProps<RootStackParamList, 'MainTabs'>) => {
    const [profilePic, setProfilePic] = useState('');
    const [userName, setUserName] = useState('');
    const [bio, setBio] = useState('');
    const userId = auth().currentUser?.uid;
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [postCount, setPostCount] =useState(0);

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
                console.error('Error fetching data:', (err as Error).message);
            }
        };

        fetchUserData();
        fetchFollowCount(); // ✅ Call the function here, NOT in the dependency array

    }, [userId, fetchFollowCount]); // ✅ Pass the function reference, NOT fetchFollowCount()



    const handleImageUpload = async () => {
        if (!userId) {
            Alert.alert('No user logged in');
            return;
        }

        console.log('Image upload button clicked'); // Check if button is clicked

        launchImageLibrary({ mediaType: 'photo' }, async (response) => {
            console.log('Image Picker Response:', response); // Log the full response for debugging

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
            console.log('Image URI selected:', uri); // Log the selected URI

            try {
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
            navigation.navigate('Login');
        } catch (err) {
            const error = err as Error;
            Alert.alert('Error logging out:', error.message);
        }
    };
    const fetchFollowCount = useCallback(async () => {
        try {
          if (!userId) {
            console.error('No user ID found');
            return;
          }

          const followersRef = firestore().collection('user').doc(userId).collection('followers');
          const followingRef = firestore().collection('user').doc(userId).collection('following');

          const postRef = firestore().collection('posts').where('userId', '==', userId);


          const followersSnapshot = await followersRef.get();
          const followingSnapshot = await followingRef.get();
          const postSnapshot = await postRef.get();

          setFollowersCount(followersSnapshot.size);
          setFollowingCount(followingSnapshot.size);
          setPostCount(postSnapshot.size);
        } catch (error) {
          console.error('Error fetching follow counts:', error);
        }
      }, [userId] );

      return (
        <View style={styles.mainContainer}>
            <View style={styles.profileHeader}>
                <TouchableOpacity onPress={handleImageUpload}>
                <ImageBackground
                    source={profilePic ? { uri: profilePic } : require('../images/profile.png')}
                    style={styles.profilePic}
                    imageStyle={{ borderRadius: 60 }}
                />
                </TouchableOpacity>
                <Text style={styles.nameText}>{userName || 'Your Name'}</Text>
                <TextInput style={styles.bioText}>{bio || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed et ullamcorper nisi.'}</TextInput>
            </View>

            <View style={styles.followContainer}>
                <View style={styles.followBox}>
                    <Text style={styles.followCount}>{postCount}</Text>
                    <Text style={styles.followLabel}>Posts</Text>
                </View>
                <View style={styles.followBox}>
                    <Text style={styles.followCount}>{followersCount}</Text>
                    <Text style={styles.followLabel}>Followers</Text>
                </View>
                <View style={styles.followBox}>
                    <Text style={styles.followCount}>{followingCount}</Text>
                    <Text style={styles.followLabel}>Following</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.followButton}>
                <Text style={styles.followButtonText}>Follow</Text>
            </TouchableOpacity>


        </View>
    );

};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#ffffff',
        padding: 20,
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 20,
    },
    profilePic: {
        width: 120,
        height: 120,
        marginBottom: 10,
    },
    nameText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 5,
    },
    bioText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginHorizontal: 10,
    },
    followContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    followBox: {
        alignItems: 'center',
    },
    followCount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    followLabel: {
        fontSize: 14,
        color: '#666',
    },
    followButton: {
        backgroundColor: '#6A9E3B',
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 5,
        alignItems: 'center',
    },
    followButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },

});

export default Profile;
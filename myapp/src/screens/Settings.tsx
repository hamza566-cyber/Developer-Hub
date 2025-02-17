import React,{useEffect, useState} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert,ImageBackground, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const Settings = () => {
  const navigation = useNavigation();
  const [profilePic, setProfilePic] = useState('');
  const [userName, setUserName] = useState('');
  const [bio, setBio] = useState('');
  const userId = auth().currentUser?.uid;

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

}, [userId, ]);

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
                      <ImageBackground 
                          source={profilePic ? { uri: profilePic } : require('../images/profile.png')} 
                          style={styles.profilePic} 
                          imageStyle={{ borderRadius: 60 }} 
                      />
                      <Text style={styles.nameText}>{userName || 'Your Name'}</Text>
                      <TextInput style={styles.bioText}>{bio || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed et ullamcorper nisi.'}</TextInput>
                  </View>
      <TouchableOpacity
        style={[styles.menuItem, { backgroundColor: '#80C255' }]}
        onPress={() => navigation.navigate('MainTabs', { screen: 'Dashboard' })}
      >
        <Icon name="home" size={25} color="#fff" style={styles.menuIcon} />
        <Text style={styles.menuText}>Home</Text>
        <Icon name="keyboard-arrow-right" size={25} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.menuItem, { backgroundColor: '#6A9E3B' }]}
        onPress={() => navigation.navigate('MainTabs', { screen: 'Settings' })}
      >
        <Icon name="settings" size={25} color="#fff" style={styles.menuIcon} />
        <Text style={styles.menuText}>Settings</Text>
        <Icon name="keyboard-arrow-right" size={25} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.menuItem, { backgroundColor: '#80C255' }]}
        onPress={() => navigation.navigate('About')}
      >
        <Icon name="info" size={25} color="#fff" style={styles.menuIcon} />
        <Text style={styles.menuText}>About</Text>
        <Icon name="keyboard-arrow-right" size={25} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.menuItem, styles.logoutButton, { backgroundColor: '#6A9E3B' }]}
        onPress={handleLogout}
      >
        <Icon name="logout" size={25} color="#fff" style={styles.menuIcon} />
        <Text style={[styles.menuText, { color: '#fff' }]}>Logout</Text>
        <Icon name="keyboard-arrow-right" size={25} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  menuIcon: {
    marginRight: 12,
  },
  menuText: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    color: '#fff',
  },
  logoutButton: {
    marginTop: 20,
  },
});

export default Settings;

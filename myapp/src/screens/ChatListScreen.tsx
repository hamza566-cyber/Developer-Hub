import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface Chat {
  id: string;
  userId: string;
  userName: string;
  profilePic: string;
  lastMessage: string;
  timestamp: any;
}

const ChatListScreen = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<Chat[]>([]);
  const [currentUserName, setUserName] = useState<string>('Anonymous');
  const [currentUserProfilePic, setProfilePic] = useState<string>('https://via.placeholder.com/50');
  const navigation = useNavigation();
  const currentUser = auth().currentUser;

  // Fetch current user's profile
  useEffect(() => {
    const fetchProfileData = async () => {
      const userId = currentUser?.uid;

      if (!userId) {
        console.log('User not logged in');
        return;
      }

      try {
        const userDocRef = firestore().collection('user').doc(userId);

        // Listen for real-time profile updates
        const unsubscribe = userDocRef.onSnapshot((doc) => {
          if (doc.exists) {
            const data = doc.data();
            const profilePicUrl = data?.profilePic || 'https://via.placeholder.com/50';
            const name = data?.name || 'Anonymos';
            console.log('Fetched Profile Pic URL:', profilePicUrl, 'and Name:', name);
            setProfilePic(profilePicUrl);
            setUserName(name);
          } else {
            console.log('Document does not exist');
          }
        });

        // Cleanup listener on unmount
        return unsubscribe;
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };

    fetchProfileData();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = firestore()
      .collection('chats')
      .where('users', 'array-contains', currentUser.uid)
      .onSnapshot(
        snapshot => {
          if (!snapshot.empty) {
            const chatList = snapshot.docs.map(doc => {
              const data = doc.data() || {};
              const userDetails = data.userDetails || [];
              const recipient = userDetails.find(user => user.userId !== currentUser.uid) || {};

              return {
                id: doc.id,
                userId: recipient.userId || '',
                userName: recipient.userName || 'Unknown User',
                profilePic: recipient.profilePic || 'https://via.placeholder.com/50',
                lastMessage: data.lastMessage || 'No messages yet',
                timestamp: data.lastMessageTimestamp || null,
              };
            });

            setChats(chatList);
          } else {
            setChats([]);
          }
        },
        error => {
          console.error('Error fetching chats:', error.message);
        }
      );

    return () => unsubscribe();
  }, []);

  const handleSearch = async (text: string) => {
    setSearchText(text);
  
    if (text.trim() === '') {
      setFilteredUsers([]);
      console.log('Search text is empty');
      return;
    }
  
    console.log('Searching for:', text);
  
    try {
      const usersSnapshot = await firestore()
        .collection('user')
        .where('name', '>=', text)
        .where('name', '<=', text + '\uf8ff')
        .get();
  
      if (!usersSnapshot.empty) {
        const users = usersSnapshot.docs
          .map(doc => {
            const data = doc.data() || {};
            console.log('User fetched:', data);
            return {
              id: doc.id,
              userId: doc.id,
              userName: data.name || 'Unknown User',
              profilePic: data.profilePic || 'https://via.placeholder.com/50',
              lastMessage: '',
              timestamp: null,
            };
          })
          .filter(user => user.userId !== currentUser?.uid);
  
        console.log('Filtered Users:', users);
  
        setFilteredUsers(users);
      } else {
        console.log('No users found');
        setFilteredUsers([]);
      }
    } catch (error) {
      
      console.error('Error searching users:', error.message);
    }
  };

  const openChat = async (user: Chat) => {
    const chatId = [currentUser?.uid, user.userId].sort().join('_');
  
    const chatRef = firestore().collection('chats').doc(chatId);
    const chatDoc = await chatRef.get();
  
    if (!chatDoc.exists) {
      // Ensure you fetch the latest recipient details from Firestore
      const recipientRef = firestore().collection('user').doc(user.userId);
      const recipientDoc = await recipientRef.get();
  
      if (recipientDoc.exists) {
        const recipientData = recipientDoc.data();
        const recipientProfilePic = recipientData?.profilePic || 'https://via.placeholder.com/50';
        const recipientName = recipientData?.name || 'Unknown User';
  
        await chatRef.set({
          users: [currentUser?.uid, user.userId],
          userDetails: [
            {
              userId: currentUser?.uid,
              userName: currentUserName,
              profilePic: currentUserProfilePic,
            },
            {
              userId: user.userId,
              userName: recipientName,
              profilePic: recipientProfilePic,
            },
          ],
          lastMessage: '',
          lastMessageTimestamp: firestore.FieldValue.serverTimestamp(),
        });
      } else {
        console.error('Recipient user document not found');
      }
    }
  
    navigation.navigate('ChatScreen', { chatId, recipientId: user.userId, recipientName: user.userName });
  };
  

  return (
    <View style={styles.container}>


            <View style={styles.header}>
              <Text style={styles.title}>Social Connect</Text>
              <View style={styles.iconContainer}>
                <Icon name="favorite-border" size={24} style={styles.headerIcon} />
                <TouchableOpacity onPress={() => handleNavigateToChatListScreen()}>
                <Icon name="send" size={24} style={styles.headerIcon} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={{height:8, backgroundColor:'#e5e5e5', marginTop:25}} />


      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Icon name="search" size={20} color="gray" />
        <TextInput
          placeholder="Search users..."
          value={searchText}
          onChangeText={handleSearch}
          style={styles.searchInput}
        />
      </View>

      {/* Display Search Results */}
      {searchText.length > 0 ? (
        <FlatList
          data={filteredUsers}
          keyExtractor={item => item.userId}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => openChat(item)} style={styles.chatItem}>
              <Image source={{ uri: item.profilePic }} style={styles.profilePic} />
              <Text style={styles.userName}>{item.userName}</Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        <FlatList
          data={chats}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => openChat(item)} style={styles.chatItem}>
              <Image source={{ uri: item.profilePic }} style={styles.profilePic} />
              <View style={styles.chatDetails}>
                <Text style={styles.userName}>{item.userName}</Text>
                <Text style={styles.lastMessage}>{item.lastMessage}</Text>
              </View>
              <Text style={styles.timestamp}>
                {item.timestamp ? new Date(item.timestamp.toDate()).toLocaleTimeString() : ''}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        
      },
      title: {
        fontSize: 28,
  
        fontFamily: 'DancingScript-Bold',
        color:'#0A1E3D',
      },
      iconContainer: {
        flexDirection: 'row',
        paddingTop: 15,
      },
      headerIcon: {
        marginLeft: 25,
      },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    marginTop:30,
  },
  searchInput: {
    flex: 1,
    padding: 10,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginTop:20,
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  chatDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  lastMessage: {
    color: 'gray',
  },
  timestamp: {
    color: 'gray',
  },
});

export default ChatListScreen;

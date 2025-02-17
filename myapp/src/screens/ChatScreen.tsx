import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: any;
}

const ChatScreen = ({ route }: any) => {
  const { chatId, recipientId, recipientName } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const [recipientProfilePic, setRecipientProfilePic] = useState<string | null>(null);
  const currentUser = auth().currentUser;


  const navigation = useNavigation();



  // Fetch recipient's profile picture
  useEffect(() => {
    const fetchRecipientProfile = async () => {
      try {
        const userDoc = await firestore().collection('user').doc(recipientId).get();
        if (userDoc.exists && userDoc.data()?.profilePic) {
          setRecipientProfilePic(userDoc.data()?.profilePic);
        } else {
          setRecipientProfilePic(null); 
        }
      } catch (error) {
        console.error('Error fetching recipient profile:', error.message);
      }
    };
    fetchRecipientProfile();
  }, [recipientId]);
  // Fetch messages in real-time
  useEffect(() => {
    const unsubscribe = firestore()
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .orderBy('timestamp', 'asc')
      .onSnapshot(
        snapshot => {
          if (!snapshot.empty) {
            const fetchedMessages = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
            })) as Message[];

            setMessages(fetchedMessages);
          } else {
            setMessages([]);
          }
        },
        error => {
          console.error('Error fetching messages:', error.message);
        }
      );

    return () => unsubscribe();
  }, [chatId]);

  // Send a new message
  // Send a new message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      // Create the 'messages' collection inside the 'chats' document
      await firestore()
        .collection('chats')
        .doc(chatId)
        .collection('messages') // Subcollection to store individual messages
        .add({
          senderId: currentUser?.uid,
          text: newMessage,
          timestamp: firestore.FieldValue.serverTimestamp(),
        });

      // Update last message and timestamp in chat document for ChatListScreen display
      await firestore().collection('chats').doc(chatId).set(
        {
          lastMessage: newMessage,
          lastMessageTimestamp: firestore.FieldValue.serverTimestamp(),
        },
        { merge: true } // Ensures only the fields are updated, not overwritten
      );

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error.message);
    }
  };


  const goback = ()=>{
    navigation.navigate('ChatListScreen');
  }


  // Render a single message item
  const renderMessageItem = ({ item }: { item: Message }) => {
    const isCurrentUser = item.senderId === currentUser?.uid;

    return (
      <View style={[styles.messageContainer, isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage]}>
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.timestamp}>
          {item.timestamp ? new Date(item.timestamp.toDate()).toLocaleTimeString() : ''}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Chat header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={()=>navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#6A9E3B" />
        </TouchableOpacity>
        {recipientProfilePic ? (
          <Image source={{ uri: recipientProfilePic }} style={styles.profilePic} />
        ) : (
          <Image source={require('../images/profile.png')} style={styles.profilePic} />
        )}
        <Text style={styles.recipientName}>{recipientName}</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity>
            <Icon name="videocam" size={24} color="#6A9E3B" style={styles.headerIcon} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Icon name="call" size={24} color="#6A9E3B" style={styles.headerIcon} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Message list */}
      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessageItem}
        contentContainerStyle={styles.messageList}
      />

      {/* Message input */}
      <View style={styles.messageInputContainer}>
        <TextInput
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
          style={styles.messageInput}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Icon name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 8,
  },
  recipientName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    color:'#0A1E3D',
  },
  headerIcons: {
    flexDirection: 'row',
    marginLeft: 'auto',
  },
  headerIcon: {
    marginLeft: 16,
  },
  messageList: {
    padding: 16,
    flexGrow: 1,
  },
  messageContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    maxWidth: '70%',
  },
  currentUserMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#0A1E3D',
  },
  otherUserMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#6A9E3B',
  },
  messageText: {
    fontSize: 16,
    color: '#fff',
  },
  timestamp: {
    fontSize: 10,
    color: '#fff',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  messageInput: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
  },
  sendButton: {
    padding: 12,
    backgroundColor: '#0A1E3D',
    borderRadius: 50,
  },
});

export default ChatScreen;

import React, { useState } from 'react';
import {
  View,
  Text,
  Alert,
  Modal,
  StyleSheet,
  ImageBackground,
  TextInput,
  Image,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getAuth } from '@react-native-firebase/auth';
import { addDoc, collection, getFirestore, serverTimestamp } from '@react-native-firebase/firestore';
import { launchImageLibrary } from 'react-native-image-picker';

const PostModal = ({ visible, userName, profilePic, onClose }) => {
  
  const auth = getAuth();
  const firestore = getFirestore();
  const [postText, setPostText] = useState('');
  const [image, setImage] = useState<string | null>(null);

  const imagePicker = async () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.didCancel) {
        Alert.alert('Image Selection cancelled');
        return;
      }
      if (!response.assets?.length) {
        Alert.alert('No image Selected');
        return;
      }
      const uri = response.assets[0].uri;
      if (uri) setImage(uri);
    });
  };

  const addPost = async () => {
    const user = auth.currentUser;
    if (!user) {
      console.log('User is not logged in');
      return;
    }
    if (!postText.trim() && !image) {
      Alert.alert('Post cannot be empty');
      return;
    }
    try {
      const newPost = {
        text: postText.trim(),
        image: image || null,
        userId: user.uid,
        timestamp: serverTimestamp(),
        profilePic: profilePic || null,
        userName: userName || null,
      }
      await addDoc(collection(firestore, 'posts'),newPost)
   
      setPostText('');
      setImage(null);
      Alert.alert('Post Added Successfully');
      
    } catch (error) {
      console.error('Error occurred', error);
      Alert.alert('Error', 'Failed to add the post');
    }
  };



  return (
    <Modal visible={visible} animationType='slide' onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer}>
        <Text style={styles.modalTitle}>Create Post</Text>
        <View style={styles.headerContainer}>
          <Image
            source={profilePic ? { uri: profilePic } : require('../images/profile.png')}
            style={styles.avatar}
          />
          <Text style={styles.modalUserName}>{userName}</Text>
          <Icon name='image' size={30} color={'#000'} style={styles.imageIcon} onPress={imagePicker} />
        </View>
        <TextInput
          placeholder='Write Your Post Here...'
          value={postText}
          onChangeText={setPostText}
          style={styles.modalInput}
        />
        {image && <Image source={{ uri: image }} style={styles.previewImage} />}
        <TouchableOpacity onPress={addPost}>
          <LinearGradient colors={['#80C255', '#6A9E3B']} style={styles.gradientButton}>
            <Text style={styles.buttonText}>Post</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginLeft: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#000',
  },
  modalUserName: {
    marginLeft: 10,
    fontWeight: '600',
  },
  imageIcon: {
    marginLeft: 'auto',
  },
  modalInput: {
    height: 100,
    width: '100%',
    backgroundColor: '#ffffff',
    color: '#000000',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  previewImage: {
    height: 200,
    width: '100%',
    marginTop: 20,
    resizeMode: 'cover',
    borderRadius: 8,
  },
  gradientButton: {
    borderRadius: 15,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    alignSelf: 'center',
    marginTop: 16,
  },
  closeButtonText: {
    color: '#007BFF',
    fontSize: 14,
  },
});

export default PostModal;

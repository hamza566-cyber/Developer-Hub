import {
  View, Text, TouchableOpacity, SafeAreaView, Modal, Image, TextInput, StyleSheet, FlatList, Alert} from 'react-native';
import React, { useEffect, useState } from 'react';
import auth, {getAuth}  from '@react-native-firebase/auth';
import { collection, getFirestore, onSnapshot, addDoc, doc } from '@react-native-firebase/firestore';
import { serverTimestamp } from '@react-native-firebase/firestore';

const CommentModal = ({ visible, onClose, postId }) => {


    const firestore = getFirestore();
    const [currentPostId, setCurrentPostId] = useState<string | null>(null);
    const [profilePic, setProfilePic] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState<{ id: string; text: string; userName: string; profilePic: string | null }[]>([]);



    useEffect(() => {
      const fetchProfileData = async () => {
        const userId = auth().currentUser?.uid;

        if (!userId) {
          console.log('User not logged in');
          return;
        }

        try {
          const userDocRef = firestore.collection('user').doc(userId);
          const unsubscribe = onSnapshot(userDocRef, (doc) => {
            if (doc.exists) {
              const profilePicUrl = doc.data()?.profilePic || null;
              const name = doc.data()?.name || null;
              console.log('Fetched Profile Pic URL:', profilePicUrl, 'and Name:', name);
              setProfilePic(profilePicUrl);
              setUserName(name);
            } else {
              console.log('Document does not exist');
            }
          });

          return unsubscribe; // Cleanup listener on unmount
        } catch (error) {
          console.error('Error fetching profile data:', error);
        }
      };

      fetchProfileData();

      return () => {
        // Cleanup listener
        if (fetchProfileData) fetchProfileData();
      };
    }, [auth, firestore]);

    // Update postId when received
    useEffect(() => {
        if (postId) {
            setCurrentPostId(postId);
            const unsubscribe = fetchComments(postId);
            return () => unsubscribe();
        }
    }, [postId]);

    const fetchComments = (postId: string) => {
      const commentsRef = collection(firestore, 'posts', postId, 'comments');
      const unsubscribe = onSnapshot(commentsRef, (snapshot) => {
        const fetchedComments = snapshot.docs.map((doc) => ({
          id: doc.id,
          text: doc.data().text || '',  // Default value if no text
          userName: doc.data().userName || '',  // Default value if no userName
          profilePic: doc.data().profilePic || null,  // Default value if no profilePic
          userId: doc.data().userId || '',
        }));
          setComments(fetchedComments);
      });
      return unsubscribe;
    };

    const addComment = async () => {
      const user = auth().currentUser;

      if (!user || !currentPostId) {
        Alert.alert('Error', 'User not logged in or no post selected');
        return;
      }

      if (!commentText.trim()) {
        Alert.alert('Error', 'Comment cannot be empty');
        return;
      }

      try {

        const commentData = {
          text: commentText.trim(),
          userId: user.uid,
          userName: userName,
          profilePic: profilePic,
          timestamp: serverTimestamp(),
        };


        const postRef = doc(firestore, 'posts', currentPostId);
        const commentsRef = collection(postRef, 'comments');

        await addDoc(commentsRef, commentData);

        setCommentText('');
        Alert.alert('Success', 'Comment added successfully');
      } catch (error) {
        console.error('Error adding comment:', error);
        Alert.alert('Error', 'Failed to add comment');
      }
    };

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={() => onClose()}>
            <SafeAreaView style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Comments</Text>

                {/* Comments List */}
                <FlatList
                    data={comments}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.commentCard}>
                            <Image
                                source={item.profilePic ? { uri: item.profilePic } : require('../images/profile.png')}
                                style={styles.commentProfilePic}
                            />
                            <View>
                                <Text style={styles.commentUserName}>{item.userName}</Text>
                                <Text style={styles.commentText}>{item.text}</Text>
                            </View>
                        </View>
                    )}
                />

                <View style={styles.commentInputContainer}>
                    <TextInput
                        placeholder="Write a comment..."
                        value={commentText}
                        onChangeText={setCommentText}
                        style={styles.commentInput}
                    />
                    <TouchableOpacity onPress={addComment} style={styles.commentButton}>
                        <Text style={styles.commentButtonText}>Post</Text>
                    </TouchableOpacity>
                </View>

                {/* Close Modal */}
                <TouchableOpacity onPress={() => onClose()} style={styles.closeButton}>
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
        justifyContent: 'flex-start',
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
    commentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
    },
    commentProfilePic: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 8,
    },
    commentUserName: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    commentText: {
        fontSize: 14,
        color: '#555',
    },
    commentInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
    },
    commentInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 8,
        marginRight: 8,
    },
    commentButton: {
        backgroundColor: '#007BFF',
        padding: 8,
        borderRadius: 8,
    },
    commentButtonText: {
        color: 'white',
        fontSize: 14,
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

export default CommentModal;

import { View, Text, Alert,ImageBackground, StyleSheet, SafeAreaView, TextInput, FlatList, Image, TouchableOpacity, ScrollView, Modal } from 'react-native';
import React, { useEffect, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { launchImageLibrary, ImageLibraryOptions } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { addDoc, collection, getDocs, getFirestore, onSnapshot, serverTimestamp } from '@react-native-firebase/firestore';
import { getAuth } from '@react-native-firebase/auth';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {useSharedValue, useAnimatedStyle, withSpring} from 'react-native-reanimated';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';

type DashboardProps = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

const Dashboard = ({ navigation }: DashboardProps) => {
  const firestore = getFirestore();
  const auth = getAuth();

  // State Variables

  const scale = useSharedValue(1);
  const [currentPostId, setCurrentPostId] = useState<string | null>(null); // Tracks the selected post for comments
  const [comments, setComments] = useState<{ id: string; text: string; userName: string; profilePic: string | null }[]>([]);
  const [commentText, setCommentText] = useState<string>('');


  const [modal1Visible, setModal1Visible] = useState(false);

  const[modalVisible, setModalVisible] = useState(false);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [postText, setPostText] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [posts, setPosts] = useState<{ id: string; userId:string, text: string; image: string | null, userName: string, profilePic: string | null,  likes?: string[],commentCount :string, timestamp: string }[]>([]);

 const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  useEffect(() => {
    const fetchProfileData = async () => {
      const userId = auth.currentUser?.uid;
  
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

  // Image Picker Function
  const imagePicker = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo', // Ensure 'photo', 'video', or 'mixed'
      quality: 1, // Between 0 (lowest quality) and 1 (highest quality)
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User Cancelled Image Picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error:', response.errorMessage);
      } else {
        const uri = response.assets?.[0]?.uri;
        if (uri) {
          setImage(uri);
        }
      }
    });
  };

  // Post Submission
  const addPost = async () => {
    const user = auth.currentUser;
    if (!user) {
      console.log('User is not logged in');
      return;
    }
    if (!postText.trim() && !image) {
      Alert.alert('Post cannot be empty');
    }
    try {
      const newPost = {
        text: postText.trim(),
        image: image || null,
        userId: user.uid,
        timestamp: serverTimestamp(),
        profilePic: profilePic || null,
        userName: userName || null, // Include name in the post (userName)
      };
      const docRef = await addDoc(collection(firestore, 'posts'), newPost);
      console.log('Post added with id ', docRef.id);
      setPostText('');
      setImage(null);

      Alert.alert('Post Added Successfully');
    } catch (error) {
      console.log('Error occurred', error);
      Alert.alert('Error', 'Failed to add the post');
    }
  };
  const toggleLike = async (postId: string) => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      Alert.alert('Error', 'User not logged in');
      return;
    }
  
    try {
      scale.value = withSpring(1.5, {}, () => {
        scale.value = withSpring(1); // Reset back to the original size
      });
      const postRef = firestore.collection('posts').doc(postId);
      const postSnapshot = await postRef.get();
  
      if (postSnapshot.exists) {
        const post = postSnapshot.data();
        const likes = post?.likes || []; // Default to an empty array if no likes exist
  
        if (likes.includes(userId)) {
          // User already liked the post, so remove the like
          await postRef.update({
            likes: likes.filter((id: string) => id !== userId),
          });
          console.log('Removed like');
        } else {
          // Add the like for this user
          await postRef.update({
            likes: [...likes, userId], // Add the user ID to the likes array
          });
          console.log('Added like');
        }
      } else {
        console.log('Post not found');
      }
    } catch (error) {
      console.error('Error updating likes:', error);
    }
  };

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
    const user = auth.currentUser;
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
        userName: userName || 'Anonymous',
        profilePic: profilePic || null,
        timestamp: serverTimestamp(),
      };
      const commentsRef = collection(firestore, 'posts', currentPostId, 'comments');
      await addDoc(commentsRef, commentData);
      setCommentText(''); // Clear input
      Alert.alert('Success', 'Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment');
    }
  };
  const handleNavigateToProfile = (userId: string) => {
    navigation.navigate('VisitorProfile', { userId });
};


useEffect(() => {
  const unsubscribe = onSnapshot(collection(firestore, 'posts'), async (snapshot) => {
    // Fetch all posts and their related data
    const fetchedPosts = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const postId = doc.id;

        // Get the comment count for the post
        const commentsSnapshot = await getDocs(doc.ref.collection('comments'));
        const commentCount = commentsSnapshot.size;

        // Check the document data and log it
        const postData = doc.data();
        console.log(postData); // Add this to inspect the userId and other fields

        return {
          id: postId,
          text: postData.text || '',
          image: postData.image || null,
          userName: postData.userName || '',
          profilePic: postData.profilePic || null,
          likes: postData.likes || [],
          timestamp: postData.timestamp ? postData.timestamp.toDate() : null,
          userId: postData.userId || '', // Ensure userId is being fetched here
          commentCount: commentCount.toString(),
        };
      })
    );

    // Update the state with fetched posts
    setPosts(fetchedPosts);
  });

  // Clean up on component unmount
  return () => unsubscribe();
}, [firestore]);

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};
  return (
    <SafeAreaView style={styles.mainContainer}>
      <ScrollView>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.title}>Social Connect</Text>
        <View style={styles.iconContainer}>
          <Icon name="favorite-border" size={24} style={styles.headerIcon} />
          <Icon name="send" size={24} style={styles.headerIcon} />
        </View>
      </View>

    <View style={{height:8, backgroundColor:'#e5e5e5', marginTop:15}}></View>


        <View style={styles.postInputContainer} >
          <View style={styles.profileSection}>
          <ImageBackground
            source={profilePic ? { uri: profilePic } : require('../images/profile.png')}
            style={styles.avatar}
          />
          </View>
          <TouchableOpacity onPress={() => setModal1Visible(true)} style={styles.newPost} >
        <Text style={{color:'#aaa',fontSize:16}}> What's in your mind</Text>
        </TouchableOpacity>
        </View>


        {/* Modal for Creating Post */}
        <Modal visible={modal1Visible} animationType="slide" onRequestClose={() => setModal1Visible(false)}>
          <SafeAreaView style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Create Post</Text>
            {/* Add form inputs for post */}

          <View style={{flexDirection:'row'}}>
              <View style={styles.profileSectionPost}>
                  <ImageBackground
                  source={profilePic ? { uri: profilePic } : require('../images/profile.png')}
                  style={styles.avatar}
                />
          </View>
              <Text style={styles.modaluserName}>{userName}</Text>
              <Icon name='image' size={30} color={'#000'} style={styles.modalImageicon} onPress={imagePicker}/>
          </View>

            <TextInput
              placeholder="Write Your Post Here..."
              value={postText}
              onChangeText={setPostText}
              style={styles.modalInput}
            />
            {image && <Image source={{ uri: image }} style={styles.previewImage} />}
 
            <TouchableOpacity onPress={addPost} style={styles.PostButton}>
            <LinearGradient
                                                         colors={['#80C255', '#6A9E3B']}
                                                         start={{ x: 0, y: 0 }}
                                                         end={{ x: 1, y: 1 }}
                                                         style={styles.gradientButtonBackground}
                                                     >
                                                         <Text style={styles.buttonText}>Post</Text>
                                                     </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModal1Visible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </Modal>
      
``````<View style={{height:6, backgroundColor:'#e5e5e5', marginTop:6}}></View>

      {/* Posts Feed */}
      <FlatList
  data={posts}
  keyExtractor={(item) => item.id}
  contentContainerStyle={styles.postsList}
  ItemSeparatorComponent={() => (
    <View style={{ height: 6, backgroundColor: '#e5e5e5' }} />
  )}  renderItem={({ item }) => {
    const userLiked = auth.currentUser?.uid 
      ? item.likes?.includes(auth.currentUser.uid)
      : false;

    return (
      <View style={styles.postCard}>
        <View>
        <TouchableOpacity
                style={styles.postHeader}
                onPress={()=>handleNavigateToProfile(item.userId)}
              >
          <Image
            source={item.profilePic ? { uri: item.profilePic } : require('../images/profile.png')}
            style={styles.postHeaderProfilePic}
          />
          
          <View>
            <Text style={styles.Headerusername}>{item.userName}</Text>
            <Text style={styles.SuggestedForYou}>Suggested For You</Text>
          </View>
          <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.followButton}>
            <Text style={styles.followButtonText}>Follow</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.moreOptions}>
            <Icon name="more-vert" size={20} color="#000" />
          </TouchableOpacity>
        </View>
          </TouchableOpacity>

        </View>
        



        {item.image && <Image source={{ uri: item.image }} style={styles.postImage} />}

        <View style={styles.iconsContainer}>
          <TouchableOpacity onPress={() => toggleLike(item.id)}>
          <Animated.View style={animatedStyle}>
        <Icon
          name={userLiked ? 'favorite' : 'favorite-border'}
          size={24}
          color={userLiked ? 'red' : 'black'}
          style={styles.LoveIcon}
        />
        </Animated.View>

     
          </TouchableOpacity>
          <Text>{item.likes?.length || 0} Likes</Text>

          <TouchableOpacity
              onPress={() => {
                setCurrentPostId(item.id); // Set current post ID
                setModalVisible(true); // Open comment modal
                fetchComments(item.id); // Fetch comments for this post
              }}
          >
            <Icon name="chat-bubble-outline" size={24} style={styles.CommentIcon} />
            </TouchableOpacity>;
            <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
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

    {/* Add Comment Section */}
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
    <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
      <Text style={styles.closeButtonText}>Close</Text>
    </TouchableOpacity>
  </SafeAreaView>
</Modal>;

        <Text>{item.commentCount}</Text>

          <Icon name="send" size={23} style={styles.sendIcon} />
        </View>

        <View style={styles.postFooter}>
          <Text style={styles.postFootername}>{item.userName}</Text>
          <Text style={styles.postFooterText}>{item.text}</Text>
        </View>
        <Text style={styles.timestamp}>
          {item.timestamp ? formatDate(new Date(item.timestamp)) : 'Just now'}
        </Text>
      </View>
    );
  }}
/>

      </ScrollView>
    </SafeAreaView>
  );
}; 
  const styles = StyleSheet.create({
    mainContainer: {
      flex: 1,
      backgroundColor: '#F9F9F9',
      paddingTop: 10,
      padding:wp('0%'),
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 10,
      padding:wp('2%'),
    },
    title: {
      fontSize: 28,
      fontFamily: 'DancingScript-Regular',
      color:'#0A1E3D',
    },
    iconContainer: {
      flexDirection: 'row',
      paddingTop: 15,
    },
    headerIcon: {
      marginLeft: 25,
    },

    postInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding:10,
      marginTop:20,
    },
    profileSection: {
      width: 50, // Adjust size as needed
      height: 50,
      borderRadius: 25,
      overflow: 'hidden', 
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#000',
    },
    profileSectionPost:{      width: 50, // Adjust size as needed
      height: 50,
      borderRadius: 25,
      overflow: 'hidden', 
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#000',
    marginTop:20,},
    avatar: {
      width: '100%',
      height: '100%',
    },
    newPost: {
    marginLeft:20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#f9f9f9',
    paddingRight:90, 
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      marginVertical: 10,
    },
    previewImage: {
      height: 200,
      width: '100%',
      marginTop:40,
       // Instagram portrait ratio (optional)
      resizeMode: 'cover', // Crop the image to fill the container
      borderRadius: 0,
    },
    postsList: {
      marginTop: 20,
    },
    postCard: {
      padding: 0,
      borderRadius: 10,
      marginBottom: 10,
      backgroundColor: '#F9F9F9',

    },
    postImage: {
      width: '100%', // Full width of the container
      height: undefined,
      aspectRatio: 4 / 5, // Instagram portrait ratio (optional)
      resizeMode: 'cover', // Crop the image to fill the container
      borderRadius: 0, // Optional rounded corners
      marginTop: 10,
    },
    UploadButton:{
        backgroundColor:'#fff',
        justifyContent:'center',
        borderRadius:12,
        borderWidth:1,
        paddingTop:10,
        paddingBottom:10,
        paddingLeft:10,
        paddingRight:10,
    },

    postHeaderProfilePic:{
      width:40,
      height:40,
      borderRadius:60,
    },
    postHeader:{
      flexDirection:'row',
      justifyContent:'flex-start',
      padding:10,

    },
    Headerusername:{
      fontSize:15,
      color:'#000',
      marginLeft:12,
      fontWeight:'500',

    },
    SuggestedForYou:{
      fontSize:10,
      marginTop:3,
      marginLeft:12,
    },
    headerpostIcon:{
      position:'absolute',
      left:320,
      top:20,
    },
    PostFollow:{
      backgroundColor:'#e5e5e5',
      justifyContent:'center',
      borderRadius:8,
      borderWidth:1,
      paddingLeft:13,
      paddingRight:13,
      position:'relative',
      left:100,
    },
    postFooter:{
      paddingLeft:20,
      paddingRight:20,
      paddingTop:13,
      flexDirection:'row',

    },
    postFooterwithoutImage:{
      paddingLeft:40,
      paddingRight:40,
      paddingTop:13,
      flexDirection:'row',

    },
    postFootername:{
      fontSize:14,
      fontWeight:'600',

    },
    postFooterNamewithoutImage:{
      fontSize:14,
      fontWeight:'600',
    },
    postFooterText:{
      fontSize:13,
      fontWeight:'400',
      paddingLeft:8,
      paddingTop:1,
    },
    iconsContainer:{
      paddingLeft:20,
      paddingRight:20,
      paddingTop:7,
      flexDirection:'row',

    },
    LoveIcon:{},
    sendIcon:{
      paddingLeft:35,
    },
    CommentIcon:{
      paddingLeft:35,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: 'white',
      padding: 16,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 8,
      borderBottomWidth:1,
      borderBottomColor:'#000',
      marginLeft:10,
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
    timestamp: {
      fontSize: 12,
      color: '#888',
      marginTop: 4,
      marginLeft:18,
    },


    modalInput: {
      height: 100,
      width: '100%',
      backgroundColor: '#ffffff',
      color:'#000000',
      padding: 10,
      borderRadius: 8,
    },


    actionContainer: {
      flexDirection: 'row',
      alignItems:'center',

    },
    followButton: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      backgroundColor: '#ffffff', // Blue color for the button
      borderRadius: 20,
      marginLeft:100,
      borderWidth:1,
      borderColor:'#000000',
    },
    followButtonText: {
      color: '#000',
      fontSize: 14,
    },
    moreOptions: {
      padding: 5,
    },
    modaluserName:{
      marginTop:30,
      marginLeft:10,
      fontWeight:'600'
    },
    modalImageicon:{
      marginTop:30,
      marginLeft:190,
      
    },
    gradientButtonBackground: {
      borderRadius: 15,
      paddingVertical: 17,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop:60,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
},

  });
  
  export default Dashboard; 
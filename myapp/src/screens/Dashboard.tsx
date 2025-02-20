import { View, Text, Alert,ImageBackground, StyleSheet, SafeAreaView, FlatList, Image, TouchableOpacity, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {  collection, getDocs, getFirestore, onSnapshot, doc,updateDoc,getDoc, deleteDoc, setDoc } from '@react-native-firebase/firestore';
import { getAuth } from '@react-native-firebase/auth';

import CommentModal from '../modals/CommentModal';
import PostModal from '../modals/PostModal';

import Animated, {useSharedValue, useAnimatedStyle, withSpring} from 'react-native-reanimated';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import ChatListScreen from './ChatListScreen';

type DashboardProps = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

const Dashboard = ({ navigation }: DashboardProps) => {
  const firestore = getFirestore();
  const auth = getAuth();

  // State Variables

  const scale = useSharedValue(1);
  const [currentPostId, setCurrentPostId] = useState<string | null>(null); // Tracks the selected post for comments
  const [userName, setUserName] = useState<string | null>(null);



  const [modalVisible, setModalVisible] = useState(false);
  const [commentModalVisible, setCommentModalVisible] = useState(false);

  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [posts, setPosts] = useState<{ id: string; userId:string, text: string; image: string | null, userName: string, profilePic: string | null,  likes?: string[],commentCount :string, timestamp: string }[]>([]);

  const [followingStatus, setFollowingStatus] = useState<{[key: string]: boolean}>({});

  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);


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
            setUserName(doc.data()?.name);
          } else {
            console.log('Document does not exist');
          }
        });

        return () => unsubscribe; 
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


  const fetchComments = (postId: string) => {
  };


  const toggleLike = async (postId: string) => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      Alert.alert('Error', 'User not logged in');
      return;
    }

    try {
      // Like animation (optional)
      scale.value = withSpring(1.5, {}, () => {
        scale.value = withSpring(1);
      });

      const postRef = doc(firestore, 'posts', postId);
      const postSnapshot = await getDoc(postRef);

      if (postSnapshot.exists) {
        const post = postSnapshot.data();
        const likes = post?.likes || [];

        if (likes.includes(userId)) {
          // Unlike: Remove user ID from likes array
          await updateDoc(postRef, {
            likes: likes.filter((id: string) => id !== userId),
          });
          console.log('Removed like');
        } else {
          // Like: Add user ID to likes array
          await updateDoc(postRef, {
            likes: [...likes, userId],
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



  const handleNavigateToProfile = (userId: string) => {
    navigation.navigate('VisitorProfile', { userId });
};

const handleNavigateToChatListScreen = () => {
  navigation.navigate('ChatListScreen');
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
          userId: postData.userId || '', 
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

const handleConsole = async ()=>{

  setModalVisible(false);
  setCommentModalVisible(false);
  console.log('modalClosed');
};

const checkisfollowing = async ( targetuserId : string)=>{
  const currentUser = auth.currentUser;

  if(!currentUser){
    Alert.alert('User Not Logged In');
    return;
  }
  const followRef = doc(firestore, 'user', currentUser.uid, 'following', targetuserId);
  const followDoc = await getDoc(followRef);
  return followDoc.exists();
};

const toggleFollow = async(targetuserId: string) =>{
  const currentUser = auth.currentUser;
  if(!currentUser){
    Alert.alert('User not logged in');
    return;
  }
  const followRef = doc(firestore, 'user', currentUser.uid, 'following', targetuserId);
  const follwerRef = doc(firestore, 'user', targetuserId, 'followers', currentUser.uid);
  const isFollowing = followingStatus[targetuserId];

  try{
    if(isFollowing){
      await deleteDoc(followRef);
      await deleteDoc(follwerRef);
      setFollowingStatus((prev)=> ({...prev,[targetuserId]:false}));
    }
    else{
      await setDoc(followRef,{followedAt : new Date()});
      await setDoc(follwerRef, {follwedAt : new Date()});
      setFollowingStatus((prev) =>({...prev, [targetuserId]: true}));
    }
  }
  catch (error) {
    console.error('Error updating follow status:', error);
  }
};

const deletePost = async (postId: string) =>{

  try {

    const PostRef = doc(firestore, 'posts', postId);
    await deleteDoc(PostRef);

    Alert.alert('Success', 'Post Deleted Successfuly');
  } catch (error) {
    console.error('Error deleting post', error);
  }

};
  const confirmDeletePost = async(postId: string)=>{

    Alert.alert(
      'Delete Post',
      'Are u sure u want to delete post?',
      [
        {text: 'Cancel', style: 'cancel'},
        {text :'Delete' , style:'destructive', onPress:()=>deletePost(postId) },
      ]
    );

  };

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};
return (
  <SafeAreaView style={styles.mainContainer}>
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.postsList}
      ItemSeparatorComponent={() => (
        <View style={{ height: 6, backgroundColor: '#e5e5e5' }} />
      )}
      nestedScrollEnabled={true}
      // This handles everything above the posts
      ListHeaderComponent={
        <>
          {/* Header Section */}
          <View style={styles.header}>
            <Text style={styles.title}>Social Connect</Text>
            <View style={styles.iconContainer}>
              <Icon name="favorite-border" size={24} style={styles.headerIcon} />
              <TouchableOpacity onPress={handleNavigateToChatListScreen}>
                <Icon name="send" size={24} style={styles.headerIcon} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 8, backgroundColor: '#e5e5e5', marginTop: 15 }} />

          {/* New Post Section */}
          <View style={styles.postInputContainer}>
            <View style={styles.profileSection}>
              <ImageBackground
                source={profilePic ? { uri: profilePic } : require('../images/profile.png')}
                style={styles.avatar}
              />
            </View>
            <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.newPost}>
              <Text style={{ color: '#aaa', fontSize: 16 }}>What's in your mind</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 6, backgroundColor: '#e5e5e5', marginTop: 6 }} />
        </>
      }
      // Render each post
      renderItem={({ item }) => {
        const userLiked = auth.currentUser?.uid
          ? item.likes?.includes(auth.currentUser.uid)
          : false;

        return (
          <View style={styles.postCard}>
            <TouchableOpacity
              style={styles.postHeader}
              onPress={() => handleNavigateToProfile(item.userId)}
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
                <TouchableOpacity style={styles.followButton} onPress={() => toggleFollow(item.userId)}>
                  <Text style={styles.followButtonText}>
                    {followingStatus[item.userId] ? 'Following' : 'Follow'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.moreOptions}
                  onPress={() => setSelectedPostId(selectedPostId === item.id ? null : item.id)}
                >
                  <Icon name="more-vert" size={20} color="#000" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>

            {selectedPostId === item.id && (
              <View style={styles.optionsMenu}>
                <TouchableOpacity onPress={() => confirmDeletePost(item.id)} style={styles.deleteButton}>
                  <Icon name="delete" size={24} color="red" />
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}

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
                  setCommentModalVisible(true);
                  setCurrentPostId(item.id);
                  fetchComments(item.id);
                }}
              >
                <Icon name="chat-bubble-outline" size={24} style={styles.CommentIcon} />
              </TouchableOpacity>
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

    {/* Modals */}
    <PostModal
      visible={modalVisible}
      onClose={handleConsole}
      userName={userName}
      profilePic={profilePic}
      setVisible={setModalVisible}
    />
    <CommentModal
      visible={commentModalVisible}
      onClose={handleConsole}
      setVisible={setCommentModalVisible}
      postId={currentPostId}
    />
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
    marginTop:20},
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
      width: '100%',
      height: undefined,
      aspectRatio: 4 / 5,
      resizeMode: 'cover',
      borderRadius: 0,
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
      justifyContent: 'flex-start',
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
      backgroundColor: '#ffffff',
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
      fontWeight:'600',
    },
    modalImageicon:{
      marginTop:30,
      marginLeft:100,

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

postButton:{},

   optionsMenu: {
    position: 'absolute',
    right: 10,
    top: 25,
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 5,
    elevation: 5, // for shadow effect on Android
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  deleteText: {
    marginLeft: 5,
    color: 'red',
    fontSize: 14,
  },

  });

  export default Dashboard;

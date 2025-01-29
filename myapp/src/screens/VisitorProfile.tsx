import React, { useEffect, useState } from 'react';
import { View, Text, ImageBackground, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

interface Post {
    id: string;
    text: string;
    image: string | null;
    userName: string;
    profilePic: string | null;
    likes: string[];
    timestamp: any;
    userId: string;
    commentCount: string;
}

interface UserData {
    name: string;
    profilePic: string;
    bio: string;
}

const VisitorProfile = ({ route }: NativeStackScreenProps<RootStackParamList, 'VisitorProfile'>) => {
    const [userData, setUserData] = useState<UserData>({
        name: '',
        profilePic: '',
        bio: '',
    });
    const [posts, setPosts] = useState<Post[]>([]);
    const { userId } = route.params;

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userDoc = await firestore().collection('user').doc(userId).get();
                if (userDoc.exists) {
                    const data = userDoc.data();
                    if (data) {
                        setUserData({
                            name: data.name || 'Unknown User',
                            profilePic: data.profilePic || '',
                            bio: data.bio || '',
                        });
                    }
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };
        fetchUserData();
    }, [userId]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const postsSnapshot = await firestore()
                    .collection('posts')
                    .where('userId', '==', userId)
                    .get();
                
                const postsData = await Promise.all(postsSnapshot.docs.map(async (doc) => {
                    const postData = doc.data();
                    const postId = doc.id;

                    const commentsSnapshot = await firestore()
                        .collection('comments')
                        .where('postId', '==', postId)
                        .get();
                    const commentCount = commentsSnapshot.size;

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
                }));

                setPosts(postsData);
            } catch (error) {
                console.error('Error fetching posts:', error);
            }
        };

        if (userData.name) {
            fetchPosts();
        }
    }, [userData.name, userId]);

    return (
        <View style={styles.container}>
            <View style={styles.imageContainer}>
                <ImageBackground
                    source={require('../images/backgroundImage.jpg')}
                    style={styles.blackBackground}
                />
            </View>

            <View style={styles.profilePicContainer}>
                <ImageBackground
                    source={userData.profilePic ? { uri: userData.profilePic } : require('../images/profile.png')}
                    style={styles.profilePic}
                    imageStyle={{ borderRadius: 60 }}
                />
            </View>

            <Text style={styles.nameText}>{userData.name || 'User Name'}</Text>
            <Text style={styles.bioText}>{userData.bio || 'This user has no bio yet.'}</Text>

            {posts.length > 0 && (
                <View style={styles.recentPostsContainer}>
                    <Text style={styles.recentPostsTitle}>Recent Posts</Text>
                    <FlatList
                        data={posts}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <View style={styles.postItem}>
                                <Text style={styles.postTitle}>{item.text}</Text>
                                {item.image && <ImageBackground source={{ uri: item.image }} style={styles.postImage} />}
                                <Text style={styles.postUserName}>{item.userName}</Text>
                                <Text style={styles.postLikes}>Likes: {item.likes.length}</Text>
                                <Text style={styles.postCommentCount}>Comments: {item.commentCount}</Text>
                                <TouchableOpacity style={styles.viewPostButton}>
                                    <Text style={styles.viewPostText}>View Post</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                </View>
            )}
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
        height: 150,
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
        marginTop: 20,
        alignItems: 'center',
    },
    profilePic: {
        width: 100,
        height: 100,
        borderRadius: 60,
    },
    nameText: {
        fontSize: 28,
        marginTop: 10,
        color: '#666',
    },
    bioText: {
        fontSize: 16,
        marginTop: 5,
        color: '#777',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    recentPostsContainer: {
        marginTop: 20,
        width: '80%',
    },
    recentPostsTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 10,
    },
    postItem: {
        backgroundColor: '#fff',
        padding: 15,
        marginBottom: 15,
        borderRadius: 10,
        elevation: 2,
    },
    postTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    postUserName: {
        fontSize: 14,
        color: '#555',
        marginTop: 5,
    },
    postLikes: {
        fontSize: 14,
        color: '#555',
        marginTop: 5,
    },
    postCommentCount: {
        fontSize: 14,
        color: '#555',
        marginTop: 5,
    },
    postImage: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        marginTop: 10,
    },
    viewPostButton: {
        marginTop: 10,
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 5,
    },
    viewPostText: {
        color: '#fff',
        fontWeight: '600',
    },
});

export default VisitorProfile;

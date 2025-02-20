import { View, Text, Image, StyleSheet, Button, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'

const OnboardingScreens = ({navigation}) => {

    const[currentPage, setCurrentPage] = useState(0);
    const pages= [
        {
            title:"Welcome to Social Connect",
            description: " Discover new friends, share moments, and stay connected",
            image: require('../images/socialconnect.png'),
        },
        {
            title:"Share Your World",
            description: " Post your thoughts, see what others are up to, and stay engaged with your friends.",
            image: require('../images/onBoarding.webp'),
        },
        {
            title:"Chat Anytime, Anywhere",
            description: " Stay in touch with real-time chats. Message your friends and grow your social network.",
            image: require('../images/onBoarding3.jpeg'),
        },
    ];

    const handleNext = () =>{
        if(currentPage < pages.length-1){
            setCurrentPage(currentPage + 1);
        }
        else{
            navigation.replace('Login');
        }
    }
    const handleSkip = () =>{
        navigation.replace('Login');
    }

    return (
        <View style={styles.container}>
          <Image source={pages[currentPage].image} style={styles.image} />
          <Text style={styles.title}>{pages[currentPage].title}</Text>
          <Text style={styles.description}>{pages[currentPage].description}</Text>
    
          <View style={styles.buttonContainer}>
            {currentPage < pages.length - 1 && (
              <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>
            )}
            <Button
              title={currentPage === pages.length - 1 ? 'Get Started' : 'Next'}
              onPress={handleNext}
            />
          </View>
        </View>
      );
    };
    
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#ffffff',
      },
      image: {
        width: 400,
        height: 200,
        marginBottom: 24,
      },
      title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
      },
      description: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 32,
        color: '#666',
      },
      buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 16,
      },
      skipButton: {
        padding: 10,
      },
      skipText: {
        color: '#888',
        fontSize: 16,
      },
    });
export default OnboardingScreens
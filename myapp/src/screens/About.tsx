import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const About = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>About Social Connect</Text>
      <Text style={styles.description}>
        Welcome to Social Connect, your go-to platform for staying connected with the world. 
        Our mission is to create meaningful connections, foster friendships, and bring 
        people together through seamless communication and sharing.
      </Text>

      <Text style={styles.sectionTitle}>Our Features</Text>
      <Text style={styles.description}>
        - Share your thoughts and moments with posts and photos.{'\n'}
        - Follow friends and family to see what they’re up to.{'\n'}
        - Engage with posts through likes and comments.{'\n'}
        - Enjoy real-time chat to stay connected anytime, anywhere.
      </Text>

      <Text style={styles.sectionTitle}>Our Vision</Text>
      <Text style={styles.description}>
        At Social Connect, we believe that genuine connections can change the world. 
        We aim to create a platform where everyone feels valued, heard, and inspired 
        to share their story.
      </Text>

      <Text style={styles.sectionTitle}>Contact Us</Text>
      <Text style={styles.description}>
        Have questions, feedback, or need support? Feel free to contact us at:
      </Text>
      <Text style={styles.contact}>Email: support@socialconnect.com</Text>
      <Text style={styles.contact}>Phone: +1 (234) 567-8901</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
    marginBottom: 16,
    textAlign: 'justify',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6A9E3B',
    marginBottom: 8,
  },
  contact: {
    fontSize: 16,
    color: '#80C255',
    marginBottom: 4,
  },
});

export default About;

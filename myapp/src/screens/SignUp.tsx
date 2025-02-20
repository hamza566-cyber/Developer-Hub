import React from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, Alert } from 'react-native';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { ToastAndroid } from 'react-native'; 

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';


const validationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid Email').required('Email is Required'),
    password: Yup.string().min(4, 'Password must be at least 4 characters').max(10, 'Password must be at most 10 characters').required('Password is Required'),
    confirmPassword: Yup.string().oneOf([Yup.ref('password'), undefined], 'Passwords must match').required('Confirm Password is required'),
});

export default function SignUp() {
    const navigation = useNavigation();

    const handleSignup = async (values) => {
        const { name, email, password } = values;
        try {
            const existingUser = await firestore()
                .collection('user')
                .where('email', '==', email)
                .get();
            if (!existingUser.empty) {
                Alert.alert('This Email is already registered.');
                return;
            }

            const userCredentials = await auth().createUserWithEmailAndPassword(email, password);

            const userId = userCredentials.user.uid;

            await firestore().collection('user').doc(userId).set({
                name: name,
                email: email,
                password: password,
            });
            ToastAndroid.show('Account created successfully!', ToastAndroid.SHORT);
            navigation.navigate('Login'); 
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    return (
        <Formik
            initialValues={{ name: '', email: '', password: '', confirmPassword: '' }}
            onSubmit={handleSignup}
            validationSchema={validationSchema}
        >
            {({ handleChange, handleSubmit, errors, touched, values }) => (
                <View style={styles.mainContainer}>
                    <LinearGradient
                        colors={['#0A1E3D', '#6A9E3B']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 3 }}
                        style={styles.upperContainer}
                    >
                        <Text style={styles.Signup_Heading}>Create Account</Text>
                        <Text style={styles.Signup_Text}>Create an account so you can socially connect with each other</Text>
                    </LinearGradient>

                    <View style={styles.lowerContainer}>
                        <TextInput
                            placeholder="Name"
                            style={styles.inputField}
                            onChangeText={handleChange('name')}
                            value={values.name}
                        />
                        {touched.name && errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

                        <TextInput
                            placeholder="Email"
                            style={styles.inputField}
                            keyboardType="email-address"
                            onChangeText={handleChange('email')}
                            value={values.email}
                        />
                        {touched.email && errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

                        <TextInput
                            placeholder="Password"
                            style={styles.inputField}
                            secureTextEntry
                            onChangeText={handleChange('password')}
                            value={values.password}
                        />
                        {touched.password && errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

                        <TextInput
                            placeholder="Confirm Password"
                            style={styles.inputField}
                            secureTextEntry
                            onChangeText={handleChange('confirmPassword')}
                            value={values.confirmPassword}
                        />
                        {touched.confirmPassword && errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

                        <TouchableOpacity style={styles.signupButton} onPress={handleSubmit}>
                            <LinearGradient
                                colors={['#80C255', '#6A9E3B']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.gradientButtonBackground}
                            >
                                <Text style={styles.buttonText}>Sign Up</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginRedirect}>
                            <Text style={styles.loginText}>Already have an account? <Text style={styles.loginLink}>Login</Text></Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </Formik>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#F9F9F9',
    },
    upperContainer: {
        flex: 0.7,
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingLeft: 20,
        paddingTop: 50,
    },
    Signup_Heading: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    Signup_Text: {
        fontSize: 15,
        fontWeight: '500',
        color: '#FFFFFF',
        marginTop: 20,
        marginLeft: 10,
    },
    lowerContainer: {
        flex: 2,
        padding: 20,
        backgroundColor: '#FFFFFF',
    },
    inputField: {
        borderColor: '#D1D1D1',
        borderWidth: 1,
        borderRadius: 10,
        paddingLeft: 16,
        paddingVertical: 15,
        marginTop: 20,
        fontSize: 16,
    },
    signupButton: {
        marginTop: 30,
        width: '100%',
    },
    gradientButtonBackground: {
        borderRadius: 15,
        paddingVertical: 17,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    errorText: {
        color: 'red',
        fontSize: 14,
        marginBottom: 10,
    },
    loginRedirect: {
        marginTop: 20,
        alignItems: 'center',
    },
    loginText: {
        fontSize: 14,
        color: '#000000',
    },
    loginLink: {
        color: '#80C255',
        fontWeight: 'bold',
    },
});

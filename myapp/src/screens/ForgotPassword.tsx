import React from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import * as Yup from 'yup';
import { Formik } from 'formik';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type ForgotPasswordProps = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

const validationSchema = Yup.object().shape({
    email: Yup.string().email('Invalid Email').required('Email is Required'),
});

const ForgotPassword = ({ navigation }: ForgotPasswordProps) => {
    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <Formik
                    initialValues={{ email: '' }}
                    onSubmit={(values) => {
                        console.log('Forgot Password Request Sent:', values);
                        Alert.alert('Password reset link sent to your email.');
                        navigation.navigate('Login', { email: '', password: '' });
                    }}
                    validationSchema={validationSchema}
                >
                    {({ handleSubmit, errors, touched, handleChange, handleBlur, values }) => (
                        <View style={styles.mainContainer}>
                            <LinearGradient
                                colors={['#0A1E3D', '#6A9E3B']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 3 }}
                                style={styles.upperContainer}
                            >
                                <Text style={styles.heading}>Forgot Password</Text>
                                <Text style={styles.subheading}>Have you forgotten your password?</Text>
                            </LinearGradient>

                            <View style={styles.lowerContainer}>
                                <TextInput
                                    placeholder="Enter your Email"
                                    keyboardType="email-address"
                                    style={styles.inputField}
                                    onChangeText={handleChange('email')}
                                    onBlur={handleBlur('email')}
                                    value={values.email}
                                />
                                {touched.email && errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

                                <TouchableOpacity style={styles.fullButtonContainer} onPress={() => handleSubmit()}>
                                    <LinearGradient
                                        colors={['#80C255', '#6A9E3B']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.gradientButtonBackground}
                                    >
                                        <Text style={styles.buttonText}>Send Reset Link</Text>
                                    </LinearGradient>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                    <Text style={styles.forgotPassword}>Back to Login</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </Formik>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#F9F9F9',
    },
    upperContainer: {
        flex: 0.2,
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingLeft: '5%',
        paddingTop: '10%',
    },
    heading: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    subheading: {
        fontSize: 15,
        fontWeight: '500',
        color: '#FFFFFF',
        marginTop: 20,
        marginLeft: 10,
    },
    lowerContainer: {
        flex: 0.6,
        paddingHorizontal: '5%',
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
        width: '100%',
    },
    fullButtonContainer: {
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
    forgotPassword: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#14448C',
        textAlign: 'right',
        paddingHorizontal: 10,
        marginTop: 15,
        textDecorationLine: 'underline',
    },
    errorText: {
        color: 'red',
        fontSize: 14,
        marginBottom: 10,
    },
});

export default ForgotPassword;

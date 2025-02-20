import React from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ScrollView,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import * as Yup from 'yup';
import { Formik } from 'formik';
import LinearGradient from 'react-native-linear-gradient';
import auth from '@react-native-firebase/auth';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RootStackParamList } from '../App';
import Toast from 'react-native-toast-message';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Icons from 'react-native-vector-icons/FontAwesome';

type HomeProps = NativeStackScreenProps<RootStackParamList, 'Login'>;

const validationSchema = Yup.object().shape({
    email: Yup.string().email('Invalid Email').required('Email is Required'),
    password: Yup.string().required('Password is Required'),
});

const Login = ({ navigation }: HomeProps) => {
    const handleLogin = async (values: { email: string; password: string }) => {
        try {
            await auth().signInWithEmailAndPassword(values.email, values.password);
            Toast.show({
                type: 'success',
                text1: '✅ Success',
                text2: 'You are successfully logged in!',
            });
            navigation.navigate('MainTabs');
        } catch (error) {
            switch (error.code) {
                case 'auth/user-not-found':
                    Toast.show({
                        type: 'error',
                        text1: '❌ Error',
                        text2: 'This email is not registered. Please sign up.',
                    });
                    break;
                case 'auth/wrong-password':
                    Toast.show({
                        type: 'error',
                        text1: '❌ Error',
                        text2: 'Incorrect password. Please try again.',
                    });
                    break;
                default:
                    Toast.show({
                        type: 'error',
                        text1: '❌ Error',
                        text2: 'An error occurred. Please try again later.',
                    });
            }
        }
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.mainContainer}>
                    <LinearGradient
                        colors={['#0A1E3D', '#6A9E3B']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 3 }}
                        style={styles.upperContainer}
                    >
                        <Text style={styles.heading}>Login into your {'\n'} Account</Text>
                        <Text style={styles.subheading}>Login into your Account</Text>
                    </LinearGradient>

                    <View style={styles.lowerContainer}>
                        <Formik
                            initialValues={{ email: '', password: '' }}
                            onSubmit={handleLogin}
                            validationSchema={validationSchema}
                        >
                            {({ handleSubmit, errors, touched, handleChange, handleBlur, values }) => (
                                <>
                                    <TextInput
                                        placeholder="Email"
                                        keyboardType="email-address"
                                        style={styles.inputField}
                                        onChangeText={handleChange('email')}
                                        onBlur={handleBlur('email')}
                                        value={values.email}
                                    />
                                    {touched.email && errors.email && (
                                        <Text style={styles.errorText}>{errors.email}</Text>
                                    )}

                                    <TextInput
                                        placeholder="Password"
                                        secureTextEntry
                                        style={styles.inputField}
                                        onChangeText={handleChange('password')}
                                        onBlur={handleBlur('password')}
                                        value={values.password}
                                    />
                                    {touched.password && errors.password && (
                                        <Text style={styles.errorText}>{errors.password}</Text>
                                    )}

                                    <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                                        <Text style={styles.forgotPassword}>Forgot Password?</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.fullButtonContainer}
                                        onPress={() => handleSubmit()}
                                    >
                                        <LinearGradient
                                            colors={['#80C255', '#6A9E3B']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            style={styles.gradientButtonBackground}
                                        >
                                            <Text style={styles.buttonText}>Login</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>

                                    <View style={{ marginTop: hp('3%') }}></View>
                                    <View style={styles.signupContainer}>
                                        <Text style={styles.signupText}>--------------------Or Login with--------------------</Text>
                                    </View>

                                    <View style={styles.socialContainer}>
                                        <TouchableOpacity style={styles.socialButton}>
                                            <Icons name="google" size={hp('3%')} color="#0F9D58" style={styles.socialIcon} />
                                            <Text style={styles.socialText}>Google</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.socialButton}>
                                            <Icon name="facebook" size={hp('3%')} color="#3b5998" style={styles.socialIcon} />
                                            <Text style={styles.socialText}>Facebook</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.signupContainer}>
                                        <Text style={styles.signupText}>
                                            Don't have an account?{' '}
                                            <Text
                                                style={styles.signupLink}
                                                onPress={() => navigation.navigate('SignUp')}
                                            >
                                                Sign Up
                                            </Text>
                                        </Text>
                                    </View>
                                </>
                            )}
                        </Formik>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
            <Toast />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#F9F9F9',
    },
    upperContainer: {
        flex: 0.7,
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingLeft: wp('5%'),
        paddingTop: hp('5%'),
    },
    heading: {
        fontSize: wp('8%'),
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    subheading: {
        fontSize: wp('4%'),
        fontWeight: '500',
        color: '#FFFFFF',
        marginTop: hp('2%'),
        marginLeft: wp('2%'),
    },
    lowerContainer: {
        flex: 2,
        padding: wp('5%'),
        backgroundColor: '#FFFFFF',
    },
    inputField: {
        borderColor: '#D1D1D1',
        borderWidth: 1,
        borderRadius: 10,
        paddingLeft: wp('4%'),
        paddingVertical: hp('2%'),
        marginTop: hp('2%'),
        fontSize: wp('4%'),
    },
    fullButtonContainer: {
        marginTop: hp('4%'),
        width: '100%',
    },
    gradientButtonBackground: {
        borderRadius: wp('4%'),
        paddingVertical: hp('2.5%'),
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: wp('4%'),
        fontWeight: 'bold',
        textAlign: 'center',
    },
    forgotPassword: {
        fontSize: wp('3.5%'),
        fontWeight: 'bold',
        color: '#14448C',
        textAlign: 'right',
        paddingHorizontal: wp('2.5%'),
        marginTop: hp('2%'),
        textDecorationLine: 'underline',
    },
    errorText: {
        color: 'red',
        fontSize: wp('3.5%'),
        marginBottom: hp('1%'),
    },
    signupContainer: {
        marginTop: hp('3%'),
        alignItems: 'center',
    },
    signupText: {
        fontSize: wp('3.5%'),
        color: '#000000',
    },
    signupLink: {
        color: '#80C255',
        fontWeight: 'bold',
    },
    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: wp('3%'),
        marginTop: hp('5%'),
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF',
        borderRadius: wp('3%'),
        paddingVertical: hp('2%'),
        paddingHorizontal: wp('5%'),
        width: wp('40%'),
        elevation: 3,
    },
    socialIcon: {
        width: wp('9%'),
        height: wp('7%'),
        marginRight: wp('2%'),
        resizeMode: 'contain',
    },
    socialText: {
        fontSize: wp('4%'),
        fontWeight: 'bold',
        color: '#000',
    },
});

export default Login;

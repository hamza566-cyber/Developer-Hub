import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import SignUp from './screens/SignUp';
import Login from './screens/Login';
import ForgotPassword from './screens/ForgotPassword';
import MainTabs from './BottomTab/MainTabs';
import About from './screens/About';
import VisitorProfile from './screens/VisitorProfile';
import ChatListScreen from './screens/ChatListScreen';
import ChatScreen from './screens/ChatScreen';


export type RootStackParamList = {
  SignUp: undefined;
  Login: { email?: string; password?: string };
  ForgotPassword: undefined;
  MainTabs:  { screen: string } | undefined;
  About:undefined;
  VisitorProfile: { userId: string };
  ChatListScreen:undefined;
  ChatScreen:{chatId: string, recipientId: string, recipientName: string};
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
        <Stack.Screen name="SignUp" component={SignUp} options={{ headerShown: false }} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ headerShown: false }} />
        <Stack.Screen name="About" component={About}options={{ headerShown: false }}/>
        <Stack.Screen name="ChatListScreen" component={ChatListScreen}options={{ headerShown: false }}/>
        <Stack.Screen name="ChatScreen" component={ChatScreen} options ={{headerShown:false}}/>
        <Stack.Screen name="VisitorProfile" component={VisitorProfile} options={{headerShown: false}}/>
        <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

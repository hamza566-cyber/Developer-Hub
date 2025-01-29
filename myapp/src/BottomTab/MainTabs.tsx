import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StyleSheet } from "react-native";
import React from "react";
import Icon from 'react-native-vector-icons/FontAwesome';

import Dashboard from '../screens/Dashboard';
import Profile from '../screens/Profile';
import Settings from '../screens/Settings';

const Tab = createBottomTabNavigator();

const MainTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: '#6A9E3B',
                tabBarInactiveTintColor: '#D1D1D1',
                tabBarShowLabel: true, // Show labels under the icons
                tabBarStyle: {
                    position: "absolute",
                    bottom: 10,
                    right: 10,
                    left: 10,
                    borderRadius: 16,
                    backgroundColor: '#f9f9f9',
                    height: 70,
                    justifyContent: 'center',
                    ...styles.shadow,
                    paddingBottom: 5,
                    alignItems: 'center', // Center the items horizontally
                    paddingTop: 5, // Ensure there’s enough space for centering vertically
                },
            }}
        >

            <Tab.Screen
                name="Profile"
                component={Profile}
                options={{
                    headerShown: false,
                    tabBarIcon: ({ color }) => (
                        <Icon name="user" size={30} color={color} />
                    ),
                    tabBarLabel: 'Profile', // Display 'Profile' under the icon
                }}
            />
             <Tab.Screen
                name="Dashboard"
                component={Dashboard}
                options={{
                    headerShown: false,
                    tabBarIcon: ({ color }) => (
                        <Icon name="home" size={30} color={color} />
                    ),
                    tabBarLabel: 'Dashboard', // Display 'Dashboard' under the icon
                }}
            />
            
            <Tab.Screen
                name="Settings"
                component={Settings}
                options={{
                    headerShown: false,
                    tabBarIcon: ({ color }) => (
                        <Icon name="gear" size={30} color={color} />
                    ),
                    tabBarLabel: 'Settings', // Display 'Settings' under the icon
                }}
            />
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    shadow: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 10,
    }
});

export default MainTabs;

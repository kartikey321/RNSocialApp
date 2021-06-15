import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import AsyncStorage from '@react-native-community/async-storage'
import SignupScreen from '../screens/SignupScreen';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const Stack = createStackNavigator();

const AuthStack = () => {
    const [isFirstLaunch, setIsFirstLaunch] = React.useState(null);
    let routeName;


    useEffect(() => {
        AsyncStorage.getItem('alreadyLaunched').then(value => {
            if (value == null) {
                AsyncStorage.setItem('alreadyLaunched', 'true');
                setIsFirstLaunch(true)
            } else {
                setIsFirstLaunch(false);
            }
        });

        GoogleSignin.configure({
            webClientId: '633837222059-gb1phn9pcsgh9in730r9o33pkf822mch.apps.googleusercontent.com',
        });

    }, []);


    if (isFirstLaunch == null) {
        return null;
    }
    else if (isFirstLaunch == true) {
        routeName = 'Onboarding';
    } else {
        routeName = 'Login';
    }

    return (
        <Stack.Navigator initialRouteName={routeName}>
            <Stack.Screen
                name='Onboarding'
                component={OnboardingScreen}
                options={{ header: () => null }}
            />
            <Stack.Screen
                name='Login'
                component={LoginScreen}
                options={{ header: () => null }} />
            <Stack.Screen name='Signup'
                component={SignupScreen} />

        </Stack.Navigator>
    );

};

export default AuthStack;

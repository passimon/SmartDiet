// App.jsx

import * as React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Import your custom screen components
import HomeScreen from './HomeScreen';
import SportScreen from './SportScreen';
import RecipeScreen from './RecipeScreen';
import LearnScreen from './LearnScreen';
import UserSettings from './UserSettings';
import FeedbackScreen from './FeedbackScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// This component renders the Bottom Tab Navigator including the Feedback screen.
function MainTabs({ navigation }) {
  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => ({
        headerRight: () => (
          <TouchableOpacity
            style={{ marginRight: 15 }}
            onPress={() => {
              // Navigate to the UserSettings screen
              navigation.navigate('UserSettings');
            }}
          >
            <MaterialCommunityIcons name="cog-outline" size={25} color="black" />
          </TouchableOpacity>
        ),
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          // Define icons for the routes using MaterialCommunityIcons.
          switch (route.name) {
            case 'Home':
              iconName = 'home-outline';
              break;
            case 'Sports':
              iconName = 'bike';
              break;
            case 'Feedback':
              iconName = 'message-outline';
              break;
            case 'Recipes':
              iconName = 'silverware-fork-knife';
              break;
            case 'Learn':
              iconName = 'book-open-page-variant';
              break;
            default:
              iconName = 'help-circle-outline';
          }
          return (
            <MaterialCommunityIcons name={iconName} size={size} color={color} />
          );
        },
        // Style active/inactive tint colors for bottom tab icons
        tabBarActiveTintColor: 'blue',
        tabBarInactiveTintColor: 'gray',
        // Additional styling for the tab bar container
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 80 : 60,
        },
      })}
    >
      {/* Define Tabs in the desired order */}
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Sports" component={SportScreen} />
      <Tab.Screen name="Feedback" component={FeedbackScreen} />
      <Tab.Screen name="Recipes" component={RecipeScreen} />
      <Tab.Screen name="Learn" component={LearnScreen} />
    </Tab.Navigator>
  );
}

// RootStack that includes both the tabs and the UserSettings screen
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="UserSettings"
          component={UserSettings}
          options={{
            title: 'User Logs',
            headerBackTitle: 'Back',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
